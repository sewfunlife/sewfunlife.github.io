import { srcSetFor } from "@/lib/images";
import type { Asset } from "@/lib/types";

type Props = {
  asset: Asset;
  title?: string;
  caption?: string;
  /** Only the page's first image should load eagerly; everything else defers. */
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * One framed image with its curator's wall label.
 *
 * The frame is fixed and clips; on hover the artwork itself breathes inside it.
 * That is the way a hang actually behaves — the wall does not move, the eye
 * moves closer — and it keeps the grid from shifting under the pointer.
 */
export default function Plate({
  asset,
  title,
  caption,
  priority = false,
  sizes,
  className = "",
}: Props) {
  const label = title ?? asset.label;

  return (
    <figure className={`group ${className}`}>
      <div
        className="relative overflow-hidden bg-ink-2"
        style={{ aspectRatio: `${asset.w} / ${asset.h}`, backgroundColor: asset.dom }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.src}
          srcSet={srcSetFor(asset)}
          sizes={sizes}
          width={asset.w}
          height={asset.h}
          alt={caption ? `${label}. ${caption}` : label}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "auto"}
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      {(label || caption) && (
        <figcaption className="mt-3 flex flex-col gap-1 pr-2">
          <span className="u-label-title">{label}</span>
          {caption && <span className="u-label-caption">{caption}</span>}
        </figcaption>
      )}
    </figure>
  );
}
