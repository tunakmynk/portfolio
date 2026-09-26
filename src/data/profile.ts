import type { Localized } from '../i18n/ui';

/*
 * ─────────────────────────────────────────────────────────────
 *  Everything about you that is NOT a project lives here.
 *  When your CV changes, this is the file to update.
 *  Projects live in src/content/projects/ (one Markdown file each).
 * ─────────────────────────────────────────────────────────────
 */

export const profile = {
  name: 'Tuna Kimyonok',
  role: {
    en: 'Backend & Applied AI Engineer',
    tr: 'Backend & Uygulamalı Yapay Zekâ Mühendisi',
  } satisfies Localized,
  /** Hero headline: what you build, in one sentence. */
  headline: {
    en: 'I build the backend systems that take LLMs into production: RAG pipelines, real-time audio streaming, and the API architecture that ties them together.',
    tr: 'LLM’leri canlı ortama taşıyan backend sistemleri kuruyorum: RAG boru hatları (pipeline), gerçek zamanlı ses akışları ve bunları birbirine bağlayan API mimarileri.',
  } satisfies Localized,
  /** Hero sub-text: who you are right now. */
  summary: {
    en: 'I’m a final-year Computer Engineering student at Iskenderun Technical University. I like optimizing systems for speed and cost, designing architectures with AI built into them, and reading books that dig into the philosophy of software.',
    tr: 'İskenderun Teknik Üniversitesi’nde son sınıf Bilgisayar Mühendisliği öğrencisiyim. Sistemleri hem hız hem de maliyet yönünden optimize etmeyi, yapay zeka entegreli mimariler geliştirmeyi ve yazılımın felsefesine inen kitapları okumayı seviyorum.',
  } satisfies Localized,
  availability: {
    en: 'Open to Backend / AI Engineering roles',
    tr: 'Backend / AI Engineering pozisyonlarına açığım',
  } satisfies Localized,
  /**
   * The paragraph at the top of the CV. Deliberately separate from `summary`:
   * the site greets a visitor, the CV addresses a recruiter.
   */
  cvSummary: {
    en: 'I build end-to-end backend and applied AI systems and optimize them for speed and cost. During my last internship I built a voice assistant that answers from Turkish national curriculum (MEB) textbooks with its sources shown, from the ESP32-S3 firmware to the FastAPI backend, and cut time to first audio from 11 seconds to 3. I graduate in June 2027 and am available to work full-time.',
    tr: 'Backend ve uygulamalı yapay zekâ alanında uçtan uca sistemler geliştiriyor, bunları hız ve maliyet açısından optimize ediyorum. Son stajımda MEB ders kitaplarından kaynak göstererek cevap veren sesli bir asistanı ESP32-S3 firmware’inden FastAPI backend’ine kadar kurdum; ilk sese kadar geçen süreyi 11 saniyeden 3 saniyeye indirdim. Haziran 2027’de mezun oluyorum ve tam zamanlı çalışmaya uygunum.',
  } satisfies Localized,
  /**
   * Where and how he can work. Kept apart from `availability`, which renders as
   * a small pill in the hero and has to stay short. A bare location next to an
   * availability line reads as a limit on where he will work, so it is always
   * shown together with this.
   */
  workArrangement: {
    en: 'Remote, hybrid or on-site, and able to relocate within Türkiye or abroad.',
    tr: 'Uzaktan, hibrit veya ofiste çalışabilirim; Türkiye içinde ya da yurt dışında taşınabilirim.',
  } satisfies Localized,
  location: 'Hatay, Türkiye',
  email: 'tunakimyonok1@gmail.com',
  /** Shown on the CV only — the site does not publish it. */
  phone: '+90 536 484 6575',
  github: 'https://github.com/tunakmynk',
  linkedin: 'https://www.linkedin.com/in/tunakimyonok',
  /** Portfolio source repo, shown in the footer. */
  sourceRepo: 'https://github.com/tunakmynk/portfolio',
  /**
   * CV files in /public/cv. Replace the PDF to update it (keep the name,
   * or change the path here). Add a Turkish CV and point `tr` at it.
   */
  cv: {
    en: '/cv/Tuna-Kimyonok-CV.pdf',
    tr: '/cv/Tuna-Kimyonok-CV.pdf',
  } satisfies Localized,
};

export interface SpokenLanguage {
  name: Localized;
  level: Localized;
}

/** Listed on the CV. The site does not show these. */
export const spokenLanguages: SpokenLanguage[] = [
  {
    name: { en: 'Turkish', tr: 'Türkçe' },
    level: { en: 'Native', tr: 'Ana dil' },
  },
  {
    name: { en: 'English', tr: 'İngilizce' },
    level: { en: 'Professional working proficiency', tr: 'İleri seviye' },
  },
];

export interface SkillGroup {
  category: Localized;
  items: string[];
}

/** Only list what you could build a feature with tomorrow. */
export const skills: SkillGroup[] = [
  {
    category: { en: 'Languages', tr: 'Diller' },
    items: ['Python', 'C#', 'JavaScript', 'C / C++'],
  },
  {
    category: { en: 'Backend & APIs', tr: 'Backend & API' },
    items: ['FastAPI', 'Flask', 'REST API design', 'WebSocket', 'Server-Sent Events', 'asyncio'],
  },
  {
    category: { en: 'AI & Retrieval', tr: 'Yapay Zekâ & Arama' },
    items: [
      'RAG architecture',
      'Qdrant (hybrid search)',
      'ChromaDB',
      'Sentence Transformers',
      'Gemini API',
      'OpenAI API',
      'UMAP + HDBSCAN',
      'Structured LLM output (JSON)',
    ],
  },
  {
    category: { en: 'Data & Tooling', tr: 'Veri & Araçlar' },
    items: ['PostgreSQL', 'Docker Compose', 'Git & GitHub', 'Postman'],
  },
  {
    category: { en: 'Game & Embedded', tr: 'Oyun & Gömülü' },
    items: ['Unity 6', 'ESP32-S3 (ESP-IDF)'],
  },
];

export interface TimelineItem {
  title: Localized;
  org: string;
  period: Localized;
  location?: string;
  points: Record<keyof Localized, string[]>;
}

export const experience: TimelineItem[] = [
  {
    title: { en: 'Software Engineering Intern', tr: 'Yazılım Mühendisliği Stajyeri' },
    org: 'THINKBRO',
    period: { en: 'Jul 2026 – Sep 2026', tr: 'Tem 2026 – Eyl 2026' },
    points: {
      en: [
        'Built a voice AI assistant that answers from Turkish national curriculum (MEB) textbooks end to end: the ESP32-S3 firmware, the FastAPI backend, and an 8,577-chunk Qdrant knowledge base covering all 12 grade levels.',
        'Cut time-to-first-audio from 11.0 s to 2.7–3.8 s by making the whole chain streaming (STT → hybrid search → LLM → TTS) and sending each sentence to be spoken as soon as its boundary was reached.',
        'Blocked hallucination with a three-layer defence — a prompt rule, a deterministic KAYNAK_YOK marker and two-way automated evaluation — measuring 6/6 correct refusals on out-of-scope questions and 6/6 correct answers on in-scope ones.',
        'Brought up the ESP32-S3 peripherals: the ILI9341 touch display over SPI, and the INMP441 microphone and MAX98357A speaker over I2S.',
        'Chose a file-based transcription API over a streaming one after realising push-to-talk delivers the audio in one piece, lowering cost without giving up the latency target.',
      ],
      tr: [
        'MEB ders kitaplarından cevap veren sesli yapay zeka asistanını; ESP32-S3 firmware’i, FastAPI backend’i ve 12 sınıf düzeyini kapsayan 8.577 parçalık Qdrant bilgi tabanını kurarak uçtan uca geliştirdim.',
        'Zinciri uçtan uca akışlı hâle getirip (STT → hibrit arama → LLM → TTS) cevabı cümle sınırında bölerek ilk sese kadar geçen süreyi 11,0 saniyeden 2,7–3,8 saniyeye indirdim.',
        'Uydurmayı üç katmanlı savunmayla engelledim — prompt kuralı, deterministik KAYNAK_YOK işareti ve iki yönlü otomatik değerlendirme; kapsam dışı sorularda 6/6 doğru reddetme, kapsam içi sorularda 6/6 doğru cevaplama ölçtüm.',
        'ESP32-S3 çevre birimlerini SPI üzerinden ILI9341 dokunmatik ekranı, I2S üzerinden INMP441 mikrofonu ve MAX98357A hoparlörü olacak şekilde çalışır hâle getirdim.',
        'Bas-konuş tasarımı sayesinde sesin tek parça geldiğini fark edip akışlı yerine dosya tabanlı transkripsiyon API’sini seçtim; böylece gecikme hedefinden ödün vermeden maliyeti düşürdüm.',
      ],
    },
  },
];

export const education: TimelineItem[] = [
  {
    title: { en: 'B.S. in Computer Engineering', tr: 'Bilgisayar Mühendisliği Lisans' },
    org: 'Iskenderun Technical University',
    period: { en: 'Sep 2022 – Jun 2027 (expected)', tr: 'Eyl 2022 – Haz 2027 (beklenen)' },
    location: 'Hatay, Türkiye',
    points: { en: [], tr: [] },
  },
];
