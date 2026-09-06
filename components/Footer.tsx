import { site } from "@/lib/content";
import { socialLinks } from "@/lib/social";

function SocialIcon({ label }: { label: string }) {
  if (label === "Instagram") {
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5.25" />
        <circle cx="12" cy="12" r="4.15" />
        <circle cx="17.45" cy="6.65" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (label === "Threads") {
    return (
      <svg className="h-[23px] w-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.4 8.2c-1.05-2.25-2.9-3.55-5.35-3.55-3.9 0-6.55 2.95-6.55 7.15 0 4.35 2.65 7.25 6.75 7.25 3.5 0 5.95-1.95 5.95-4.75 0-2.5-1.8-3.95-4.8-3.95-2.8 0-4.65 1.25-4.65 3.2 0 1.6 1.25 2.65 3.05 2.65 2.95 0 4.9-2.55 4.6-6.05-.2-2.45-1.35-4.55-3.55-5.5" />
      </svg>
    );
  }

  if (label === "Facebook") {
    return (
      <svg className="h-[25px] w-[25px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.8 21v-8h2.75l.4-3.1H13.8V7.95c0-.9.3-1.65 1.65-1.65h1.7V3.55c-.3-.05-1.35-.15-2.55-.15-2.6 0-4.35 1.6-4.35 4.4v2.1H7.4V13h2.85v8h3.55Z" />
      </svg>
    );
  }

  if (label === "LINE") {
    return (
      <svg className="h-6 w-8" viewBox="0 0 32 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M16 2.5C8.55 2.5 2.5 6.72 2.5 11.92c0 4.66 4.45 8.48 10.6 9.2.43.09.82.42.82.88l-.12 1.55c-.05.63.62 1.02 1.15.68 3.58-2.27 6.34-4.06 8.13-5.84 2.63-2.18 4.42-4.1 4.42-6.47C27.5 6.72 23.45 2.5 16 2.5Z"
        />
        <g
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          transform="translate(7.75 8.85)"
        >
          <path d="M0 0v5h2.7" />
          <path d="M4.25 0v5" />
          <path d="M6.25 5V0l4 5V0" />
          <path d="M12.4 0h3.2M12.4 0v5M12.4 2.5h2.7M12.4 5h3.2" />
        </g>
      </svg>
    );
  }

  if (label === "Email") {
    return (
      <svg className="h-[23px] w-[23px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
                className="flex h-8 min-w-8 items-center justify-center text-bone-2 transition-colors hover:text-bone"
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
