// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Canlı adresin belli olunca güncelle (canonical ve hreflang linkleri bundan üretilir).
  site: 'https://tunakimyonok.vercel.app',
  // GitHub Pages'te "kullanici.github.io/portfolio" gibi bir alt yolda yayınlarsan: base: '/portfolio'
});
