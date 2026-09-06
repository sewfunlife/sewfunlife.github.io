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
      {/* ---------------------------------------------------------------- */}
      {/* Title                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="pt-[clamp(2.5rem,7vh,5rem)]">
        <div className="u-shell">
          <Link
            href="/#work"
            className="u-eyebrow inline-block transition-colors hover:text-bone"
          >
            ← 返回作品
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

        {/* This project's colours, full-bleed — the chromatic index from the
            home page, filtered down to one project. */}
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
                  /* Palettes here include near-blacks; without a hairline they
                     read as a gap in the band rather than as a colour. */
                  boxShadow: "inset 0 0 0 1px rgba(233,229,221,0.10)",
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Hero plate                                                        */}
      {/* ---------------------------------------------------------------- */}
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

      {/* ---------------------------------------------------------------- */}
      {/* Case study + specification                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-[var(--spacing-section)]">
        <div className="u-shell grid gap-x-[clamp(2rem,6vw,6rem)] gap-y-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div data-reveal>
            {project.summary && (
              <>
                <h2 className="u-eyebrow">課程說明</h2>
                <p className="u-prose mt-7 max-w-[58ch]">{project.summary}</p>
              </>
            )}

            {project.sections.length > 0 && (
              <div className="mt-14 flex flex-col gap-10">
                {project.sections.map((section) => (
                  <div key={section.heading}>
                    <h3 className="u-eyebrow">{section.heading}</h3>
                    <p className="u-prose mt-4 max-w-[58ch]">{section.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {hasSpec && (
            <div className="flex flex-col gap-14" data-reveal>
              {project.keywords.length > 0 && (
                <div>
                  <h2 className="u-eyebrow">Direction</h2>
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
                  <h2 className="u-eyebrow">Typography</h2>
                  <div className="mt-5">
                    <Specimen specs={project.typography} />
                  </div>
                </div>
              )}

              {project.palette.length > 0 && (
                <div>
                  <h2 className="u-eyebrow">Colour</h2>
                  <div className="mt-5">
                    <Palette swatches={project.palette} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Release journey / key facts                                       */}
      {/* ---------------------------------------------------------------- */}
      {project.steps.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <h2 className="u-eyebrow" data-reveal>
              Release journey
            </h2>
            {/* Numbered because the content genuinely is a sequence: a track
                cannot be scheduled before it is verified. */}
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
              {project.facts.map((fact) => (
                <li
                  key={fact}
                  className="border-t border-line pt-4 text-[length:var(--text-lead)] leading-snug text-bone"
                  data-reveal
                >
                  {fact}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* The wall                                                          */}
      {/* ---------------------------------------------------------------- */}
      {plates.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
              <h2 className="u-eyebrow">
                {project.kind === "moodboard" ? "Mood board" : "Visual language"}
              </h2>
              <span className="u-numeric text-[length:var(--text-micro)] tracking-[0.16em] text-bone-3 uppercase">
                {String(plates.length).padStart(2, "0")} plates
              </span>
            </div>

            {/* Two columns from the smallest screen up. A mood board is a
                board — one plate per phone screen turns nine images into nine
                screens of scrolling and loses the comparison the grid exists
                to make. */}
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

      {/* ---------------------------------------------------------------- */}
      {/* Applications                                                      */}
      {/* ---------------------------------------------------------------- */}
      {applications.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
              <h2 className="u-eyebrow">Applications</h2>
              <span className="u-numeric text-[length:var(--text-micro)] tracking-[0.16em] text-bone-3 uppercase">
                {String(applications.length).padStart(2, "0")} formats
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

      {/* ---------------------------------------------------------------- */}
      {/* Presentation spreads                                              */}
      {/* ---------------------------------------------------------------- */}
      {deck.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <div className="flex items-baseline justify-between gap-6 border-b border-line pb-6">
              <h2 className="u-eyebrow">Presentation spreads</h2>
              <span className="u-eyebrow lg:hidden">Scroll to read →</span>
            </div>

            {/* These are full deck pages: a 1600×900 spread squeezed into a
                350px phone renders its captions at about three pixels. Below
                the large breakpoint each spread keeps a readable width and
                pans sideways inside its own scroller, so the page itself
                never scrolls horizontally. */}
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
                    alt={`${project.title} — presentation spread`}
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

      {/* ---------------------------------------------------------------- */}
      {/* Next                                                              */}
      {/* ---------------------------------------------------------------- */}
      {next && (
        <section className="border-t border-line">
          <Link
            href={`/work/${next.slug}`}
            className="group block py-[var(--spacing-section)] transition-colors hover:bg-ink-2"
          >
            <div className="u-shell">
              <span className="u-eyebrow">下一個作品</span>
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
