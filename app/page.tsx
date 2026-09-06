import ChromaticIndex from "@/components/ChromaticIndex";
import ProjectCard from "@/components/ProjectCard";
import { srcSetFor } from "@/lib/images";
import {
  assetCount,
  assets,
  chromaticIndex,
  projects,
  site,
} from "@/lib/content";

function mosaic() {
  return projects
    .flatMap((project) => assets(project.slug, "mood").slice(0, 1))
    .slice(0, 4);
}

export default function Home() {
  const nameParts = site.name.split(" ").filter(Boolean);
  const colours = chromaticIndex();
  const tiles = mosaic();
  const total = assetCount();

  return (
    <>
      <section className="pt-[clamp(3rem,10vh,7rem)] pb-[clamp(2.5rem,6vh,4.5rem)]">
        <div className="u-shell">
          <p className="u-eyebrow" data-reveal>
            {site.role}
            {site.location ? ` — ${site.location}` : ""}
          </p>

          <h1 className="u-display mt-7 text-[length:var(--text-hero)] text-bone">
            {nameParts.map((part, i) => (
              <span
                key={part}
                className="block"
                data-reveal
                style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
              >
                {part}
              </span>
            ))}
          </h1>

          <div
            className="mt-10 grid gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
            data-reveal
            style={{ ["--reveal-delay" as string]: "320ms" }}
          >
            <p className="u-prose max-w-[54ch]">{site.tagline}</p>

            {total > 0 && (
              <dl className="u-numeric flex gap-10 text-[length:var(--text-micro)] tracking-[0.16em] text-bone-3 uppercase">
                <div className="flex flex-col gap-1.5">
                  <dt className="sr-only">課程</dt>
                  <dd className="text-[length:var(--text-h3)] tracking-normal text-bone">
                    {String(projects.length).padStart(2, "0")}
                  </dd>
                  <dt aria-hidden="true">課程</dt>
                </div>
                <div className="flex flex-col gap-1.5">
                  <dt className="sr-only">圖片</dt>
                  <dd className="text-[length:var(--text-h3)] tracking-normal text-bone">
                    {total}
                  </dd>
                  <dt aria-hidden="true">圖片</dt>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div
          className="mt-[clamp(3rem,8vh,6rem)] px-[var(--spacing-gutter)]"
          data-reveal
          style={{ ["--reveal-delay" as string]: "420ms" }}
        >
          <ChromaticIndex entries={colours} projectCount={projects.length} />
        </div>
      </section>

      <section id="work" className="scroll-mt-20 py-[var(--spacing-section)]">
        <div className="u-shell">
          <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
            <h2 className="u-eyebrow">課程</h2>
            <span className="u-numeric text-[length:var(--text-micro)] tracking-[0.16em] text-bone-3 uppercase">
              {String(projects.length).padStart(2, "0")} 門課程
            </span>
          </div>

          <div className="mt-[clamp(2.5rem,6vw,5rem)] grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(3.5rem,9vw,7rem)] lg:grid-cols-2">
            {projects.map((project, i) => (
              <div
                key={project.slug}
                data-reveal
                className={i % 2 === 1 ? "lg:mt-[clamp(3rem,9vw,8rem)]" : undefined}
              >
                <ProjectCard project={project} priority={i === 0} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {site.services.length > 0 && (
        <section
          id="services"
          className="scroll-mt-20 border-t border-line py-[var(--spacing-section)]"
        >
          <div className="u-shell">
            <h2 className="u-eyebrow" data-reveal>
              服務內容
            </h2>

            <ul className="mt-12">
              {site.services.map((service) => (
                <li
                  key={service.title}
                  className="grid gap-3 border-t border-line py-8 last:border-b md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-12"
                  data-reveal
                >
                  <h3 className="u-display text-[length:var(--text-h3)] text-bone">
                    {service.title}
                  </h3>
                  <p className="u-prose text-[length:var(--text-body)]">
                    {service.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section
        id="about"
        className="scroll-mt-20 border-t border-line py-[var(--spacing-section)]"
      >
        <div className="u-shell grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div data-reveal>
            <h2 className="u-eyebrow">關於布有趣</h2>
            <div className="mt-8 flex flex-col gap-6">
              {[...site.intro, ...site.about].map((paragraph, i) => (
                <p key={i} className="u-prose max-w-[62ch]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {tiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3 self-start sm:gap-4" data-reveal>
              {tiles.map((asset, i) => (
                <div
                  key={asset.src}
                  className="relative overflow-hidden bg-ink-2"
                  style={{
                    aspectRatio: `${asset.w} / ${asset.h}`,
                    backgroundColor: asset.dom,
                    marginTop: i % 2 === 1 ? "clamp(1rem,4vw,3rem)" : undefined,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.src}
                    srcSet={srcSetFor(asset)}
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    width={asset.w}
                    height={asset.h}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
