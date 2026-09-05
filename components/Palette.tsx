import type { Swatch } from "@/lib/types";

/**
 * A project's declared colours, each with its hex printed beneath it — the way
 * a palette appears on a spec sheet, not as anonymous decoration.
 */
export default function Palette({ swatches }: { swatches: Swatch[] }) {
  if (swatches.length === 0) return null;

  return (
    <ul className="grid grid-cols-4 gap-x-3 gap-y-4 sm:grid-cols-5 lg:grid-cols-7">
      {swatches.map((swatch) => (
        <li key={swatch.hex} className="flex flex-col gap-2">
          <span
            className="block h-14 w-full border border-line sm:h-20"
            style={{ backgroundColor: swatch.hex }}
          />
          <span className="u-numeric text-[length:var(--text-micro)] text-bone-3 uppercase">
            {swatch.hex}
          </span>
          {swatch.name && (
            <span className="-mt-1 text-[length:var(--text-micro)] text-bone-3">
              {swatch.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
