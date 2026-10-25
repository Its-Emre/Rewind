import { useState } from "react";

// Drive artwork with a safety net. Primary art comes from Drive's
// thumbnail service (via the URL the API stored); if that request fails
// in the browser — a flaky redirect, a mobile-browser quirk — fall back
// to the direct googleusercontent form of the same thumbnail, and only
// then to a branded placeholder.
export default function DriveImage({ driveId, src, alt, className, size = 1000 }) {
  const [stage, setStage] = useState(0);
  const fallback = driveId
    ? `https://lh3.googleusercontent.com/d/${driveId}=w${size}`
    : null;

  if (stage >= 2 || (!src && !fallback)) {
    return (
      <div className={`flex items-center justify-center bg-ink-800 ${className || ""}`}>
        <span className="font-display text-4xl font-semibold text-ember-500/50">
          {(alt || "R").charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <img
      src={stage === 0 ? src || fallback : fallback}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setStage((s) => s + 1)}
    />
  );
}
