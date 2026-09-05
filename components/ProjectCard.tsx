import Link from "next/link";
import { heroAsset } from "@/lib/content";
import { srcSetFor } from "@/lib/images";
import type { Project } from "@/lib/types";

/**
 * A project as it appears in the index: one plate, its wall label, and the
 * colours it was built from. The palette strip is information rather than
 * ornament — it tells you the project's colour world before you open it, and
 * ties each entry back to the chromatic index in the hero.
 */
export default function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const asset = heroAsset(project.slug);

  return (
    <article className="group">
      <Link href={`/work/${project.slug}`} className="block">
        <div
          className="relative overflow-hidden bg-ink-2"
          style={{
            aspectRatio: asset ? `${asset.w} / ${asset.h}` : "4 / 5",
            backgroundColor: asset?.dom,
          }}
        >
          {asset && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={asset.src}
              srcSet={srcSetFor(asset)}
              sizes="(min-width: 1024px) 46vw, 92vw"
              width={asset.w}
              height={asset.h}
              alt={`${project.title} — ${project.discipline}`}
              loading={priority ? "eager" : "lazy"}
              decoding={priority ? "sync" : "async"}
              fetchPriority={priority ? "high" : "auto"}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-6">
          <h3 className="u-display text-[length:var(--text-h2)] text-bone transition-opacity group-hover:opacity-60">
            {project.displayTitle}
          </h3>
          <span className="u-eyebrow mt-2 shrink-0 text-right">
            {project.discipline}
          </span>
        </div>

        <p className="u-label-caption mt-3 max-w-[46ch] text-[length:var(--text-body)] text-bone-2">
          {project.tagline}
        </p>
      </Link>

      {project.palette.length > 0 && (
        <ul
          className="mt-5 flex h-1.5 w-full max-w-[22rem] overflow-hidden"
          aria-label={`${project.palette.length} colours`}
        >
          {project.palette.map((swatch) => (
            <li
              key={swatch.hex}
              className="h-full flex-1"
              style={{ backgroundColor: swatch.hex }}
            />
          ))}
        </ul>
      )}
    </article>
  );
}
