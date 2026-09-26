import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';

export type Project = CollectionEntry<'projects'>;

/** Entry ids look like "en/dwarf-grom-llm-npc". */
export function parseId(id: string): { lang: string; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang, slug: rest.join('/') };
}

export const projectSlug = (project: Project) => parseId(project.id).slug;

/** Projects for one language, sorted by `order`. Drafts only appear in dev. */
export async function getProjects(lang: Lang): Promise<Project[]> {
  const projects = await getCollection(
    'projects',
    (p: Project) => parseId(p.id).lang === lang && (import.meta.env.DEV || !p.data.draft),
  );
  return projects.sort((a: Project, b: Project) => a.data.order - b.data.order);
}
