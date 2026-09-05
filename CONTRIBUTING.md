# Contributing

This is a template repository, not a hosted product — most people using it will fork or clone it rather than send changes back. Contributions that improve the template itself (the Next.js app, components, scripts, docs, or host config) are still welcome.

## Running it locally

```bash
git clone https://github.com/eapenzacharias/designer-portfolio-template.git
cd designer-portfolio-template
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npm run dev` seeds `content/` and `public/work/` from the example files in `content.example/` and `placeholders/` automatically, so this works with no further setup.

Before proposing a change, also run:

```bash
npm run typecheck
npm run lint
npm run build
```

All three should pass cleanly.

## What a good issue looks like

- A clear description of what's broken or missing, and, for a bug, the steps to reproduce it starting from a fresh clone.
- Whether it happens in `npm run dev`, `npm run build`, or a specific host (Netlify / Cloudflare Pages) — static-export bugs are sometimes host-specific.

## What a good PR looks like

- One change per PR — a content-pipeline fix and a styling tweak should be two PRs, not one.
- Passes `npm run typecheck`, `npm run lint`, and `npm run build` before you open it.
- Explains *why*, not just *what*, if the change isn't self-evident from the diff.

## Content and image files are never part of a PR

`content/`, `public/work/`, `_source/`, and `website.txt` are gitignored intentionally — they hold real, personal site content (someone's name, their client work, their photography), and the whole point of that boundary is that it never enters this repository's history. If your PR touches functionality that reads from those directories, test it against `content.example/` and `placeholders/` instead, and don't `git add -f` your way around the ignore rules. A PR that adds files under any of those paths will be asked to remove them before it can be merged.

If you're changing what the *example* content looks like (the demo site a fresh clone shows), edit `content.example/` — that directory is tracked and is exactly what's meant to be public.
