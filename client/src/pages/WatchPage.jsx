import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../components/MemoryCard";

export default function WatchPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memory, setMemory] = useState(null);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ memory }, { comments }] = await Promise.all([
        api.getMemory(id),
        api.getComments(id),
      ]);
      setMemory(memory);
      setComments(comments);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleLike = async () => {
    if (!memory || likeBusy) return;
    setLikeBusy(true);
    try {
      const { liked, likeCount } = await api.toggleLike(id);
      setMemory((m) => ({ ...m, likedByMe: liked, likeCount }));
    } catch {
      /* a failed like shouldn't break the show */
    } finally {
      setLikeBusy(false);
    }
  };

  const postComment = async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const { comment } = await api.addComment(id, text);
      setComments((c) => [...c, comment]);
      setCommentText("");
      setMemory((m) => (m ? { ...m, commentCount: (m.commentCount ?? 0) + 1 } : m));
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (commentId) => {
    try {
      await api.deleteComment(id, commentId);
      setComments((c) => c.filter((x) => x._id !== commentId));
    } catch {
      /* ignore */
    }
  };

  const removeMemory = async () => {
    if (!window.confirm("Remove this memory from Rewind? (The file stays in your Drive.)")) return;
    try {
      await api.deleteMemory(id);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading)
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="shimmer-bg animate-shimmer aspect-video w-full rounded-3xl" />
        <div className="shimmer-bg animate-shimmer mt-6 h-8 w-2/3 rounded" />
        <div className="shimmer-bg animate-shimmer mt-3 h-4 w-1/3 rounded" />
      </main>
    );

  if (!memory)
    return (
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl text-white">This memory isn't on the reel.</h1>
        <p className="mt-2 text-sm text-slate-400">{error || "It may have been removed."}</p>
        <Link to="/" className="btn-ember mt-6">
          Back to Home
        </Link>
      </main>
    );

  const isMine = String(memory.addedBy?._id) === String(user?._id);

  return (
    <main className="mx-auto max-w-5xl animate-fadeUp px-4 pb-16 pt-6 sm:px-6">
      <Link to="/" className="text-sm text-slate-400 transition hover:text-white">
        ← All memories
      </Link>

      <div className="mt-4 overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-ink-700/70">
        {memory.type === "video" ? (
          <div className="aspect-video w-full">
            <iframe
              src={memory.previewUrl}
              title={memory.title}
              className="h-full w-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={memory.imageUrl}
            alt={memory.title}
            className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
          />
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {memory.title}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {formatDate(memory.memoryDate)} ·{" "}
            <span className="rounded-full bg-ink-800 px-2.5 py-0.5 text-xs text-slate-300 ring-1 ring-ink-600">
              {memory.album}
            </span>{" "}
            · added by {memory.addedBy?.name}
          </p>
          {memory.likedBy?.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              Liked by {memory.likedBy.map((u) => u.name).join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            disabled={likeBusy}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ember-300 ${
              memory.likedByMe
                ? "bg-ember-500 text-ink-950 hover:bg-ember-400"
                : "border border-ink-600 bg-ink-800 text-slate-200 hover:bg-ink-700"
            }`}
          >
            ♥ {memory.likeCount ?? 0}
          </button>
          {isMine && (
            <button onClick={removeMemory} className="btn-ghost !border-red-500/40 !text-red-300 hover:!bg-red-500/10">
              Delete
            </button>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-white">
          Comments{" "}
          <span className="text-base font-normal text-slate-500">({comments.length})</span>
        </h2>

        <form onSubmit={postComment} className="mt-4 flex gap-2">
          <input
            className="input"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Say something about this memory…"
            maxLength={500}
          />
          <button className="btn-ember shrink-0" disabled={posting || !commentText.trim()}>
            {posting ? "…" : "Post"}
          </button>
        </form>

        <ul className="mt-6 flex flex-col gap-4">
          {comments.map((c) => (
            <li key={c._id} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-700 font-display text-sm font-semibold text-ember-300">
                {c.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-md bg-ink-800 px-4 py-3 ring-1 ring-ink-700/60">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">{c.user?.name}</span> ·{" "}
                  {new Date(c.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                  {String(c.user?._id) === String(user?._id) && (
                    <button
                      onClick={() => removeComment(c._id)}
                      className="ml-2 text-red-400/80 hover:text-red-300"
                    >
                      delete
                    </button>
                  )}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">{c.text}</p>
              </div>
            </li>
          ))}
          {!comments.length && (
            <li className="text-sm text-slate-500">
              No comments yet — the family is speechless. Be the first.
            </li>
          )}
        </ul>
      </section>
    </main>
  );
}
