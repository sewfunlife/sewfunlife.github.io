import { site } from "@/lib/content";
import { socialLinks } from "@/lib/social";

export default function Footer() {
  const links = socialLinks(site.social);
  const year = new Date().getFullYear();
  const instagram = site.social.instagram;

  /* Set large, a long address will wrap somewhere. Offering a break after the
     @ means it wraps there rather than mid-word ("exampl / e.com"). */
  const [mailbox, domain] = site.email.split("@");

  return (
    <footer id="contact" className="border-t border-line">
      <div className="u-shell py-[var(--spacing-section)]">
        <p className="u-eyebrow">課程邀約・合作・報名</p>

        {site.email ? (
          <a
            href={`mailto:${site.email}`}
            className="u-display mt-6 block text-[length:var(--text-h2)] break-words hyphens-none text-bone transition-opacity hover:opacity-60"
          >
            {domain ? (
              <>
                {mailbox}@<wbr />
                {domain}
              </>
            ) : (
              site.email
            )}
          </a>
        ) : instagram ? (
          <a
            href={instagram}
            target="_blank"
            rel="noreferrer"
            className="u-display mt-6 block text-[length:var(--text-h2)] break-words hyphens-none text-bone transition-opacity hover:opacity-60"
          >
            Instagram 私訊
          </a>
        ) : null}

        {links.length > 0 && (
          <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                  className="text-[length:var(--text-meta)] tracking-[0.16em] text-bone-2 uppercase underline decoration-line-2 underline-offset-[6px] transition-colors hover:text-bone hover:decoration-bone"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-20 flex flex-col gap-3 border-t border-line pt-7 text-[length:var(--text-micro)] tracking-[0.14em] text-bone-3 uppercase sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <span>
            © {year} {site.name}
          </span>
          {site.location && <span>{site.location}</span>}
          <span>{site.role}</span>
          {site.credit?.label && site.credit.url && (
            <a
              href={site.credit.url}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-line-2 underline-offset-[5px] transition-colors hover:text-bone hover:decoration-bone"
            >
              {site.credit.label}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
