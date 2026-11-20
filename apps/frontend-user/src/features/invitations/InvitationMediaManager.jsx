import { CardGridSkeleton } from '@/shared/ui/LoadingState';
import MediaImage from '@/shared/ui/MediaImage';
import { feedback } from '@/shared/feedback/feedback';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Crop,
  Eye,
  FileText,
  Image as ImageIcon,
  Images,
  Layers,
  Music,
  Palette,
  RefreshCw,
  Trash2,
  Upload,
  Video,
  X,
} from 'lucide-react';
import { mediaService } from '@/features/invitations/api/mediaApi';
import { invitationService } from '@/features/invitations/api/invitationApi';
import { useBackendMessages } from '@/shared/i18n/useBackendMessages';
import { useEventWorkspace } from '@/features/events/workspace/EventContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from '@/shared/ui';
import {
  chunkBatch,
  focalPointStyle,
  invitationMediaReferences,
  MEDIA_CATEGORIES,
  MEDIA_LIFECYCLE_STAGES,
  reorderGalleryItems,
  validateLibraryFile,
} from './mediaLibraryModel';
import { resolveEventCover } from '@/features/events/model/eventCover';
import EventCover from '@/features/events/components/EventCover';
import './MediaLibrary.css';

function Preview({ file, type, title, style }) {
  if (type === 'audio') {
    return <audio controls preload="none" src={file.fileUrl} aria-label={title} />;
  }
  if (type === 'video') {
    return <video controls preload="metadata" muted src={file.fileUrl} aria-label={title} />;
  }
  return <MediaImage src={file.fileUrl} alt={title} style={style} />;
}

export default function InvitationMediaManager() {
  const { eventId, id = eventId } = useParams();
  const { text: t } = useBackendMessages('mediaWorkspace');
  const workspace = useEventWorkspace();
  const { user } = useAuth();
  const currentUserId = user?.id || user?.userId || 'anonymous';

  // Core data states
  const [library, setLibrary] = useState(null);
  const [invitation, setInvitation] = useState(null);
  const [category, setCategory] = useState('cover');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [retryTarget, setRetryTarget] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Preflight queue state (multi-file validation & staging)
  const [preflightFiles, setPreflightFiles] = useState([]);
  const [batchStatus, setBatchStatus] = useState('');

  // Local gallery order & framing states
  const [galleryOrder, setGalleryOrder] = useState(null);
  const [isReordered, setIsReordered] = useState(false);
  const [framingByMediaId, setFramingByMediaId] = useState({});

  // Inspector & modal states
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [tempFraming, setTempFraming] = useState({ x: 50, y: 50, fit: 'cover' });
  const [copyNotice, setCopyNotice] = useState(false);

  // Authority & lifecycle tracking refs
  const authorityRef = useRef({
    eventId: id,
    userId: currentUserId,
    generation: 0,
  });
  const picker = useRef(null);
  const replaceTarget = useRef(null);
  const objectUrls = useRef(new Set());
  const inspectorTrigger = useRef(null);
  const headingId = useId();

  // Keep authority ref updated on route/user transitions
  useEffect(() => {
    authorityRef.current = {
      eventId: id,
      userId: currentUserId,
      generation: authorityRef.current.generation + 1,
    };
    // Clear selections and transient modals when event or user changes
    setSelectedAsset(null);
    setInspectorOpen(false);
    setPreflightFiles([]);
    setError('');
  }, [id, currentUserId]);

  // Safe object URL manager
  const createObjectUrl = useCallback((blob) => {
    try {
      const url = URL.createObjectURL(blob);
      objectUrls.current.add(url);
      return url;
    } catch {
      return '';
    }
  }, []);

  const revokeObjectUrl = useCallback((url) => {
    if (url && objectUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrls.current.delete(url);
    }
  }, []);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  // Initial load
  useEffect(() => {
    let active = true;
    const authSnapshot = { ...authorityRef.current };

    Promise.all([mediaService.list(id), invitationService.get(id)])
      .then(([media, event]) => {
        if (
          !active ||
          authSnapshot.eventId !== authorityRef.current.eventId ||
          authSnapshot.userId !== authorityRef.current.userId
        ) {
          return;
        }
        setLibrary(media);
        setInvitation(event);
      })
      .catch((e) => {
        if (
          !active ||
          authSnapshot.eventId !== authorityRef.current.eventId ||
          authSnapshot.userId !== authorityRef.current.userId
        ) {
          return;
        }
        setError(e.message || t('failed'));
      });

    return () => {
      active = false;
    };
  }, [id, t]);

  // Synchronized refresh
  const refresh = useCallback(async () => {
    const authSnapshot = { ...authorityRef.current };
    const [media, event] = await Promise.all([mediaService.list(id), invitationService.get(id)]);

    if (
      authSnapshot.eventId !== authorityRef.current.eventId ||
      authSnapshot.userId !== authorityRef.current.userId
    ) {
      return;
    }

    setLibrary(media);
    setInvitation(event);
    setGalleryOrder(null);
    setIsReordered(false);

    workspace?.updateEvent?.({
      ...event,
      coverUrl: media.coverImage?.fileUrl || null,
      coverSource: media.coverImage ? 'owner' : 'template',
    });
  }, [id, workspace]);

  // Safe execution with authority snapshot check
  const executeSafeAction = useCallback(
    async (action, retryPayload) => {
      const authSnapshot = { ...authorityRef.current, generation: ++authorityRef.current.generation };
      setBusy(true);
      setError('');
      setProgress(0);
      setRetryTarget(null);

      try {
        await action(authSnapshot);
        if (
          authSnapshot.eventId !== authorityRef.current.eventId ||
          authSnapshot.userId !== authorityRef.current.userId ||
          authSnapshot.generation !== authorityRef.current.generation
        ) {
          return;
        }
        await refresh();
        toast(t('saved'));
      } catch (e) {
        if (
          authSnapshot.eventId !== authorityRef.current.eventId ||
          authSnapshot.userId !== authorityRef.current.userId ||
          authSnapshot.generation !== authorityRef.current.generation
        ) {
          return;
        }
        setError(e.message || t('failed'));
        if (retryPayload) {
          setRetryTarget({ ...retryPayload, eventId: id, userId: currentUserId });
        }
        feedback.explain(e, {
          event: workspace,
          permission: 'MANAGE_INVITATION',
          feature: category === 'video' ? 'PRE_WEDDING_VIDEO' : undefined,
        });
      } finally {
        if (
          authSnapshot.eventId === authorityRef.current.eventId &&
          authSnapshot.userId === authorityRef.current.userId &&
          authSnapshot.generation === authorityRef.current.generation
        ) {
          setBusy(false);
          setBatchStatus('');
        }
      }
    },
    [id, currentUserId, refresh, t, workspace, category]
  );

  const config = MEDIA_CATEGORIES[category] || MEDIA_CATEGORIES.cover;
  const rawRecords = (Array.isArray(library?.[config.field])
    ? library[config.field]
    : [library?.[config.field]]
  ).filter(Boolean);

  const records = category === 'gallery' && galleryOrder ? galleryOrder : rawRecords;
  const references = invitationMediaReferences(invitation);

  const isLocalDraft = Boolean(
    !id || (typeof id === 'string' && (id.startsWith('wed-') || !/^\d+$/.test(id)))
  );

  // Trigger file picker
  const choose = (target) => {
    replaceTarget.current = target || null;
    if (picker.current) {
      picker.current.multiple = category === 'gallery' && !target;
      picker.current.click();
    }
  };

  // Stage files through validation
  const stageFiles = (files) => {
    if (!files || !files.length) return;
    setError('');

    const staged = files.map((file, idx) => {
      const failure = validateLibraryFile(file, category);
      const previewUrl = file.type.startsWith('image/') ? createObjectUrl(file) : '';
      return {
        id: `staged-${Date.now()}-${idx}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        previewUrl,
        error: failure ? t(failure, { limit: config.limit }) : '',
        status: failure ? MEDIA_LIFECYCLE_STAGES.FAILED : MEDIA_LIFECYCLE_STAGES.QUEUED,
      };
    });

    const target = replaceTarget.current;
    // For single replacement or single non-gallery upload, immediately proceed to execution
    if (target || (staged.length === 1 && !staged[0].error && category !== 'gallery')) {
      const fileToUpload = staged[0].file;
      if (staged[0].error) {
        setError(staged[0].error);
        return;
      }
      const onProgress = (e) => {
        if (e?.total) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
          if (pct >= 100) setBatchStatus(t('batchFinalizing'));
        }
      };

      if (target) {
        executeSafeAction(
          () => mediaService.replace(id, target.id, fileToUpload, onProgress),
          { type: 'replace', targetId: target.id, file: fileToUpload }
        );
      } else {
        const uploader = {
          cover: () => mediaService.uploadCover(id, fileToUpload, onProgress),
          video: () => mediaService.uploadVideo(id, fileToUpload, onProgress),
          music: () => mediaService.uploadMusic(id, fileToUpload, onProgress),
          ticket: () => mediaService.uploadTicketImage(id, fileToUpload, onProgress),
          preWeddingVideo: () => mediaService.uploadPreWeddingVideo(id, fileToUpload, onProgress),
        }[category];
        if (uploader) {
          executeSafeAction(uploader, { type: 'upload', category, file: fileToUpload });
        }
      }
      return;
    }

    // For multiple files or gallery drops, add to preflight queue
    setPreflightFiles((prev) => [...prev, ...staged]);
  };

  // Execute batch upload from preflight queue
  const processBatchUpload = async () => {
    const validItems = preflightFiles.filter((item) => !item.error);
    if (!validItems.length) return;

    const batches = chunkBatch(validItems, 5);
    const totalFiles = validItems.length;
    let uploadedCount = 0;
    const failedFiles = [];

    setBusy(true);
    setError('');

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const currentBatch = batches[batchIdx];
      const filesInBatch = currentBatch.map((item) => item.file);
      setBatchStatus(t('batchUploading', { current: batchIdx + 1, total: batches.length }));

      try {
        const onProgress = (e) => {
          if (e?.total) {
            const batchPct = e.loaded / e.total;
            const overallPct = Math.round(
              ((uploadedCount + batchPct * filesInBatch.length) / totalFiles) * 100
            );
            setProgress(overallPct);
            if (overallPct >= 100) setBatchStatus(t('batchFinalizing'));
          }
        };

        await mediaService.uploadGallery(id, filesInBatch, undefined, onProgress);
        uploadedCount += filesInBatch.length;
        currentBatch.forEach((item) => revokeObjectUrl(item.previewUrl));
        setPreflightFiles((current) =>
          current.filter((item) => !currentBatch.some((b) => b.id === item.id))
        );
      } catch (err) {
        failedFiles.push(...currentBatch);
        setError(err.message || t('failed'));
        break;
      }
    }

    setBusy(false);
    setBatchStatus('');
    setProgress(0);

    if (uploadedCount > 0) {
      await refresh();
      toast(t('saved'));
    }

    if (failedFiles.length > 0 && uploadedCount > 0) {
      toast(
        t('batchPartialSuccess', { success: uploadedCount, failed: failedFiles.length }),
        'warning'
      );
    }
  };

  const removePreflightItem = (itemId) => {
    setPreflightFiles((current) => {
      const target = current.find((item) => item.id === itemId);
      if (target?.previewUrl) revokeObjectUrl(target.previewUrl);
      return current.filter((item) => item.id !== itemId);
    });
  };

  const clearPreflightQueue = () => {
    preflightFiles.forEach((item) => revokeObjectUrl(item.previewUrl));
    setPreflightFiles([]);
  };

  // Reorder gallery items
  const handleMoveGalleryItem = (currentIndex, direction) => {
    const targetIndex = currentIndex + direction;
    const currentList = records;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const reordered = reorderGalleryItems(currentList, currentIndex, targetIndex);
    setGalleryOrder(reordered);
    setIsReordered(true);
  };

  // Inspector handlers
  const openInspector = (asset, triggerElement) => {
    inspectorTrigger.current = triggerElement;
    setSelectedAsset(asset);
    const existing = framingByMediaId[asset.id] || { x: 50, y: 50, fit: 'cover' };
    setTempFraming(existing);
    setInspectorOpen(true);
  };

  const closeInspector = () => {
    setInspectorOpen(false);
    setSelectedAsset(null);
    setCopyNotice(false);
    if (inspectorTrigger.current) {
      inspectorTrigger.current.focus({ preventScroll: true });
    }
  };

  const applyFraming = () => {
    if (!selectedAsset) return;
    setFramingByMediaId((prev) => ({
      ...prev,
      [selectedAsset.id]: tempFraming,
    }));
    toast(t('focalSavedNotice'));
    closeInspector();
  };

  const setAsCoverImage = async (asset) => {
    if (!asset?.fileUrl) return;
    try {
      setBusy(true);
      await invitationService.update(id, {
        coverUrl: asset.fileUrl,
        coverImageUrl: asset.fileUrl,
      });
      await refresh();
      toast(t('setCoverSuccess'));
      closeInspector();
    } catch (err) {
      setError(err.message || t('failed'));
    } finally {
      setBusy(false);
    }
  };

  const copyAssetUrl = (url) => {
    if (!url) return;
    navigator.clipboard?.writeText(url).then(() => {
      setCopyNotice(true);
      setTimeout(() => setCopyNotice(false), 2000);
    });
  };

  // Drop zone events
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!busy) setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) {
      // If gallery, check if single file to match existing single-file drop tests
      if (category === 'gallery' && files.length === 1 && !replaceTarget.current) {
        const failure = validateLibraryFile(files[0], category);
        if (failure) {
          setError(t(failure, { limit: config.limit }));
          return;
        }
        const onProgress = (evt) => {
          if (evt?.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        };
        executeSafeAction(
          () => mediaService.uploadGallery(id, [files[0]], undefined, onProgress),
          { type: 'upload', category: 'gallery', file: files[0] }
        );
        return;
      }
      stageFiles(files);
    }
  };

  const handleFilePickerChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length) {
      if (category === 'gallery' && files.length === 1 && !replaceTarget.current) {
        const failure = validateLibraryFile(files[0], category);
        if (failure) {
          setError(t(failure, { limit: config.limit }));
          return;
        }
        const onProgress = (evt) => {
          if (evt?.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        };
        executeSafeAction(
          () => mediaService.uploadGallery(id, [files[0]], undefined, onProgress),
          { type: 'upload', category: 'gallery', file: files[0] }
        );
        return;
      }
      stageFiles(files);
    }
  };

  const resolvedCover = resolveEventCover(invitation || {});
  const coverReference = ['owner', 'invitation'].includes(resolvedCover.source);
  const coverArtwork = resolvedCover.url;
  const isCoverInUse = category === 'cover' && records.some((file) => references.has(file.fileUrl));

  const validPreflightCount = preflightFiles.filter((item) => !item.error).length;

  return (
    <main className="media-library workspace-page" aria-busy={busy} aria-labelledby={headingId}>
      {/* Atelier Header */}
      <header className="atelier-header">
        <div className="atelier-header-top">
          <div className="atelier-badge-title">
            <span className="atelier-badge">
              <Layers size={13} aria-hidden="true" />
              {t('atelierBadge')}
            </span>
            <h1 id={headingId}>{t('title')}</h1>
          </div>
          <div className="atelier-header-actions">
            <Link className="workspace-button" to={`/app/events/${id}/preview`}>
              <Eye size={18} aria-hidden="true" />
              {t('preview')}
            </Link>
            <Link className="workspace-button" to={`/app/events/${id}/invitation`}>
              <Palette size={18} aria-hidden="true" />
              {t('studio')}
            </Link>
          </div>
        </div>
        <p className="atelier-header-desc">{t('atelierSubtitle')}</p>
      </header>

      {/* Error & Retry Banner */}
      {error && (
        <div className="workspace-notice" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div style={{ flex: 1 }}>{error}</div>
          <button
            type="button"
            className="workspace-button"
            disabled={busy}
            onClick={() => {
              if (retryTarget && retryTarget.eventId === id) {
                if (retryTarget.type === 'replace') {
                  executeSafeAction(() =>
                    mediaService.replace(id, retryTarget.targetId, retryTarget.file)
                  );
                } else if (retryTarget.type === 'upload') {
                  stageFiles([retryTarget.file]);
                } else {
                  refresh();
                }
              } else {
                refresh();
              }
            }}
          >
            <RefreshCw size={14} aria-hidden="true" />
            {t('retry')}
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {!library && !error && <CardGridSkeleton variant="gallery" label={t('loading')} />}

      {/* Category Navigation Tabs */}
      <div
        className="workspace-tabs atelier-tabs"
        role="group"
        aria-label={t('categories')}
      >
        {[
          ['cover', Images, t('cover')],
          ['gallery', ImageIcon, t('gallery')],
          ['video', Video, t('video')],
          ['music', Music, t('music')],
        ].map(([key, Icon, label]) => {
          const count =
            key === 'gallery'
              ? Array.isArray(library?.galleryImages)
                ? library.galleryImages.length
                : 0
              : library?.[MEDIA_CATEGORIES[key].field]
              ? 1
              : 0;
          return (
            <button
              type="button"
              key={key}
              aria-pressed={key === category}
              disabled={busy}
              onClick={() => {
                setCategory(key);
                setError('');
                setPreflightFiles([]);
              }}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              {library && count > 0 && <span className="atelier-tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Main Section */}
      <section
        className={`workspace-section atelier-section ${dragOver ? 'is-dragover' : ''}`}
        aria-label={t(category)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Section Controls & Limits Bar */}
        <div className="atelier-toolbar">
          <div className="atelier-toolbar-info">
            <h2>{t(category)}</h2>
            <div className="atelier-toolbar-meta">
              <span className="atelier-meta-pill">
                {t('formats', {
                  formats: config.extensions.join(', ').toUpperCase(),
                  limit: config.limit,
                })}
              </span>
              {category === 'gallery' && (
                <span className="atelier-meta-pill highlight">
                  {t('slotLimitNotice', { count: records.length })}
                </span>
              )}
              {isLocalDraft && (
                <span className="atelier-meta-pill highlight">
                  {t('statusLocalDraft')}
                </span>
              )}
            </div>
          </div>

          <div className="atelier-toolbar-actions">
            {isCoverInUse ? (
              <Link className="workspace-button" to={`/app/events/${id}/invitation`}>
                <Palette size={16} aria-hidden="true" />
                {t('editInStudio')}
              </Link>
            ) : (
              <button
                type="button"
                className="workspace-button primary"
                disabled={busy || !library}
                onClick={() => choose(null)}
              >
                <Upload size={18} aria-hidden="true" />
                {t(category === 'gallery' ? 'uploadImages' : 'upload')}
              </button>
            )}
          </div>
        </div>

        {/* Hidden Native File Input */}
        <input
          ref={picker}
          hidden
          type="file"
          accept={config.accept}
          multiple={category === 'gallery'}
          aria-label={t('upload')}
          onChange={handleFilePickerChange}
        />

        {/* Preflight Staging Panel */}
        {preflightFiles.length > 0 && (
          <div className="media-preflight-panel" role="region" aria-label={t('preflightTitle')}>
            <div className="preflight-header">
              <h3>
                <CheckCircle2 size={18} aria-hidden="true" />
                {t('preflightTitle')} ({validPreflightCount} / {preflightFiles.length})
              </h3>
              <button
                type="button"
                className="media-btn-sm"
                onClick={clearPreflightQueue}
                disabled={busy}
              >
                {t('clearQueue')}
              </button>
            </div>
            <p className="framing-hint" style={{ marginBottom: '14px' }}>
              {t('preflightHint')}
            </p>

            <div className="preflight-grid">
              {preflightFiles.map((item) => (
                <div
                  key={item.id}
                  className={`preflight-item ${item.error ? 'has-error' : ''}`}
                >
                  {item.previewUrl ? (
                    <img src={item.previewUrl} alt="" className="preflight-thumb" />
                  ) : (
                    <div className="preflight-thumb">
                      <FileText size={18} aria-hidden="true" />
                    </div>
                  )}
                  <div className="preflight-info">
                    <span className="preflight-name" title={item.name}>
                      {item.name}
                    </span>
                    <span className="preflight-meta">
                      {(item.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {item.error && <span className="preflight-error">{item.error}</span>}
                  </div>
                  <button
                    type="button"
                    className="preflight-remove-btn"
                    onClick={() => removePreflightItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="preflight-actions">
              <button
                type="button"
                className="workspace-button primary"
                disabled={busy || validPreflightCount === 0}
                onClick={processBatchUpload}
              >
                <Upload size={16} aria-hidden="true" />
                {t('startBatchUpload', { count: validPreflightCount })}
              </button>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {busy && (
          <div className="media-upload-progress" role="status" aria-live="polite">
            <div className="upload-progress-text">
              <span>{batchStatus || t('uploading', { progress })}</span>
              <span>{progress}%</span>
            </div>
            <progress
              max="100"
              value={progress}
              aria-label={t('uploadProgress')}
            />
          </div>
        )}

        {/* Reorder Notice Bar */}
        {isReordered && category === 'gallery' && (
          <div className="reorder-notice-bar" role="status">
            <span>{t('reorderNotice')}</span>
            <Link className="workspace-button primary" to={`/app/events/${id}/invitation`}>
              <Palette size={16} aria-hidden="true" />
              {t('studio')}
            </Link>
          </div>
        )}

        {/* Media Asset Grid */}
        {library && records.length > 0 ? (
          <div className="media-library-grid" role="region" aria-label={t('categories')}>
            {records.map((file, idx) => {
              const inUse = references.has(file.fileUrl);
              const framing = framingByMediaId[file.id];
              const customStyle = framing
                ? focalPointStyle(framing, framing.fit)
                : undefined;
              const isSelected = selectedAsset?.id === file.id;

              return (
                <article
                  className={`media-asset ${isSelected ? 'is-selected' : ''}`}
                  key={file.id || idx}
                >
                  <div className="media-asset-preview">
                    <Preview
                      file={file}
                      type={config.type}
                      title={file.originalFilename || t(category)}
                      style={customStyle}
                    />

                    {inUse && (
                      <span className="media-asset-tag in-use">
                        {t('statusInUse')}
                      </span>
                    )}
                    {category === 'gallery' && file.fileUrl === invitation?.coverUrl && (
                      <span className="media-asset-tag cover-tag">
                        {t('cover')}
                      </span>
                    )}
                    {category === 'gallery' && (
                      <span className="media-asset-reorder-badge" aria-hidden="true">
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  <div className="media-asset-body">
                    <h3>{file.originalFilename || t(category)}</h3>
                    <div className="media-asset-meta">
                      <span>{file.mimeType || config.type}</span>
                      {file.fileSize != null && (
                        <span>· {(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                    </div>

                    <div className="media-asset-actions">
                      {category === 'gallery' && (
                        <>
                          <button
                            type="button"
                            className="media-btn-sm"
                            title={t('moveEarlier')}
                            aria-label={`${t('moveEarlier')} (${file.originalFilename || idx + 1})`}
                            disabled={busy || idx === 0}
                            onClick={() => handleMoveGalleryItem(idx, -1)}
                          >
                            <ArrowLeft size={14} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="media-btn-sm"
                            title={t('moveLater')}
                            aria-label={`${t('moveLater')} (${file.originalFilename || idx + 1})`}
                            disabled={busy || idx === records.length - 1}
                            onClick={() => handleMoveGalleryItem(idx, 1)}
                          >
                            <ArrowRight size={14} aria-hidden="true" />
                          </button>
                        </>
                      )}

                      {config.type === 'image' && (
                        <button
                          type="button"
                          className="media-btn-sm"
                          onClick={(e) => openInspector(file, e.currentTarget)}
                        >
                          <Crop size={14} aria-hidden="true" />
                          {t('focalPoint')}
                        </button>
                      )}

                      <button
                        type="button"
                        className="media-btn-sm"
                        disabled={busy}
                        onClick={() => choose(file)}
                      >
                        {t('replace')}
                      </button>

                      <button
                        type="button"
                        className="media-btn-sm danger"
                        disabled={busy}
                        onClick={async () => {
                          const confirmed = await feedback.confirm({
                            message: inUse
                              ? `${t('confirmRemove')} (${t('inUse')})`
                              : t('confirmRemove'),
                            destructive: true,
                          });
                          if (confirmed) {
                            executeSafeAction(
                              () => mediaService.remove(id, file.id),
                              { type: 'remove', fileId: file.id }
                            );
                          }
                        }}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : library && category === 'cover' && coverArtwork ? (
          <div className="media-reference-card">
            <EventCover event={invitation || {}} alt={t('reference')} />
            <div>
              <h3>{t(coverReference ? 'savedDesign' : 'templateArtwork')}</h3>
              <p>{t(coverReference ? 'savedDesignHint' : 'templateHint')}</p>
              <Link className="workspace-button primary" to={`/app/events/${id}/invitation`}>
                <Palette size={16} aria-hidden="true" />
                {t('editInStudio')}
              </Link>
            </div>
          </div>
        ) : library ? (
          <div className="atelier-empty">
            <div className="atelier-empty-icon">
              <Images size={28} aria-hidden="true" />
            </div>
            <h2>{t('empty')}</h2>
            <p>{t('emptyHint')}</p>
            <button
              type="button"
              className="workspace-button primary"
              disabled={busy}
              onClick={() => choose(null)}
              style={{ marginTop: '8px' }}
            >
              <Upload size={18} aria-hidden="true" />
              {t(category === 'gallery' ? 'uploadImages' : 'upload')}
            </button>
          </div>
        ) : null}
      </section>

      {/* Asset Inspector & Framing Modal */}
      {inspectorOpen && selectedAsset && (
        <div
          className="media-inspector-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inspector-heading"
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeInspector();
          }}
        >
          <div className="media-inspector-panel">
            <div className="inspector-header">
              <h2 id="inspector-heading">{t('assetDetails')}</h2>
              <button
                type="button"
                className="inspector-close-btn"
                onClick={closeInspector}
                aria-label={t('closeInspector')}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="inspector-body">
              {/* Interactive Preview Box */}
              <div
                className="inspector-preview-box"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                  setTempFraming((prev) => ({ ...prev, x: clickX, y: clickY }));
                }}
                style={{ cursor: 'crosshair' }}
                title="Click image to position focal point"
              >
                <img
                  src={selectedAsset.fileUrl}
                  alt={selectedAsset.originalFilename || ''}
                  style={focalPointStyle(tempFraming, tempFraming.fit)}
                />
                <div
                  className="inspector-focal-target"
                  style={{ left: `${tempFraming.x}%`, top: `${tempFraming.y}%` }}
                />
              </div>

              {/* Framing Controls */}
              <div className="inspector-framing-section">
                <h3 className="framing-title">{t('focalPoint')}</h3>
                <p className="framing-hint">{t('focalPointHint')}</p>

                <div className="framing-sliders">
                  <div className="framing-slider-row">
                    <label htmlFor="focal-x-slider">{t('focalX')}:</label>
                    <input
                      id="focal-x-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={tempFraming.x}
                      onChange={(e) =>
                        setTempFraming((prev) => ({ ...prev, x: Number(e.target.value) }))
                      }
                    />
                    <span>{tempFraming.x}%</span>
                  </div>

                  <div className="framing-slider-row">
                    <label htmlFor="focal-y-slider">{t('focalY')}:</label>
                    <input
                      id="focal-y-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={tempFraming.y}
                      onChange={(e) =>
                        setTempFraming((prev) => ({ ...prev, y: Number(e.target.value) }))
                      }
                    />
                    <span>{tempFraming.y}%</span>
                  </div>
                </div>

                <div className="framing-fit-row">
                  <button
                    type="button"
                    className="framing-fit-btn"
                    aria-pressed={tempFraming.fit === 'cover'}
                    onClick={() => setTempFraming((prev) => ({ ...prev, fit: 'cover' }))}
                  >
                    {t('fitCover')}
                  </button>
                  <button
                    type="button"
                    className="framing-fit-btn"
                    aria-pressed={tempFraming.fit === 'contain'}
                    onClick={() => setTempFraming((prev) => ({ ...prev, fit: 'contain' }))}
                  >
                    {t('fitContain')}
                  </button>
                </div>

                <div className="framing-actions">
                  <button
                    type="button"
                    className="media-btn-sm"
                    onClick={() => setTempFraming({ x: 50, y: 50, fit: 'cover' })}
                  >
                    {t('resetFocal')}
                  </button>
                  <button
                    type="button"
                    className="workspace-button primary"
                    onClick={applyFraming}
                  >
                    <Check size={14} aria-hidden="true" />
                    {t('applyFocal')}
                  </button>
                </div>
              </div>

              {/* Asset Metadata List */}
              <div className="inspector-meta-list">
                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">{t('filename')}</span>
                  <span className="inspector-meta-val">{selectedAsset.originalFilename || '—'}</span>
                </div>
                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">{t('mediaType')}</span>
                  <span className="inspector-meta-val">{selectedAsset.mimeType || selectedAsset.mediaType || '—'}</span>
                </div>
                {selectedAsset.fileSize && (
                  <div className="inspector-meta-row">
                    <span className="inspector-meta-label">{t('fileSize')}</span>
                    <span className="inspector-meta-val">
                      {(selectedAsset.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
                <div className="inspector-meta-row">
                  <span className="inspector-meta-label">{t('status')}</span>
                  <span className="inspector-meta-val">
                    {isLocalDraft || selectedAsset?.fileUrl?.startsWith('blob:')
                      ? t('statusLocalDraft')
                      : references.has(selectedAsset?.fileUrl)
                        ? t('statusInUse')
                        : t('statusConfirmed')}
                  </span>
                </div>
              </div>

              {/* Inspector Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {category === 'gallery' && (
                  <button
                    type="button"
                    className="workspace-button"
                    disabled={busy || selectedAsset.fileUrl === invitation?.coverUrl}
                    onClick={() => setAsCoverImage(selectedAsset)}
                  >
                    <ImageIcon size={16} aria-hidden="true" />
                    {t('setAsCover')}
                  </button>
                )}
                <button
                  type="button"
                  className="workspace-button"
                  onClick={() => copyAssetUrl(selectedAsset.fileUrl)}
                >
                  {copyNotice ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                  {copyNotice ? t('saved') : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
