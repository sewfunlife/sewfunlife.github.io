import type { Asset } from "./types";

/**
 * Builds a `srcset` from an asset's full-size file and its 800px variant, so
 * the browser can pick the cheaper file on a phone. Returns undefined when
 * there is no smaller variant to offer, in which case the plain `src` is used
 * and nothing changes.
 *
 * The descriptors are the files' real pixel widths, which is what lets the
 * browser combine them with `sizes` and the device pixel ratio to choose
 * correctly — a 2x phone rendering a plate at 170 CSS px asks for ~340px and
 * takes the 800px file; a desktop rendering it at 460 CSS px takes the full one.
 */
export function srcSetFor(asset: Asset): string | undefined {
  if (!asset.sm || !asset.smW || asset.smW >= asset.w) return undefined;
  return `${asset.sm} ${asset.smW}w, ${asset.src} ${asset.w}w`;
}
