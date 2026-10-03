// FE-012: old notes can be plain human text or legacy position metadata.
export function readTableNoteMetadata(notes) {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
  } catch {
    // An unfinished JSON-looking note is still human text and must survive.
  }
  return { notesText: notes };
}

export function writeTablePosition(notes, position) {
  const metadata = readTableNoteMetadata(notes);
  if (!Number.isFinite(position.x) || !Number.isFinite(position.y)) throw new Error("Enter valid table coordinates.");
  return JSON.stringify({ ...metadata, x: Math.round(position.x * 10) / 10,
    y: Math.round(position.y * 10) / 10, zone: position.zone || metadata.zone || "hall" });
}
