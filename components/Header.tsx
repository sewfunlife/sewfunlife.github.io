import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { site } from "@/lib/content";

const NAV = [
  { label: "課程", href: "/#work" },
  { label: "服務", href: "/#services" },
  { label: "關於", href: "/#about" },
];

export default function Header() {
  const firstName = site.name.trim().split(/\s+/)[0] ?? site.name;
  const line = site.social.line;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="u-shell flex h-14 items-center justify-between gap-3 sm:h-16 sm:gap-4">
        <Link
          href="/"
          aria-label={`${site.name} — 首頁`}
          className="flex min-h-11 shrink-0 items-center text-[length:var(--text-meta)] font-semibold tracking-[0.14em] text-bone uppercase sm:tracking-[0.16em]"
        >
          <span className="sm:hidden">{firstName}</span>
          <span className="hidden sm:inline">{site.name}</span>
        </Link>

        <div className="flex items-center gap-1 sm:hidden">
          <ThemeToggle />
          <MobileMenu items={NAV} line={line} />
        </div>

        <nav aria-label="主要導覽" className="hidden sm:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center text-[length:var(--text-micro)] tracking-[0.18em] text-bone-2 uppercase transition-colors hover:text-bone"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
            {line && (
              <li>
                <a
                  href={line}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-9 items-center border border-line-2 px-3 text-[length:var(--text-micro)] tracking-[0.18em] text-bone uppercase transition-colors hover:border-bone hover:bg-bone hover:text-ink"
                >
                  聯絡
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
