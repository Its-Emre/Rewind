import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, parseDriveIdClient, thumbUrl } from "../lib/api";
import DriveImage from "../components/DriveImage";

const today = () => new Date().toISOString().slice(0, 10);

export default function AddMemory() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [type, setType] = useState("video");
  const [memoryDate, setMemoryDate] = useState(today());
  const [album, setAlbum] = useState("");
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .listMemories()
      .then((data) => setAlbums([...new Set(data.memories.map((m) => m.album))]))
      .catch(() => {});
  }, []);

  const previewId = useMemo(() => parseDriveIdClient(driveLink), [driveLink]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { memory } = await api.createMemory({
        title,
        driveLink,
        type,
        memoryDate,
        album,
      });
      navigate(`/watch/${memory._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="animate-fadeUp font-display text-3xl font-semibold text-white sm:text-4xl">
        Add a memory
      </h1>
      <p className="mt-2 animate-fadeUp text-sm text-slate-400">
        The photo or clip stays in Google Drive — Rewind just needs its link.
      </p>

      <form onSubmit={submit} className="mt-8 animate-fadeUp rounded-3xl border border-ink-700/70 bg-ink-900 p-6">
        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <label className="label">Title</label>
        <input
          className="input"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Goa Trip — Beach Day"
          maxLength={120}
        />

        <label className="label mt-5">Google Drive link</label>
        <input
          className="input"
          required
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
          placeholder="https://drive.google.com/file/d/…"
        />
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          In Drive: right-click the file → <span className="text-slate-300">Share</span> → set
          access to <span className="text-slate-300">"Anyone with the link"</span> →{" "}
          <span className="text-slate-300">Copy link</span> → paste it here. Without that
          sharing setting, the family will see a blank player.
        </p>
        {previewId && (
          <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-ink-600">
            <DriveImage
              driveId={previewId}
              src={thumbUrl(previewId, 1000)}
              alt="Drive preview"
              className="aspect-[16/9] w-full object-cover"
            />
            <p className="bg-ink-800 px-3 py-2 text-xs text-emerald-300">
              ✓ Link recognised — this is what the family will see.
            </p>
          </div>
        )}

        <label className="label mt-5">This is a</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["video", "🎬 Video clip"],
            ["photo", "📷 Photo"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                type === value
                  ? "border-ember-500 bg-ember-500/15 text-ember-300"
                  : "border-ink-600 bg-ink-800 text-slate-300 hover:bg-ink-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Date of the memory</label>
            <input
              className="input"
              type="date"
              required
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Album</label>
            <input
              className="input"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="e.g. Goa Trip 2024"
              list="album-suggestions"
              maxLength={60}
            />
            <datalist id="album-suggestions">
              {albums.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
        </div>

        <button className="btn-ember mt-7 w-full !py-3" disabled={busy}>
          {busy ? "Adding…" : "Add to the reel"}
        </button>
      </form>
    </main>
  );
}
