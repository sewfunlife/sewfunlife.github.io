import type { Social } from "./types";

export type Link = { label: string; href: string; handle: string };

/**
 * Accepts whatever the owner typed into content/site.json — a bare handle
 * (`@studio`), a handle without the at sign, a domain-relative path, or a full
 * URL — and returns a usable link. Anything blank is dropped, so an unfilled
 * field never ships as a dead link.
 */
const BUILDERS: Array<{
  key: keyof Social;
  label: string;
  base: string;
}> = [
  { key: "instagram", label: "Instagram", base: "https://instagram.com/" },
  { key: "behance", label: "Behance", base: "https://behance.net/" },
  { key: "linkedin", label: "LinkedIn", base: "https://linkedin.com/in/" },
  { key: "dribbble", label: "Dribbble", base: "https://dribbble.com/" },
];

function toUrl(value: string, base: string): string {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes(".") && trimmed.includes("/")) return `https://${trimmed}`;
  return base + trimmed.replace(/^@/, "");
}

export function socialLinks(social: Social): Link[] {
  const links = BUILDERS.flatMap(({ key, label, base }) => {
    const value = social[key];
    if (!value || !value.trim()) return [];
    return [{ label, href: toUrl(value, base), handle: value.trim() }];
  });

  const phone = social.phone?.trim();
  if (phone) {
    links.push({
      label: "Phone",
      href: `tel:${phone.replace(/[^\d+]/g, "")}`,
      handle: phone,
    });
  }

  return links;
}
