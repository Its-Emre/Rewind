// Google Drive helpers for the Drive-first MVP.
//
// Media never touches this server: a memory stores only the Drive file
// ID, and playback/artwork URLs are derived from it.

// Extract a Drive file ID from any common Drive URL shape:
//   https://drive.google.com/file/d/<id>/view?usp=sharing
//   https://drive.google.com/open?id=<id>
//   https://drive.google.com/uc?id=<id>&export=download
//   https://drive.usercontent.google.com/download?id=<id>
// A bare file ID pasted on its own is also accepted.
// Returns null when no plausible ID is found.
export function parseDriveId(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{25,}$/.test(trimmed)) return trimmed;
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m && m[1].length >= 10) return m[1];
  }
  return null;
}

// Card art / imagery, served by Drive's thumbnail service. Works for
// files shared as "Anyone with the link can view" — no API key needed.
// The same URL at a large size doubles as the full photo view.
export const driveThumbUrl = (fileId, size = 1000) =>
  `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;

// The embeddable Drive player (the reliable playback path — it avoids
// Drive's direct-download confirmation blocks).
export const drivePreviewUrl = (fileId) =>
  `https://drive.google.com/file/d/${fileId}/preview`;
