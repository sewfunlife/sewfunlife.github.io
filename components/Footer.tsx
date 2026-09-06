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
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
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
