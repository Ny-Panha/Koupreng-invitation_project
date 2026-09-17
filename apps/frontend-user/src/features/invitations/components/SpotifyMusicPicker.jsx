import { useState, useRef, useEffect } from "react";
import { FaSpotify } from "react-icons/fa6";
import {
    IoCheckmark,
    IoChevronDown,
    IoMusicalNotes,
    IoPause,
    IoPlay,
    IoSearchOutline,
    IoVolumeMuteOutline,
} from "react-icons/io5";
import { useClickOutside } from "../../../shared/hooks/useClickOutside";
import { MUSIC_TRACKS } from "../../../shared/data/musicTracks";
import "./SpotifyMusicPicker.css";

const TRACK_METADATA = {
    "waiting-day": {
        artist: "VannDa",
        sub: "មនោសញ្ចេតនាពិធីការ • 4:48",
        coverClass: "cover-1",
        icon: IoMusicalNotes,
    },
    "instrumental-wedding": {
        artist: "VioSounds Cover",
        sub: "ភ្លេងវីយូឡុងកក់ក្ដៅ • 3:25",
        coverClass: "cover-2",
        icon: IoMusicalNotes,
    },
    "none": {
        artist: "បិទសំឡេង",
        sub: "គ្មានតន្ត្រី Background",
        coverClass: "cover-none",
        icon: IoVolumeMuteOutline,
    },
};

export function SpotifyMusicPicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [previewTrackId, setPreviewTrackId] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    const containerRef = useRef(null);

    useClickOutside(containerRef, () => {
        setIsOpen(false);
        setSearchQuery("");
    });

    const selectedTrack = MUSIC_TRACKS.find((t) => t.id === value) || MUSIC_TRACKS[0];
    const selectedMeta = TRACK_METADATA[selectedTrack.id] || TRACK_METADATA["waiting-day"];
    const SelectedIcon = selectedMeta.icon;

    const filteredTracks = MUSIC_TRACKS.filter((track) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const meta = TRACK_METADATA[track.id] || {};
        return (
            track.name.toLowerCase().includes(q) ||
            (meta.artist && meta.artist.toLowerCase().includes(q)) ||
            (meta.sub && meta.sub.toLowerCase().includes(q))
        );
    });

    // Handle play/pause preview
    const togglePreview = (track, e) => {
        if (e) e.stopPropagation();
        if (!track.url) return;

        if (previewTrackId === track.id) {
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
            } else {
                audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
        } else {
            setPreviewTrackId(track.id);
            if (audioRef.current) {
                audioRef.current.src = track.url;
                audioRef.current.load();
                audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
            }
        }
    };

    // Clean up audio on unmount
    useEffect(() => {
        const audio = audioRef.current;
        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, []);

    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
        }
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const isSelectedPlaying = (previewTrackId === selectedTrack.id || (previewTrackId === null && selectedTrack.url)) && isPlaying;
    const activePreviewTrack = MUSIC_TRACKS.find((t) => t.id === previewTrackId);

    return (
        <div ref={containerRef} className="spotify-picker-container">
            {/* Hidden Audio Element for Preview */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
            />

            {/* Header */}
            <div className="spotify-picker-header">
                <div className="spotify-brand">
                    <FaSpotify />
                    <span>តន្ត្រីសាវតារ (Spotify Music)</span>
                </div>
                <div className={`spotify-status-pill ${value === "none" ? "muted" : ""}`}>
                    {value === "none" ? "មិនប្រើតន្ត្រី" : `កំពុងប្រើ: ${selectedTrack.name}`}
                </div>
            </div>

            {/* Selected Active Track Banner (Always visible, click to open/close) */}
            <div
                className={`spotify-selected-banner ${isOpen ? "is-open" : ""}`}
                onClick={() => setIsOpen((prev) => !prev)}
                role="button"
                tabIndex={0}
            >
                {/* Album Artwork with Play button */}
                <div className={`spotify-album-art ${selectedMeta.coverClass}`}>
                    <SelectedIcon className="spotify-album-icon" />
                    {selectedTrack.url && (
                        <button
                            type="button"
                            className={`spotify-play-btn ${isSelectedPlaying ? "is-active" : ""}`}
                            onClick={(e) => togglePreview(selectedTrack, e)}
                            title={isSelectedPlaying ? "Pause Preview" : "Play Preview"}
                        >
                            {isSelectedPlaying ? <IoPause /> : <IoPlay style={{ marginLeft: "2px" }} />}
                        </button>
                    )}
                </div>

                {/* Track Details */}
                <div className="spotify-track-info">
                    <div className="spotify-track-title">{selectedTrack.name}</div>
                    <div className="spotify-track-artist">
                        {selectedMeta.artist} • {selectedMeta.sub}
                    </div>
                </div>

                {/* Animated Equalizer Wave (when selected track is playing) */}
                {isSelectedPlaying && (
                    <div className="spotify-equalizer" title="កំពុងលេង...">
                        <div className="spotify-eq-bar" />
                        <div className="spotify-eq-bar" />
                        <div className="spotify-eq-bar" />
                        <div className="spotify-eq-bar" />
                    </div>
                )}

                {/* Change Track Action Button */}
                <button
                    type="button"
                    className="spotify-change-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen((prev) => !prev);
                    }}
                >
                    <span>{isOpen ? "បិទ" : "ប្តូរបទ"}</span>
                    <IoChevronDown
                        style={{
                            transform: isOpen ? "rotate(180deg)" : "none",
                            transition: "transform 0.2s ease",
                        }}
                    />
                </button>
            </div>

            {/* Dropdown Track List (Shown ONLY when open, auto-closes on select) */}
            {isOpen && (
                <div style={{ marginTop: "10px" }}>
                    {/* Live Search Bar for many songs */}
                    <div className="spotify-search-wrap">
                        <IoSearchOutline className="spotify-search-icon" />
                        <input
                            type="text"
                            className="spotify-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ស្វែងរកបទចម្រៀង ឬអ្នកច្រៀង..."
                            autoFocus
                        />
                    </div>

                    <div className="spotify-track-list">
                        {filteredTracks.length === 0 ? (
                            <div className="spotify-no-result">
                                មិនមានបទចម្រៀងត្រូវនឹង "{searchQuery}" ទេ
                            </div>
                        ) : (
                            filteredTracks.map((track) => {
                                const isSelected = value === track.id;
                                const isCurrentPreview = previewTrackId === track.id && isPlaying;
                                const meta = TRACK_METADATA[track.id] || TRACK_METADATA["waiting-day"];
                                const CoverIcon = meta.icon;

                        return (
                            <div
                                key={track.id}
                                className={`spotify-track-item ${isSelected ? "is-selected" : ""}`}
                                onClick={() => {
                                    onChange(track.id, track.url);
                                    setIsOpen(false); // Auto-close on selection!
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                {/* Album Artwork with Play button */}
                                <div className={`spotify-album-art ${meta.coverClass}`}>
                                    <CoverIcon className="spotify-album-icon" />
                                    {track.url && (
                                        <button
                                            type="button"
                                            className={`spotify-play-btn ${isCurrentPreview ? "is-active" : ""}`}
                                            onClick={(e) => togglePreview(track, e)}
                                            title={isCurrentPreview ? "Pause Preview" : "Play Preview"}
                                        >
                                            {isCurrentPreview ? <IoPause /> : <IoPlay style={{ marginLeft: "2px" }} />}
                                        </button>
                                    )}
                                </div>

                                {/* Track Details */}
                                <div className="spotify-track-info">
                                    <div className="spotify-track-title">{track.name}</div>
                                    <div className="spotify-track-artist">
                                        {meta.artist} • {meta.sub}
                                    </div>
                                </div>

                                {/* Animated Equalizer Wave (when this song is currently playing) */}
                                {isCurrentPreview && (
                                    <div className="spotify-equalizer" title="កំពុងលេង...">
                                        <div className="spotify-eq-bar" />
                                        <div className="spotify-eq-bar" />
                                        <div className="spotify-eq-bar" />
                                        <div className="spotify-eq-bar" />
                                    </div>
                                )}

                                {/* Radio / Selection Indicator */}
                                <div className="spotify-select-indicator">
                                    {isSelected && <IoCheckmark />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    )}

            {/* Spotify Now Playing Scrubber (if previewing) */}
            {activePreviewTrack && activePreviewTrack.url && isPlaying && (
                <div className="spotify-now-playing-bar">
                    <button
                        type="button"
                        className="spotify-bar-play-toggle"
                        onClick={() => togglePreview(activePreviewTrack)}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <IoPause size={16} /> : <IoPlay size={16} style={{ marginLeft: "2px" }} />}
                    </button>
                    <div className="spotify-bar-info">
                        <div className="spotify-bar-title">{activePreviewTrack.name}</div>
                        <div className="spotify-progress-wrap">
                            <span className="spotify-time-display">{formatTime(currentTime)}</span>
                            <div className="spotify-progress-track">
                                <div
                                    className="spotify-progress-fill"
                                    style={{
                                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                                    }}
                                />
                            </div>
                            <span className="spotify-time-display">{formatTime(duration)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SpotifyMusicPicker;
