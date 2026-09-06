import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Palette from "@/components/Palette";
import Plate from "@/components/Plate";
import Specimen from "@/components/Specimen";
import {
  assets,
  getProject,
  heroAsset,
  neighbours,
  projects,
  site,
  wall,
} from "@/lib/content";
import { specimenClassNames } from "@/lib/fonts";
import { srcSetFor } from "@/lib/images";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const hero = heroAsset(slug);
  return {
    title: project.title,
    description: project.summary || project.tagline,
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.summary || project.tagline,
      images: hero ? [{ url: hero.src, width: hero.w, height: hero.h }] : undefined,
    },
  };
}

function parseFact(fact: string) {
  const [label, ...rest] = fact.split("｜");
  return { label, value: rest.join("｜") };
}

function FactIcon({ label }: { label: string }) {
  const common = "h-5 w-5 shrink-0 text-bone-3";

  if (label === "難易程度") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
      </svg>
    );
  }

  if (label === "課程時間") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v5l3.5 2" />
      </svg>
    );
  }

  if (label === "適合人數") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="9" cy="9" r="3" />
        <circle cx="16.5" cy="10" r="2.5" />
        <path d="M3.5 19c.7-3.3 2.7-5 5.5-5s4.8 1.7 5.5 5M14 14.5c3.2-.4 5.3 1.1 6 4.5" />
      </svg>
    );
  }

  if (label === "適合場域") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 10v6M12 7h.01" />
    </svg>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const hero = heroAsset(slug);
  const plates = wall(project);
  const applications = assets(slug, "app");
  const deck = assets(slug, "deck");
  const { next } = neighbours(slug);

  const hasSpec =
    project.palette.length > 0 ||
    project.typography.length > 0 ||
    project.keywords.length > 0;

  return (
    <div className={specimenClassNames}>
      <section className="pt-[clamp(2.5rem,7vh,5rem)]">
        <div className="u-shell">
          <Link
            href="/#work"
            className="u-eyebrow inline-block transition-colors hover:text-bone"
          >
            ← 返回課程
          </Link>

          <h1 className="u-display mt-8 text-[length:var(--text-h1)] text-bone" data-reveal>
            {project.displayTitle}
          </h1>

          <div
            className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-b border-line pb-7"
            data-reveal
          >
            <span className="u-eyebrow">{project.discipline}</span>
          </div>

          <p
            className="u-prose mt-8 max-w-[40ch] text-[length:var(--text-h3)] leading-snug text-bone"
            data-reveal
          >
            {project.tagline}
          </p>
        </div>

        {project.palette.length > 0 && (
          <div
            className="mt-[clamp(2.5rem,6vh,4rem)] flex h-3 w-full"
            aria-hidden="true"
            data-reveal
          >
            {project.palette.map((swatch) => (
              <span
                key={swatch.hex}
                className="h-full flex-1"
                style={{
                  backgroundColor: swatch.hex,
                  boxShadow: "inset 0 0 0 1px rgba(233,229,221,0.10)",
                }}
              />
            ))}
          </div>
        )}
      </section>

      {hero && (
        <section className="u-shell pt-[clamp(2.5rem,6vh,4rem)]">
          <div
            className="relative overflow-hidden bg-ink-2"
            style={{ aspectRatio: `${hero.w} / ${hero.h}`, backgroundColor: hero.dom }}
            data-reveal
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.src}
              srcSet={srcSetFor(hero)}
              sizes="92vw"
              width={hero.w}
              height={hero.h}
              alt={`${project.title} — ${hero.label}`}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>
        </section>
      )}

      <section className="py-[var(--spacing-section)]">
        <div className="u-shell grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div data-reveal>
            {project.summary && (
              <>
                <h2 className="u-eyebrow">課程說明</h2>
                <div className="mt-7 flex max-w-[58ch] flex-col gap-5">
                  {project.summary.split(/\n{2,}/).map((paragraph, i) => (
                    <p key={i} className="u-prose whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </>
            )}

            {project.sections.length > 0 && (
              <div className="mt-14 flex flex-col gap-10">
                {project.sections.map((section) => {
                  const items = section.body.split("\n").map((item) => item.trim()).filter(Boolean);
                  return (
                    <div key={section.heading}>
                      <h3 className="u-eyebrow">{section.heading}</h3>
                      {items.length > 1 ? (
                        <ul className="u-prose mt-4 flex max-w-[58ch] list-disc flex-col gap-2 pl-5">
                          {items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      ) : (
                        <p className="u-prose mt-4 max-w-[58ch]">{section.body}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {hasSpec && (
            <div className="flex flex-col gap-14" data-reveal>
              {project.keywords.length > 0 && (
                <div>
                  <h2 className="u-eyebrow">特色</h2>
                  <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
                    {project.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="border border-line px-3 py-1.5 text-[length:var(--text-micro)] tracking-[0.14em] text-bone-2 uppercase"
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {project.typography.length > 0 && (
                <div>
                  <h2 className="u-eyebrow">字體</h2>
                  <div className="mt-5">
                    <Specimen specs={project.typography} />
                  </div>
                </div>
              )}

              {project.palette.length > 0 && (
                <div>
                  <h2 className="u-eyebrow">色彩</h2>
                  <div className="mt-5">
                    <Palette swatches={project.palette} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {project.steps.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <h2 className="u-eyebrow" data-reveal>
              製作流程
            </h2>
            <ol className="mt-12 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {project.steps.map((step) => (
                <li key={step.n} className="bg-ink p-7" data-reveal>
                  <span className="u-numeric block text-[length:var(--text-h3)] text-bone-3">
                    {step.n}
                  </span>
                  <h3 className="u-display mt-5 text-[length:var(--text-lead)] text-bone">
                    {step.title}
                  </h3>
                  <p className="u-label-caption mt-3 text-[length:var(--text-body)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {project.facts.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <h2 className="u-eyebrow" data-reveal>
              課程資訊
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {project.facts.map((fact) => {
                const { label, value } = parseFact(fact);
                return (
                  <li
                    key={fact}
                    className="border-t border-line pt-4"
                    data-reveal
                  >
                    <div className="flex items-center gap-2 text-[length:var(--text-meta)] text-bone-3">
                      <FactIcon label={label} />
                      <span>{label}</span>
                    </div>
                    <p className="mt-3 text-[length:var(--text-lead)] leading-snug text-bone">
                      {value}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {plates.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
              <h2 className="u-eyebrow">課程花絮</h2>
              <span className="u-numeric text-[length:var(--text-micro)] tracking-[0.16em] text-bone-3 uppercase">
                {plates.length} 張
              </span>
            </div>

            <div className="mt-10 grid grid-cols-2 items-start gap-x-[clamp(0.75rem,2.5vw,2.5rem)] gap-y-[clamp(1.75rem,5vw,4.5rem)] sm:mt-12 lg:grid-cols-3">
              {plates.map((asset) => (
                <div key={asset.src} data-reveal>
                  <Plate
                    asset={asset}
                    title={asset.plate?.title}
                    caption={asset.plate?.caption}
                    sizes="(min-width: 1024px) 30vw, 45vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {applications.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
              <h2 className="u-eyebrow">應用展示</h2>
              <span className="u-numeric text-[length:var(--text-micro)] tracking-[0.16em] text-bone-3 uppercase">
                {applications.length} 項
              </span>
            </div>

            <div className="mt-10 grid grid-cols-2 items-start gap-x-[clamp(0.75rem,2.5vw,2.5rem)] gap-y-[clamp(1.75rem,5vw,4.5rem)] sm:mt-12">
              {applications.map((asset) => (
                <div key={asset.src} data-reveal>
                  <Plate asset={asset} sizes="(min-width: 640px) 45vw, 45vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {deck.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
              <h2 className="u-eyebrow">延伸展示</h2>
              <span className="u-eyebrow lg:hidden">滑動查看 →</span>
            </div>

            <div className="mt-10 flex flex-col gap-[clamp(1.5rem,4vw,3rem)] sm:mt-12">
              {deck.map((asset) => (
                <div
                  key={asset.src}
                  data-reveal
                  className="u-scroll-x -mx-[var(--spacing-gutter)] px-[var(--spacing-gutter)] lg:mx-0 lg:px-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset.src}
                    srcSet={srcSetFor(asset)}
                    width={asset.w}
                    height={asset.h}
                    alt={`${project.title} — 延伸展示`}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 90vw, 1150px"
                    style={{ backgroundColor: asset.dom }}
                    className="h-auto w-[1150px] max-w-none lg:w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {next && (
        <section className="border-t border-line">
          <Link
            href={`/work/${next.slug}`}
            className="group block py-[var(--spacing-section)] transition-colors hover:bg-ink-2"
          >
            <div className="u-shell">
              <span className="u-eyebrow">下一個課程</span>
              <h2 className="u-display mt-5 text-[length:var(--text-h1)] text-bone transition-opacity group-hover:opacity-60">
                {next.displayTitle}
              </h2>
              <p className="u-label-caption mt-4 max-w-[46ch] text-[length:var(--text-body)]">
                {next.tagline}
              </p>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
