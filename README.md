# Tuna Kimyonok — Portfolio

Personal portfolio and engineering case studies, available in English and Turkish. It's a static site built with [Astro](https://astro.build): no client-side framework, and the only JavaScript is the theme toggle.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321  (draft projects are visible here)
npm run build    # type-check + static build into dist/ (drafts excluded)
npm run preview  # serve the production build
```

Requires Node.js 22.12+.

## Structure

```
src/
├── content/projects/{en,tr}/*.md   ← one Markdown file per case study, per language
├── content.config.ts               ← project frontmatter schema (validated at build time)
├── data/profile.ts                 ← name, links, CV path, skills, experience, education
├── i18n/ui.ts                      ← interface strings + URL helpers
├── views/                          ← HomePage / ProjectPage (shared by both languages)
├── components/                     ← Hero, ProjectCard, TechStack, Experience, Contact
├── pages/                          ← thin routes: /, /tr/, /projects/[slug]/, /tr/projects/[slug]/
└── styles/global.css               ← design tokens (light + dark)
public/cv/                          ← downloadable CV PDF
github-profile/README.md            ← template for the github.com/tunakmynk profile README
```

## Add a project

1. Copy an existing file in `src/content/projects/en/` and give it a new file name, like `my-project.md`. The file name becomes the URL.
2. Create the Turkish version with the **same file name** in `src/content/projects/tr/`.
3. Fill in the frontmatter. `npm run build` reports any missing or invalid fields.
4. Set `order` to control where it appears, and `draft: true` to keep it off the live site while you're writing.

## Deploy

**Vercel (recommended):** import the GitHub repository at vercel.com. Vercel detects Astro automatically, and every push to `main` deploys.
After deploying, set `site` in `astro.config.mjs` to the final URL.
