export const languages = { en: 'English', tr: 'Türkçe' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

/** A string that exists in every language. */
export type Localized = Record<Lang, string>;

const ui = {
  en: {
    'meta.description':
      'Tuna Kimyonok — Computer Engineering student building backend systems, RAG pipelines and real-time voice AI.',
    'skip': 'Skip to content',
    'nav.projects': 'Projects',
    'nav.stack': 'Stack',
    'nav.experience': 'Experience',
    'nav.contact': 'Contact',
    'theme.toggle': 'Toggle dark mode',
    'lang.switch': 'TR',
    'lang.switchLabel': 'Türkçe sürüm',
    'hero.projects': 'View projects',
    'hero.cv': 'Download CV',
    'projects.title': 'Featured projects',
    'projects.intro':
      'Each case study covers the problem, the architecture decisions and why I made them, what went wrong, and the results.',
    'projects.caseStudy': 'Read case study',
    'status.completed': 'Completed',
    'status.in-progress': 'In progress',
    'status.prototype': 'Working prototype',
    'draft': 'Draft · hidden in production',
    'link.repo': 'Source code',
    'link.demo': 'Live demo',
    'link.video': 'Video',
    'link.docs': 'Docs',
    'stack.title': 'Tech stack',
    'stack.intro': 'Tools I have shipped features with, not everything I have touched.',
    'experience.title': 'Experience',
    'education.title': 'Education',
    'contact.title': 'Contact',
    'contact.text':
      'I am looking for backend and applied AI engineering roles. Email is the fastest way to reach me.',
    'project.back': 'All projects',
    'project.glance': 'At a glance',
    'project.flow': 'How it works',
    'project.stack': 'Stack',
    'project.next': 'Next project',
    'footer.built': 'Built with Astro · Source on GitHub',
    '404.title': 'Page not found',
    '404.back': 'Back to home',
  },
  tr: {
    'meta.description':
      'Tuna Kimyonok — Backend sistemleri, RAG hatları ve gerçek zamanlı sesli yapay zekâ geliştiren Bilgisayar Mühendisliği öğrencisi.',
    'skip': 'İçeriğe geç',
    'nav.projects': 'Projeler',
    'nav.stack': 'Teknolojiler',
    'nav.experience': 'Deneyim',
    'nav.contact': 'İletişim',
    'theme.toggle': 'Karanlık modu değiştir',
    'lang.switch': 'EN',
    'lang.switchLabel': 'English version',
    'hero.projects': 'Projeleri incele',
    'hero.cv': 'CV indir',
    'projects.title': 'Öne çıkan projeler',
    'projects.intro':
      'Her vaka analizi problemi, mimari kararları ve gerekçelerini, karşılaşılan zorlukları ve sonuçları anlatır.',
    'projects.caseStudy': 'Vaka analizini oku',
    'status.completed': 'Tamamlandı',
    'status.in-progress': 'Geliştiriliyor',
    'status.prototype': 'Çalışan prototip',
    'draft': 'Taslak · yayında gizli',
    'link.repo': 'Kaynak kod',
    'link.demo': 'Canlı demo',
    'link.video': 'Video',
    'link.docs': 'Dokümantasyon',
    'stack.title': 'Teknoloji yığını',
    'stack.intro': 'Dokunduğum her araç değil; gerçekten özellik geliştirip teslim ettiklerim.',
    'experience.title': 'Deneyim',
    'education.title': 'Eğitim',
    'contact.title': 'İletişim',
    'contact.text':
      'Backend ve uygulamalı yapay zekâ mühendisliği pozisyonlarına açığım. Bana en hızlı e-postayla ulaşabilirsiniz.',
    'project.back': 'Tüm projeler',
    'project.glance': 'Özet',
    'project.flow': 'Nasıl çalışıyor',
    'project.stack': 'Teknolojiler',
    'project.next': 'Sonraki proje',
    'footer.built': 'Astro ile geliştirildi · Kaynak kod GitHub’da',
    '404.title': 'Sayfa bulunamadı',
    '404.back': 'Ana sayfaya dön',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['en'];

export function useTranslations(lang: Lang) {
  return (key: UiKey): string => ui[lang][key];
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Builds a site URL for a language. path starts with "/" (e.g. "/projects/foo/"). */
export function localePath(lang: Lang, path = '/'): string {
  const prefix = lang === defaultLang ? '' : `/${lang}`;
  return `${base}${prefix}${path}`;
}

/** Builds a URL for a file in /public (e.g. "/cv/file.pdf"). */
export function assetPath(path: string): string {
  return `${base}${path}`;
}

export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'tr' : 'en');
