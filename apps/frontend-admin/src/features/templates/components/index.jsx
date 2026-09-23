function FileField({ label, value, onChange, onUpload, accept = "image/*" }) {
  return (
    <div className="space-y-2 rounded-xl border border-zinc-800 p-3">
      <label className="block text-xs font-semibold text-zinc-300">{label}</label>
      <input className="h-9 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-200" value={value || ""} onChange={(event) => onChange(event.target.value)} />
      <input type="file" accept={accept} onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} className="text-xs text-zinc-400" />
    </div>
  );
}

export function TemplateCoverSection(props) {
  return <FileField label="Cover image" value={props.coverImage} onChange={props.onCoverChange} onUpload={props.onUploadCover} />;
}

export function TemplateGallerySection({ galleryImages = [], newGalleryUrl, onNewGalleryUrlChange, onAddGalleryImage, onUploadGalleryFiles, onUpdateImage, onRemoveImage }) {
  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 p-3">
      <label className="block text-xs font-semibold text-zinc-300">Gallery images</label>
      <div className="flex gap-2"><input className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-200" value={newGalleryUrl || ""} onChange={(event) => onNewGalleryUrlChange(event.target.value)} /><button type="button" onClick={onAddGalleryImage}>Add</button></div>
      <input type="file" accept="image/*" multiple onChange={(event) => onUploadGalleryFiles(event.target.files)} className="text-xs text-zinc-400" />
      {galleryImages.map((image, index) => <div key={`${image}-${index}`} className="flex gap-2"><input className="min-w-0 flex-1 bg-zinc-900 px-2 text-xs text-zinc-200" value={image} onChange={(event) => onUpdateImage(index, event.target.value)} /><button type="button" onClick={() => onRemoveImage(index)}>Remove</button></div>)}
    </div>
  );
}

export function TemplateQrSection(props) {
  return <FileField label="Gift QR image" value={props.qrGiftUrl} onChange={props.onQrChange} onUpload={props.onUploadQr} />;
}