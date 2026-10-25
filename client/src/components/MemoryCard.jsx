import { Link } from "react-router-dom";

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function MemoryCard({ memory }) {
  return (
    <Link
      to={`/watch/${memory._id}`}
      className="group relative block w-60 shrink-0 snap-start overflow-hidden rounded-2xl bg-ink-800 ring-1 ring-ink-700/70 transition duration-300 hover:ring-ember-500/50 sm:w-72"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={memory.thumbUrl}
          alt={memory.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent" />
        {memory.type === "video" && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ink-950/70 text-xs text-white backdrop-blur">
            ▶
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <p className="truncate font-display text-base font-semibold text-white">
            {memory.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">{formatDate(memory.memoryDate)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 px-3.5 py-2.5 text-xs text-slate-400">
        <span className={memory.likedByMe ? "text-ember-400" : ""}>
          ♥ {memory.likeCount ?? 0}
        </span>
        <span>💬 {memory.commentCount ?? 0}</span>
        <span className="ml-auto truncate">{memory.album}</span>
      </div>
    </Link>
  );
}
