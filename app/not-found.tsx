import Link from "next/link";

export default function NotFound() {
  return (
    <section className="u-shell flex min-h-[60vh] flex-col justify-center py-[var(--spacing-section)]">
      <p className="u-eyebrow">404</p>
      <h1 className="u-display mt-6 text-[length:var(--text-h1)] text-bone">
        This page
        <br />
        is not hung.
      </h1>
      <p className="u-prose mt-7 max-w-[42ch]">
        The address you followed does not match anything in the archive.
      </p>
      <Link
        href="/"
        className="mt-10 self-start border border-line-2 px-5 py-2.5 text-[length:var(--text-micro)] tracking-[0.18em] text-bone uppercase transition-colors hover:border-bone hover:bg-bone hover:text-ink"
      >
        Back to the work
      </Link>
    </section>
  );
}
