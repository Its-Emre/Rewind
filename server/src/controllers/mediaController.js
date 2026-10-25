// Image proxy for Drive artwork.
//
// Why this exists: Drive's thumbnail endpoints are fine for a click,
// but they rate-limit (HTTP 429) real browser traffic — an app home
// page firing a hero + a row of card requests gets throttled, and the
// images die. The supported embed (the video player) is unaffected.
//
// So artwork flows through here instead: the server fetches each
// thumbnail from Drive once, caches it in memory, and serves it to
// every family member after that. Browsers also cache it (long
// Cache-Control), so repeat visits barely touch this route.
//
// Exposure note: this route is public, but it can only fetch artwork
// for files that are already shared as "Anyone with the link" (Drive
// refuses otherwise) — it exposes nothing Drive doesn't already serve
// to anyone holding the file ID.

const ALLOWED_SIZES = [400, 800, 1000, 1600];
const CACHE_LIMIT = 300;
const cache = new Map(); // key -> { buffer, contentType }

export async function fetchDriveThumb(driveId, size) {
  const url = `https://drive.google.com/thumbnail?id=${driveId}&sz=w${size}`;
  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Rewind/1.0 (+family media app)" },
        redirect: "follow",
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.startsWith("image/")) {
          return { buffer: Buffer.from(await res.arrayBuffer()), contentType };
        }
        lastErr = new Error(`Drive returned ${contentType || "non-image"}`);
      } else {
        lastErr = new Error(`Drive returned HTTP ${res.status}`);
      }
    } catch (err) {
      lastErr = err;
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
  }
  throw lastErr || new Error("Drive thumbnail fetch failed");
}

// GET /api/media/:driveId/thumb?size=1000
export const getThumb = async (req, res) => {
  const { driveId } = req.params;
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(driveId)) {
    return res.status(400).json({ message: "Invalid file id" });
  }
  const requested = Number(req.query.size) || 1000;
  const size = ALLOWED_SIZES.includes(requested) ? requested : 1000;
  const key = `${driveId}:${size}`;

  const hit = cache.get(key);
  if (hit) {
    res.set("Content-Type", hit.contentType);
    res.set("Cache-Control", "public, max-age=86400");
    return res.send(hit.buffer);
  }

  try {
    const { buffer, contentType } = await fetchDriveThumb(driveId, size);
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
    cache.set(key, { buffer, contentType });
    res.set("Content-Type", contentType);
    res.set("Cache-Control", "public, max-age=86400");
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ message: "Could not fetch artwork from Drive" });
  }
};
