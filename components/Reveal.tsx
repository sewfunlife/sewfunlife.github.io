"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveals.
 *
 * This deliberately runs in an effect rather than as an inline script. An
 * inline script would mutate React-rendered elements (adding `data-shown`)
 * before hydration, and React would then find a DOM that does not match the
 * tree it rendered — a hydration mismatch, which it may resolve by discarding
 * and re-rendering the subtree, stripping the attribute and leaving the
 * content invisible.
 *
 * There is no bundle-size argument against it either: the App Router ships the
 * React client runtime regardless, so the cost here is the observer itself.
 */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const show = (el: Element) => el.setAttribute("data-shown", "");
    const targets = () =>
      document.querySelectorAll("[data-reveal]:not([data-shown])");

    if (!("IntersectionObserver" in window)) {
      targets().forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px 12% 0px", threshold: 0.01 },
    );

    targets().forEach((el) => io.observe(el));

    /* Client-side navigation swaps the tree without remounting the root, so
       new plates have to be picked up as they arrive. */
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches("[data-reveal]:not([data-shown])")) io.observe(node);
          node
            .querySelectorAll("[data-reveal]:not([data-shown])")
            .forEach((el) => io.observe(el));
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
