import { useState } from "react";
import { mediaThumbUrl } from "../lib/api";

// Drive artwork with a safety net, in order:
//   1. Our server's cached proxy (reliable — Drive throttles browsers)
//   2. The direct Drive thumbnail URL the API stored
//   3. The direct googleusercontent form of the same thumbnail
//   4. A branded placeholder
// `src` is the direct thumbnail-service URL (stage 2).
export default function DriveImage({ driveId, src, alt, className, size = 1000 }) {
  const [stage, setStage] = useState(0);

  const stages = [];
  if (driveId) stages.push(mediaThumbUrl(driveId, size));
  if (src) stages.push(src);
  if (driveId) stages.push(`https://lh3.googleusercontent.com/d/${driveId}=w${size}`);

  if (stage >= stages.length) {
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
      src={stages[stage]}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setStage((s) => s + 1)}
    />
  );
}
