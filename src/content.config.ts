import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Projects live in src/content/projects/<lang>/<slug>.md
 * The same file name in en/ and tr/ makes a translation pair.
 */
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    /** One sentence shown on the project card. */
    tagline: z.string(),
    /** Short category label, e.g. "Applied AI · RAG". */
    category: z.string(),
    period: z.string(),
    status: z.enum(['completed', 'in-progress', 'prototype']),
    /** Lower numbers are listed first. */
    order: z.number(),
    /** Drafts are visible in `npm run dev` but excluded from the production build. */
    draft: z.boolean().default(false),
    stack: z.array(z.string()),
    /**
     * Bullet points for this project on the CV, in this file's language.
     * Leave empty to keep the project off the CV (it still appears on the site).
     */
    cv: z.array(z.string()).default([]),
    /**
     * Photos and a clip for the project page. Files live in /public (e.g.
     * '/media/foo.jpg'). Captions are per-language, so write them in this file.
     */
    media: z
      .object({
        images: z
          .array(z.object({ src: z.string(), alt: z.string(), caption: z.string().optional() }))
          .default([]),
        video: z
          .object({
            src: z.string(),
            poster: z.string().optional(),
            caption: z.string().optional(),
          })
          .optional(),
      })
      .optional(),
    highlights: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    pipeline: z.array(z.object({ step: z.string(), detail: z.string() })).default([]),
    links: z
      .object({
        repo: z.url().optional(),
        demo: z.url().optional(),
        video: z.url().optional(),
        docs: z.url().optional(),
      })
      .default({}),
  }),
});

export const collections = { projects };
