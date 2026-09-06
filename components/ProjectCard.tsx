import Link from "next/link";
import { heroAsset } from "@/lib/content";
import { srcSetFor } from "@/lib/images";
import type { Project } from "@/lib/types";

function factValue(project: Project, label: string) {
  const fact = project.facts.find((item) => item.startsWith(`${label}｜`));
  return fact ? fact.slice(label.length + 1) : "";
}

export default function ProjectCard({
  project,
  priority = false,
}: {
  project: Project;
  priority?: boolean;
}) {
  const asset = heroAsset(project.slug);
  const difficulty = factValue(project, "難易程度");
  const duration = factValue(project, "課程時間");

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

        <h3 className="u-display mt-5 text-[length:var(--text-h2)] text-bone transition-opacity group-hover:opacity-60">
          {project.displayTitle}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[length:var(--text-meta)] text-bone-2">
          {difficulty && <span aria-label={`難易程度 ${difficulty}`}>{difficulty}</span>}
          {duration && <span>{duration}</span>}
        </div>
      </Link>
    </article>
  );
}
