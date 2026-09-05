# Designer Portfolio Template

A static, image-forward portfolio template for graphic designers, built with Next.js. It deploys as pure static files to Netlify or Cloudflare Pages — no server, no adapter.

This is a **template**, not a finished site. Clone it, run it, and it works immediately with example copy and stand-in imagery. Everything you'd normally have to strip out of a demo — the previous owner's name, their projects, their photos — lives in files that are gitignored by design, so your real content never gets tangled up with the template's history and never has to be scrubbed before you push.

## Quick start

```bash
git clone https://github.com/eapenzacharias/designer-portfolio-template.git
cd designer-portfolio-template
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — no environment variables, no database, no setup step you have to remember. The first `npm run dev` seeds `content/` and `public/work/` from the example files shipped in the repo, so you're looking at a complete, working demo site with placeholder projects and placeholder artwork.

## Make it yours

Everything the site displays is data. You should never need to edit a component to change what the site says — only what it looks like.

| Want to change | Edit |
| --- | --- |
| Your name, role, email, location, tagline | `content/site.json` → `name`, `role`, `email`, `location`, `tagline` |
| The intro / about paragraphs | `content/site.json` → `intro` and `about` (each an array of paragraph strings) |
| The services list | `content/site.json` → `services` (array of `{ title, body }`) |
| Social links | `content/site.json` → `social.instagram`, `.behance`, `.linkedin`, `.dribbble`, `.phone` — leave any of them as `""` and that link disappears from the footer automatically |
| SEO title, description, canonical URL | `content/site.json` → `seo.siteName`, `seo.description`, `seo.url` |
| Which projects exist, and their order | `content/projects.json` — a top-level array; projects render in this array's order, home page and detail-page "next project" both follow it |
| A project's title, tagline, summary | that project's `title`, `displayTitle` (the large stylised heading), `tagline`, `summary` in `content/projects.json` |
| A project's colour palette (shown as swatches + the homepage colour band) | that project's `palette` — array of `{ hex, name? }` |
| A project's typefaces (shown in the actual face) | that project's `typography` — array of `{ family, styles: [] }`. `family` should be one of the bundled specimen faces (`Montserrat`, `Cormorant Garamond`, `Playfair Display`, `Cinzel`) or it silently falls back to the display face |
| A project's mood-board wall captions | that project's `plates` — array of `{ key, title, caption }`, joined to an actual image file by `key` (see below) |
| A project's "release journey" steps or key-facts grid | that project's `steps` (array of `{ n, title, body }`) and `facts` (array of strings) — both optional, omit or empty the array to hide the section |
| Site-wide colours (background, text, borders) | `app/globals.css` → the `--color-*` custom properties in the `@theme` block. There is no global accent colour by design — the artwork supplies the colour, the chrome stays neutral |
| Fonts | `lib/fonts.ts` — swap which Google Font populates the `syne` (display) and `archivo` (body) declarations |
| Images | see **Adding your own images** below |

The full shape of every content file is defined in `lib/types.ts` — that file is the schema, and it's short enough to read end to end if a table entry above isn't specific enough.

## Adding your own images

Originals go in `_source/` (gitignored, never committed). Run:

```bash
npm run images
```

This runs `scripts/optimize-images.mjs`, which uses `sharp` to convert every matched PNG in `_source/` into a WebP capped at 1600px on its longest edge, quality 80, and writes the result into `public/work/<slug>/`. It also (re)writes `content/images.json` — the manifest the site actually reads at build time, recording each image's real pixel width/height (used to reserve layout space and avoid shift) and its dominant colour (used as a placeholder fill while it loads).

**Naming convention.** Name source files `PROJECT_NN_Description.png`. The script reads the name and works the rest out for itself:

| Part | Example | What it controls |
| --- | --- | --- |
| `PROJECT` | `MY_BRAND` | The project slug — lowercased, underscores become hyphens (`my-brand`). No registration step; a new prefix just works |
| `NN` | `03` | Sort order, and the first half of the manifest `key` (zero-padded to `03`) |
| `Description` | `Window_Light` | The second half of the `key` (`03-window-light`) and the human-readable `label` |

So `MY_BRAND_03_Window_Light.png` becomes `/work/my-brand/mood-03-window-light.webp` with key `03-window-light`. Adding a new project needs no code change at all.

**Which category an image lands in** comes from the subfolder you put it in under `_source/`: a folder starting `01_` → `mood`, `02_` → `app`, `03_` → `mood`, `04_` → `cover`. Files sitting loose at the top of `_source/` become `deck` (wide presentation spreads).

Two escape hatches, both optional and documented in the script's header comment:

1. `PREFIX_ALIASES` — collapse several filename prefixes into one project (this repo uses it so `REAL_ESTATE_OPEN_HOUSE_*` and `REAL_ESTATE_BROCHURE_A_*` both land under `real-estate`).
2. `CATEGORY_OVERRIDES` — force a specific prefix into a different category than its folder implies.

Files that match nothing are never skipped silently — they're processed under a `studio` slug and logged.

For a genuine one-off you can skip the script entirely: save an already-optimized WebP straight into `public/work/<slug>/`, then add a matching object to `content/images.json` by hand:

   ```json
   {
     "src": "/work/<slug>/mood-03-window-light.webp",
     "w": 1600,
     "h": 1067,
     "key": "03-window-light",
     "label": "Window Light",
     "dom": "#2b2925"
   }
   ```

**How an image becomes a captioned plate.** Each image's `key` (the `<nn>-<name-slug>` part of its filename, e.g. `03-window-light`) is what ties it to a plate. In `content/projects.json`, a project's `plates` array carries the curator's copy for that same `key`:

```json
{ "key": "03-window-light", "title": "Window Light", "caption": "Late afternoon, north-facing." }
```

An image with no matching `plates` entry still displays (using its own `label`) — captions are additive, not required. A `plates` entry with no matching image simply doesn't render anything.

Run `npm run placeholders` after `npm run images` if you want to regenerate the tiny, tracked stand-in images in `placeholders/` to match your new manifest (only needed if you're preparing this repo as a template for someone else — your own `public/work/` files are what your own site actually serves).

## Why your content is not in this repo

`content/`, `public/work/`, and `_source/` are all listed in `.gitignore`. The repo ships two committed stand-ins instead — `content.example/` (example copy and project data) and `placeholders/` (tiny flat-colour images) — and `scripts/seed.mjs` copies whichever of your own files are missing from those examples every time you run `npm run dev` or `npm run build`. It only ever fills in gaps; anything you've already put in `content/` or `public/work/` is left untouched.

This means your real name, your real client work, and your real photography never enter this repository's git history — not by discipline, but because the tooling makes it structurally impossible to commit them by accident. It also means that if you publish your own fork or template from this one, the same protection carries forward for whoever clones it from you.

## Deploying

The build is fully static — `next.config.ts` sets `output: "export"`, so `npm run build` writes a complete site (HTML, CSS, JS, images) into `out/` with no server-side rendering and no image-optimization endpoint to run. `next.config.ts` also sets `trailingSlash: true`, which makes every route export as `/work/<slug>/index.html` rather than `/work/<slug>.html` — that's what lets both hosts below serve clean URLs (`/work/faded/`, not `/work/faded`) with zero redirect-rule configuration. Between the two, no framework adapter and no build plugin are required; both hosts are just told "run this build command, serve this folder."

### Netlify

1. Push this repo to GitHub under your own account.
2. In Netlify: **Add new site → Import an existing project**, and pick the repo.
3. Build settings (already checked into `netlify.toml`, so Netlify should detect these automatically — verify them under **Site settings → Build & deploy**):
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: `20` (or later)
4. Deploy. `netlify.toml` also sets security headers and long-lived cache headers for `/work/*` and `/_next/static/*` — see that file for details.

### Cloudflare Pages

1. Push this repo to GitHub under your own account.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**, and pick the repo.
3. Build settings:
   - Framework preset: none needed — set the fields directly
   - Build command: `npm run build`
   - Build output directory: `out`
4. Under **Settings → Environment variables**, set `NODE_VERSION` to `20` (or later). Cloudflare Pages doesn't read `netlify.toml`, so this step is separate from the Netlify config.
5. Deploy. Headers for Cloudflare Pages come from `public/_headers`, which Next's static export copies into `out/_headers` automatically — Cloudflare Pages reads that file natively, no plugin required.

## Project structure

```
.
├── app/                     Next.js App Router
│   ├── layout.tsx             Root HTML shell: fonts, header, footer, skip link, <head>
│   ├── page.tsx                Home page: hero, work grid, services, about
│   ├── work/[slug]/page.tsx    One project's case-study page
│   ├── globals.css             Design tokens (colour, type scale, spacing) + base styles
│   ├── icon.svg                 Favicon
│   ├── not-found.tsx            404 page
│   ├── robots.ts                 Generates /robots.txt
│   └── sitemap.ts                Generates /sitemap.xml from content/projects.json
├── components/               Presentational React components (no content hardcoded)
├── lib/
│   ├── content.ts               Reads content/*.json at build time, with fallbacks
│   ├── types.ts                  TypeScript shapes for the content JSON — the schema
│   ├── fonts.ts                   next/font declarations (Syne, Archivo, specimen faces)
│   └── social.ts                  Turns content/site.json's social fields into safe links
├── content.example/          Example copy + project data — tracked, ships in the repo
├── content/                   Your real copy + project data — gitignored
├── placeholders/              Tiny stand-in images — tracked, ships in the repo
├── public/
│   ├── _headers                  Cloudflare Pages response headers
│   └── work/                     Your real images — gitignored
├── _source/                   Your original image exports, input to `npm run images` — gitignored
├── scripts/
│   ├── seed.mjs                   content.example/ → content/, placeholders/ → public/work/
│   ├── optimize-images.mjs         _source/ → public/work/**.webp + content/images.json
│   └── make-placeholders.mjs        content/images.json → placeholders/
├── netlify.toml               Netlify build command, publish dir, headers
├── docs/
│   └── EDITING-WITH-AI.md       Guide + copy-paste prompts for editing with an AI assistant
└── out/                        Build output — generated, gitignored
```

## Commands

| Command | Runs | What it does |
| --- | --- | --- |
| `npm run dev` | `next dev` (after `predev` runs `npm run seed`) | Starts the dev server, seeding example content/images first if either is missing |
| `npm run build` | `next build` (after `prebuild` runs `npm run seed`) | Produces the static site in `out/` |
| `npm run seed` | `node scripts/seed.mjs` | Copies `content.example/` → `content/` and `placeholders/` → `public/work/` for any file not already present |
| `npm run images` | `node scripts/optimize-images.mjs` | Converts originals in `_source/` to sized WebP under `public/work/` and (re)writes `content/images.json` |
| `npm run placeholders` | `node scripts/make-placeholders.mjs` | Regenerates the tiny tracked stand-in images in `placeholders/` from `content/images.json` |
| `npm run preview` | `npx --yes serve out` | Serves the built `out/` directory locally, to check the production build before deploying |
| `npm run lint` | `eslint` | Lints the codebase |
| `npm run typecheck` | `tsc --noEmit` | Type-checks the codebase without emitting files |

## Accessibility & performance notes

- The site ships as static HTML — there's no client-side render blocking the first paint.
- Every photograph is served as WebP, generated at build time by `scripts/optimize-images.mjs`.
- Images below the fold load with `loading="lazy"`; only the hero image and the first project card load eagerly.
- Every `<img>` carries explicit `width`/`height` (from `content/images.json`) plus an `aspect-ratio` and a dominant-colour background, so nothing shifts as images load in.
- `prefers-reduced-motion: reduce` is respected — scroll-triggered reveals and hover-zoom transitions are disabled for users who've asked for less motion (`app/globals.css`, `components/Plate.tsx`).
- Focus is always visible: a `:focus-visible` outline is defined globally, and a "Skip to content" link is the first focusable element on every page (`app/layout.tsx`).

## Licence

The code in this repository — the Next.js app, components, `lib/`, `scripts/`, and configuration — is MIT licensed. See `LICENSE`. The example copy in `content.example/` is part of that same MIT-licensed template and is meant to be replaced.

Once you (or anyone) uses this template to build a real site, the words and imagery you put into `content/`, `public/work/`, and `_source/` are yours (or your clients'), not covered by the MIT licence, and — because those directories are gitignored — never actually enter this repository's history in the first place.
