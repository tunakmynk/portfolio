import type { APIRoute } from 'astro';
import { profile, skills } from '../data/profile';
import { getProjects, projectSlug } from '../lib/projects';

/*
 * Generates the README for github.com/tunakmynk/tunakmynk from the same data
 * the site and the CV use. Run `npm run sync` to write it into
 * github-profile/README.md — never edit that file by hand, it gets overwritten.
 */

const firstName = profile.name.split(' ')[0];

/** Markdown tables break on a raw "|", and long text is better on one line. */
const cell = (text: string) => text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();

export const GET: APIRoute = async ({ site }) => {
  const origin = site ? site.origin.replace(/\/$/, '') : 'https://tunakimyonok.vercel.app';
  /* Every published project is listed. One without a public repo — an
     internship project, say — links to its case study instead. */
  const featured = await getProjects('en');

  const lines: string[] = [];

  lines.push(`### Hi, I'm ${firstName} 👋`, '');
  lines.push(`**${profile.role.en}** — ${profile.summary.en}`, '');
  lines.push(profile.headline.en, '');

  const links = [
    `🌐 **Portfolio & case studies:** [${site ? site.host : 'tunakimyonok.vercel.app'}](${origin})`,
    `📄 [CV](${origin}${profile.cv.en})`,
    `💼 [LinkedIn](${profile.linkedin})`,
    `✉️ ${profile.email}`,
  ];
  lines.push(links.join(' · '), '', '---', '');

  if (featured.length > 0) {
    lines.push('#### 🔭 Featured projects', '');
    lines.push('| Project | What it shows | Stack |');
    lines.push('|---|---|---|');

    for (const project of featured) {
      const { title, tagline, stack, links: projectLinks } = project.data;
      const caseStudy = `${origin}/projects/${projectSlug(project)}/`;

      const extras: string[] = [];
      if (projectLinks.repo) extras.push(`[Case study](${caseStudy})`);
      if (projectLinks.video) extras.push(`[▶ Video](${projectLinks.video})`);
      if (projectLinks.demo) extras.push(`[Live demo](${projectLinks.demo})`);

      const name = `[**${cell(title)}**](${projectLinks.repo ?? caseStudy})`;
      const what = [cell(tagline), ...extras].join(' ');
      lines.push(`| ${name} | ${what} | ${stack.map(cell).join(' · ')} |`);
    }
    lines.push('');
  }

  lines.push('#### 🛠️ Tech I build with', '');
  for (const group of skills) {
    lines.push(`**${group.category.en}:** ${group.items.join(' · ')}  `);
  }
  lines.push('');
  /* No location here on purpose: next to the availability line it reads as a
     limit on where he will work, rather than as a fact about where he lives. */
  lines.push(`> ${profile.availability.en}.`);
  lines.push('');
  lines.push('<!-- Generated from src/data/profile.ts by `npm run sync`. Do not edit by hand. -->');
  lines.push('');

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
