import instrumentalWedding from "../../assets/music/Instrumental Wedding Music (VioSounds Cover).m4a";
import waitingDay from "../../assets/music/ថ្ងៃដែលរង់ចាំ.mp3";

/**
 * Wedding background music tracks.
 * Each track has an id, name, and url (imported asset or remote URL).
 */
export const MUSIC_TRACKS = [
    {
        id: "waiting-day",
        name: "ថ្ងៃដែលរង់ចាំ",
        description: "បទភ្លេងគំរូសម្រាប់សន្លឹកការខ្មែរ",
        url: waitingDay,
    },
    {
        id: "nisai",
        name: "Nisai — និស្ស័យ",
        description: "Royal Garden Cinematic soundtrack",
        url: "/music/Nisai-និស្ស័យ.mp3",
    },
    {
        id: "instrumental-wedding",
        name: "Instrumental Wedding (VioSounds)",
        description: "តន្ត្រី violin កក់ក្ដៅ សមរម្យសម្រាប់ពិធីបុរាណ",
        url: instrumentalWedding,
    },
    {
        id: "none",
        name: "មិនប្រើតន្ត្រី",
        description: "បិទតន្ត្រី background",
        url: null,
    },
];

export function getMusicTrack(id) {
    return MUSIC_TRACKS.find((t) => t.id === id) || MUSIC_TRACKS[0];
}
