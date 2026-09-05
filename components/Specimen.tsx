import { specimenFamily } from "@/lib/fonts";
import type { TypeSpec } from "@/lib/types";

/**
 * The typefaces a project was set in, shown in those actual typefaces.
 *
 * Naming a face in body copy tells you nothing; setting "Aa" in it tells you
 * everything. The faces are subset to this alphabet at build time, so each
 * specimen costs a few kilobytes.
 */
export default function Specimen({ specs }: { specs: TypeSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <ul className="flex flex-col">
      {specs.map((spec) => (
        <li
          key={spec.family}
          className="flex items-baseline gap-5 border-t border-line py-5 last:border-b sm:gap-8"
        >
          <span
            aria-hidden="true"
            className="shrink-0 text-[2.75rem] leading-none text-bone sm:text-[3.5rem]"
            style={{ fontFamily: specimenFamily(spec.family) }}
          >
            Aa
          </span>
          <span className="flex min-w-0 flex-col gap-1.5">
            <span
              className="text-[length:var(--text-h3)] leading-tight text-bone"
              style={{ fontFamily: specimenFamily(spec.family) }}
            >
              {spec.family}
            </span>
            {spec.styles.length > 0 && (
              <span className="text-[length:var(--text-micro)] tracking-[0.18em] text-bone-3 uppercase">
                {spec.styles.join(" · ")}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
