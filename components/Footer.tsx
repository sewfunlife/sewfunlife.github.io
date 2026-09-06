import { site } from "@/lib/content";
import { socialLinks } from "@/lib/social";

export default function Footer() {
  const links = socialLinks(site.social);
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="border-t border-line">
      <div className="u-shell py-[var(--spacing-section)]">
        <p className="u-eyebrow">課程邀約・合作・報名</p>

        <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3 text-[length:var(--text-meta)] tracking-[0.16em] text-bone-2 uppercase">
          {links.map((link, index) => (
            <li key={link.label} className="flex items-center gap-x-3">
              {index > 0 && <span aria-hidden="true">・</span>}
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                className="underline decoration-line-2 underline-offset-[6px] transition-colors hover:text-bone hover:decoration-bone"
              >
                {link.label}
              </a>
            </li>
          ))}
          {site.email && (
            <li className="flex items-center gap-x-3">
              {links.length > 0 && <span aria-hidden="true">・</span>}
              <a
                href={`mailto:${site.email}`}
                className="underline decoration-line-2 underline-offset-[6px] transition-colors hover:text-bone hover:decoration-bone"
              >
                Email
              </a>
            </li>
          )}
        </ul>

        <div className="mt-14 border-t border-line pt-7 text-left text-[length:var(--text-micro)] tracking-[0.14em] text-bone-3 uppercase">
          © {year} {site.name}｜Sew Fun Life
        </div>
      </div>
    </footer>
  );
}
