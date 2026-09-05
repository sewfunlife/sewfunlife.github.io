"use client";

import { useState } from "react";

type Entry = { hex: string; project: string; slug: string };

/**
 * The studio's entire colour output as a single object: every hex specified
 * across every project, in project order, as one continuous band.
 *
 * The band is decorative — it is not a navigation control, because at eight
 * pixels per segment on a phone it could never be a reliable tap target. It is
 * announced to screen readers as the one fact it carries (how many colours,
 * across how many projects) and the per-swatch readout is a pointer-only
 * enhancement.
 */
export default function ChromaticIndex({
  entries,
  projectCount,
}: {
  entries: Entry[];
  /* The portfolio's total project count, passed in rather than counted from
     `entries`. Deriving it here would report however many projects happen to
     declare a palette — six of eight, here — which contradicts the figure in
     the hero directly above it. */
  projectCount: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const current = active === null ? null : entries[active];

  if (entries.length === 0) return null;

  return (
    <div className="w-full">
      <div
        className="flex h-9 w-full overflow-hidden sm:h-11"
        role="img"
        aria-label={`Colour index: every one of the ${entries.length} colours specified across the portfolio.`}
        onPointerLeave={() => setActive(null)}
      >
        {entries.map((entry, i) => (
          <span
            key={`${entry.slug}-${entry.hex}-${i}`}
            className="h-full flex-1 origin-left transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
            style={{
              backgroundColor: entry.hex,
              /* Several palettes contain near-blacks. Without a hairline they
                 disappear into the canvas and the band reads as broken, so
                 every swatch is outlined the way it would be on a spec sheet. */
              boxShadow: "inset 0 0 0 1px rgba(233,229,221,0.10)",
              animation: `u-wipe 0.9s cubic-bezier(0.16,1,0.3,1) ${180 + i * 22}ms both`,
            }}
            onPointerEnter={() => setActive(i)}
          />
        ))}
      </div>

      <div className="u-numeric mt-3 flex items-baseline justify-between gap-4 text-[length:var(--text-micro)] text-bone-3">
        <span aria-hidden="true" className="tracking-[0.2em] uppercase">
          {current ? current.project : `${entries.length} colours`}
        </span>
        <span aria-hidden="true" className="tracking-[0.12em] uppercase">
          {current
            ? current.hex
            : `${String(projectCount).padStart(2, "0")} projects`}
        </span>
      </div>
    </div>
  );
}
