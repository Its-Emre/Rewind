import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import Row from "../components/Row";
import { formatDate } from "../components/MemoryCard";

const isOnThisDay = (value) => {
  const d = new Date(value);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

function Hero({ memory, eyebrow }) {
  const heroImg = memory.thumbUrl?.replace("sz=w1000", "sz=w1600");
  return (
    <section className="relative mb-10 animate-fadeUp overflow-hidden">
      <div className="relative h-[54vh] min-h-[380px] w-full">
        <img src={heroImg} alt={memory.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/70 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember-400">
            {eyebrow}
          </p>
          <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {memory.title}
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            {formatDate(memory.memoryDate)} · {memory.album} · added by {memory.addedBy?.name}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link to={`/watch/${memory._id}`} className="btn-ember !px-6 !py-3 !text-base">
              ▶ {memory.type === "video" ? "Watch" : "View"}
            </Link>
            <span className="rounded-full bg-ink-950/60 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              ♥ {memory.likeCount ?? 0} · 💬 {memory.commentCount ?? 0}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SkeletonHome() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="shimmer-bg animate-shimmer mt-6 h-[40vh] rounded-3xl" />
      <div className="shimmer-bg animate-shimmer mt-10 h-6 w-48 rounded" />
      <div className="mt-4 flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer-bg animate-shimmer h-44 w-72 shrink-0 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listMemories()
      .then((data) => setMemories(data.memories))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { hero, heroEyebrow, onThisDay, recentlyAdded, mostLoved, albumRows } = useMemo(() => {
    const onThisDay = memories.filter((m) => isOnThisDay(m.memoryDate));
    const recentlyAdded = [...memories]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);
    const mostLoved = [...memories]
      .filter((m) => (m.likeCount ?? 0) > 0)
      .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
      .slice(0, 10);
    const byAlbum = new Map();
    for (const m of memories) {
      const list = byAlbum.get(m.album) ?? [];
      list.push(m);
      byAlbum.set(m.album, list);
    }
    const albumRows = [...byAlbum.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([album, list]) => ({ album, list }));
    const hero = onThisDay[0] ?? memories[0] ?? null;
    return {
      hero,
      heroEyebrow: onThisDay[0] ? "On this day" : "Featured memory",
      onThisDay,
      recentlyAdded,
      mostLoved,
      albumRows,
    };
  }, [memories]);

  if (loading) return <SkeletonHome />;
  if (error)
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
        <p className="font-display text-2xl text-white">The projector jammed.</p>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
      </main>
    );

  if (!memories.length)
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-4xl font-semibold text-white sm:text-5xl">
          The reel is empty — <span className="italic text-ember-400">for now.</span>
        </h1>
        <p className="mt-4 text-slate-400">
          Add the first family memory: pick a photo or clip in Google Drive, copy its
          link, and paste it here. The show begins with one memory.
        </p>
        <Link to="/add" className="btn-ember mt-8 !px-6 !py-3 !text-base">
          + Add the first memory
        </Link>
      </main>
    );

  return (
    <main className="pb-16">
      {hero && <Hero memory={hero} eyebrow={heroEyebrow} />}
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <Row title="On This Day" subtitle="Same date, other years" memories={onThisDay} />
        <Row title="Recently Added" subtitle="Fresh on the reel" memories={recentlyAdded} />
        <Row title="Most Loved" subtitle="The family's favourites" memories={mostLoved} />
        {albumRows.map(({ album, list }) => (
          <Row key={album} title={album} memories={list} />
        ))}
      </div>
    </main>
  );
}
