import { site } from "@/lib/content";
import { socialLinks } from "@/lib/social";

function SocialIcon({ label }: { label: string }) {
  const common = "h-5 w-5";

  if (label === "Instagram") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (label === "Threads") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16.8 8.4c-1-2.1-2.7-3.3-5-3.3-3.8 0-6.3 2.8-6.3 6.8 0 4.2 2.5 7 6.5 7 3.3 0 5.7-1.8 5.7-4.5 0-2.4-1.7-3.8-4.6-3.8-2.7 0-4.5 1.2-4.5 3.1 0 1.5 1.2 2.5 2.9 2.5 2.8 0 4.7-2.4 4.4-5.8-.2-2.3-1.3-4.3-3.4-5.2" />
      </svg>
    );
  }

  if (label === "Facebook") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.7 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6H17V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5v3h2.8v8h3.4Z" />
      </svg>
    );
  }

  if (label === "LINE") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 11.2c0 4-3.6 7.2-8 7.2-.8 0-1.6-.1-2.3-.3L5.5 20l1.1-3.4C5 15.3 4 13.4 4 11.2 4 7.2 7.6 4 12 4s8 3.2 8 7.2Z" />
        <circle cx="8.7" cy="11.2" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="12" cy="11.2" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="15.3" cy="11.2" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (label === "Email") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
        <path d="m5 7 7 5 7-5" />
      </svg>
    );
  }

  return (
    <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

        <ul className="mt-7 flex flex-wrap items-center gap-2.5">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                aria-label={link.label}
                title={link.label}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line-2 text-bone-2 transition-colors hover:border-bone hover:bg-bone hover:text-ink"
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
