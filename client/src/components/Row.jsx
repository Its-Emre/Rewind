import MemoryCard from "./MemoryCard";

export default function Row({ title, subtitle, memories }) {
  if (!memories?.length) return null;
  return (
    <section className="animate-fadeUp">
      <div className="mb-3 flex items-baseline gap-3 px-4 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 sm:text-sm">{subtitle}</p>}
      </div>
      <div className="no-scrollbar flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
        {memories.map((m) => (
          <MemoryCard key={m._id} memory={m} />
        ))}
      </div>
    </section>
  );
}
