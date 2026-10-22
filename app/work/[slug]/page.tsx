import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Plate from "@/components/Plate";
import {
  getCourse,
  heroAsset,
  neighbours,
  courses,
  site,
  wall,
} from "@/lib/content";
import { courseFacts } from "@/lib/course-display";
import { srcSetFor } from "@/lib/images";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};

  const hero = heroAsset(slug);
  return {
    title: course.title,
    description: course.description || course.short_description || undefined,
    openGraph: {
      title: `${course.title} — ${site.name}`,
      description: course.description || course.short_description || undefined,
      images: hero ? [{ url: hero.src, width: hero.w, height: hero.h }] : undefined,
    },
  };
}

function FactIcon({ label }: { label: string }) {
  const common = "h-4 w-4 shrink-0 text-bone-3";

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

  if (label === "成品內容") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8.5 12 2.3 2.3 4.8-5" />
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

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const hero = heroAsset(slug);
  const plates = wall(course);
  const { next } = neighbours(slug);
  const facts = courseFacts(course);
  const sections = [
    { heading: '課程特色', body: course.highlights?.join('\n') },
    { heading: '適合對象', body: course.audience },
    { heading: '年齡／年級限制', body: course.age_rule },
    { heading: '場地需求', body: course.venue_requirements },
    { heading: '設備需求', body: course.equipment_requirements },
    { heading: '邀約提醒', body: course.inquiry_note },
  ].filter((s): s is { heading: string; body: string } => !!s.body);

  return (
    <div>
      <section className="pt-[clamp(2.5rem,7vh,5rem)]">
        <div className="u-shell">
          <Link
            href="/#work"
            className="u-eyebrow inline-block transition-colors hover:text-bone"
          >
            ← 返回課程
          </Link>

          <h1 className="u-display mt-8 text-[length:var(--text-h1)] text-bone" data-reveal>
            {course.title}
          </h1>

          <div
            className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-3 border-b border-line pb-7"
            data-reveal
          >
            <span className="u-eyebrow">{course.category}</span>
          </div>

          <p
            className="u-prose mt-8 max-w-[40ch] text-[length:var(--text-h3)] leading-snug text-bone"
            data-reveal
          >
            {course.short_description}
          </p>
        </div>
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
              alt={hero.label}
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
            {course.description && (
              <>
                <h2 className="u-eyebrow">課程說明</h2>
                <div className="mt-7 flex max-w-[58ch] flex-col gap-5">
                  {course.description.split(/\n{2,}/).map((paragraph, i) => (
                    <p key={i} className="u-prose whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </>
            )}

            {sections.length > 0 && (
              <div className="mt-14 flex flex-col gap-10">
                {sections.map((section) => {
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

        </div>
      </section>

      {facts.length > 0 && (
        <section className="border-t border-line py-[var(--spacing-section)]">
          <div className="u-shell">
            <h2 className="u-eyebrow" data-reveal>
              課程資訊
            </h2>
            <ul className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              {facts.map((fact) => {
                const { label, value } = fact;
                return (
                  <li
                    key={label}
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
            <div className="border-b border-line pb-6">
              <h2 className="u-eyebrow">作品展示</h2>
            </div>

            <div className="mt-10 grid grid-cols-2 items-start gap-x-[clamp(0.75rem,2.5vw,2.5rem)] gap-y-[clamp(1.75rem,5vw,4.5rem)] sm:mt-12 lg:grid-cols-3">
              {plates.map((asset) => (
                <div key={asset.src} data-reveal>
                  <Plate
                    asset={asset}
                    title={asset.label}
                    caption={asset.caption}
                    sizes="(min-width: 1024px) 30vw, 45vw"
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
                {next.title}
              </h2>
              <p className="u-label-caption mt-4 max-w-[46ch] text-[length:var(--text-body)]">
                {next.short_description}
              </p>
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
