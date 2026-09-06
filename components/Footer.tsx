import { site } from "@/lib/content";
import { socialLinks } from "@/lib/social";

function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" />
        <circle cx="12" cy="12" r="4.15" />
        <circle cx="17.45" cy="6.65" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (label === "Threads") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.4 8.2c-1.05-2.25-2.9-3.55-5.35-3.55-3.9 0-6.55 2.95-6.55 7.15 0 4.35 2.65 7.25 6.75 7.25 3.5 0 5.95-1.95 5.95-4.75 0-2.5-1.8-3.95-4.8-3.95-2.8 0-4.65 1.25-4.65 3.2 0 1.6 1.25 2.65 3.05 2.65 2.95 0 4.9-2.55 4.6-6.05-.2-2.45-1.35-4.55-3.55-5.5" />
      </svg>
    );
  }

  if (label === "Facebook") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.8 21v-8h2.75l.4-3.1H13.8V7.95c0-.9.3-1.65 1.65-1.65h1.7V3.55c-.3-.05-1.35-.15-2.55-.15-2.6 0-4.35 1.6-4.35 4.4v2.1H7.4V13h2.85v8h3.55Z" />
      </svg>
    );
  }

  if (label === "LINE") {
    return (
      <svg className="h-6 w-7" viewBox="0 0 28 24" fill="currentColor" aria-hidden="true">
        <path d="M14 3.5c-6.05 0-11 3.8-11 8.5 0 4.2 3.9 7.7 9.2 8.35.36.08.85.25.98.58.12.3.08.76.04 1.06l-.16.98c-.05.29-.22 1.14.99.62 1.22-.52 6.55-3.86 8.94-6.6C24.64 15.18 25 13.45 25 12c0-4.7-4.95-8.5-11-8.5Zm-5.35 11.1H6.3a.57.57 0 0 1-.57-.57V9.55a.57.57 0 1 1 1.14 0v3.9h1.78a.57.57 0 1 1 0 1.14Zm2.14-.57a.57.57 0 1 1-1.14 0V9.55a.57.57 0 1 1 1.14 0v4.48Zm4.88 0a.57.57 0 0 1-1.03.34l-2.05-2.78v2.44a.57.57 0 1 1-1.14 0V9.55a.57.57 0 0 1 1.03-.34l2.05 2.78V9.55a.57.57 0 1 1 1.14 0v4.48Zm3.8-2.81a.57.57 0 1 1 0 1.14h-1.58v1.09h1.58a.57.57 0 1 1 0 1.14h-2.15a.57.57 0 0 1-.57-.57V9.55c0-.31.26-.57.57-.57h2.15a.57.57 0 1 1 0 1.14h-1.58v1.1h1.58Z" />
      </svg>
    );
  }

  if (label === "Email") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5.25" width="18" height="13.5" rx="1.8" />
        <path d="m4.5 7 7.5 5.3L19.5 7" />
      </svg>
    );
  }

  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.5 14.5 14.5 9.5M8 7h9v9" />
      <path d="M18 13v5H6V6h5" />
    </svg>
  );
}

export default function Footer() {
  const links = [
    ...socialLinks(site.social),
    ...(site.email ? [{ label: "Email", href: `mailto:${site.email}` }] : []),
  ];
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-line">
      <div className="u-shell py-[var(--spacing-section)]">
        <p className="u-eyebrow">課程邀約・合作・報名</p>

        <ul className="mt-7 flex flex-wrap items-center gap-6">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                aria-label={link.label}
                title={link.label}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex h-7 min-w-7 items-center justify-center text-bone-2 transition-colors hover:text-bone"
              >
                <SocialIcon label={link.label} />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-14 border-t border-line pt-7 text-left text-[length:var(--text-micro)] tracking-[0.14em] text-bone-3 uppercase">
          © {year} {site.name}｜Sew Fun Life
        </div>
      </div>
    </footer>
  );
}
