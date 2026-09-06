"use client";

import { useState } from "react";

type Entry = { hex: string; project: string; slug: string };

export default function ChromaticIndex({
  entries,
  projectCount,
}: {
  entries: Entry[];
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
        aria-label={`色彩索引：共 ${entries.length} 種色彩。`}
        onPointerLeave={() => setActive(null)}
      >
        {entries.map((entry, i) => (
          <span
            key={`${entry.slug}-${entry.hex}-${i}`}
            className="h-full flex-1 origin-left transition-transform duration-500 ease-out will-change-transform motion-reduce:transition-none"
            style={{
              backgroundColor: entry.hex,
              boxShadow: "inset 0 0 0 1px rgba(233,229,221,0.10)",
              animation: `u-wipe 0.9s cubic-bezier(0.16,1,0.3,1) ${180 + i * 22}ms both`,
            }}
            onPointerEnter={() => setActive(i)}
          />
        ))}
      </div>

      <div className="u-numeric mt-3 flex items-baseline justify-between gap-4 text-[length:var(--text-micro)] text-bone-3">
        <span aria-hidden="true" className="tracking-[0.2em] uppercase">
          {current ? current.project : `${entries.length} 種色彩`}
        </span>
        <span aria-hidden="true" className="tracking-[0.12em] uppercase">
          {current
            ? current.hex
            : `${String(projectCount).padStart(2, "0")} 項`}
        </span>
      </div>
    </div>
  );
}
