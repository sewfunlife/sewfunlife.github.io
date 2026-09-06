import Link from "next/link";
import { site } from "@/lib/content";

/* `compact: false` drops the item on narrow phones, where four links plus the
   name will not fit without pushing the page sideways. Everything stays
   reachable by scrolling, so nothing is lost. */
const NAV = [
  { label: "Work", href: "/#work", compact: true },
  { label: "Services", href: "/#services", compact: false },
  { label: "About", href: "/#about", compact: true },
];

export default function Header() {
  /* On a phone the full name would truncate mid-word, so the first name stands
     in for it. Two links do not earn a hamburger — hiding them behind a menu
     would add a tap, a script and a focus trap to save 90 pixels. */
  const firstName = site.name.trim().split(/\s+/)[0] ?? site.name;
  const instagram = site.social.instagram;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="u-shell flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
        <Link
          href="/"
          aria-label={`${site.name} — home`}
          className="flex min-h-11 shrink-0 items-center text-[length:var(--text-meta)] font-semibold tracking-[0.14em] text-bone uppercase sm:tracking-[0.16em]"
        >
          <span className="sm:hidden">{firstName}</span>
          <span className="hidden sm:inline">{site.name}</span>
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 sm:gap-7">
            {NAV.map((item) => (
              <li
                key={item.href}
                className={item.compact ? undefined : "hidden sm:block"}
              >
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center text-[length:var(--text-micro)] tracking-[0.16em] text-bone-2 uppercase transition-colors hover:text-bone sm:tracking-[0.18em]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {(site.email || instagram) && (
              <li>
                <a
                  href={site.email ? `mailto:${site.email}` : instagram}
                  target={!site.email && instagram ? "_blank" : undefined}
                  rel={!site.email && instagram ? "noreferrer" : undefined}
                  className="flex min-h-9 items-center border border-line-2 px-3 text-[length:var(--text-micro)] tracking-[0.14em] text-bone uppercase transition-colors hover:border-bone hover:bg-bone hover:text-ink sm:tracking-[0.18em]"
                >
                  {site.email ? "Email" : "Instagram"}
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
