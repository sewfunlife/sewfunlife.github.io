"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

export default function MobileMenu({
  items,
  line,
}: {
  items: NavItem[];
  line?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "關閉導覽選單" : "開啟導覽選單"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center text-bone-2 transition-colors hover:text-bone"
      >
        {open ? (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        )}
      </button>

      {open && (
        <nav
          id="mobile-navigation"
          aria-label="手機主要導覽"
          className="absolute inset-x-0 top-full border-b border-line bg-ink/98 backdrop-blur-md"
        >
          <div className="u-shell py-4">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href} className="border-b border-line last:border-b-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center py-3 text-[length:var(--text-body)] text-bone transition-colors hover:text-bone-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {line && (
              <a
                href={line}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mt-4 flex min-h-11 items-center justify-center border border-line-2 px-4 text-[length:var(--text-meta)] font-semibold tracking-[0.12em] text-bone transition-colors hover:border-bone hover:bg-bone hover:text-ink"
              >
                聯絡
              </a>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
