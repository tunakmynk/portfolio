# Portfolyo Güncelleme Rehberi

Üç çıktı — site, CV ve GitHub profili — tek kaynaktan üretiliyor. Bir cümleyi
tek yerde değiştirirsin, üçü birden güncellenir.

```
src/data/profile.ts  +  src/content/projects/**.md
        │
        ├──►  site            (otomatik)
        ├──►  /cv sayfası     ──►  Ctrl+P  ──►  public/cv/*.pdf
        └──►  github-profile/README.md      (npm run sync)
```

| Ne değişti? | Hangi dosyayı düzenlemelisin? |
|---|---|
| Unvan, özet cümlesi, e-posta, telefon, linkler | `src/data/profile.ts` → `profile` |
| CV'nin tepesindeki paragraf | `src/data/profile.ts` → `profile.cvSummary` |
| Teknolojiler | `src/data/profile.ts` → `skills` |
| Konuşulan diller (sadece CV'de) | `src/data/profile.ts` → `spokenLanguages` |
| Staj / iş deneyimi | `src/data/profile.ts` → `experience` |
| Mezuniyet bilgisi | `src/data/profile.ts` → `education` |
| Yeni proje | `src/content/projects/en/<ad>.md` ve `tr/<ad>.md` |
| Buton ve başlık metinleri | `src/i18n/ui.ts` |

> `github-profile/README.md` dosyasını **elle düzenleme.** O dosya üretiliyor;
> `npm run sync` her çalıştığında üzerine yazılır.

---

## 1. CV'yi güncellemek

CV artık Word'de değil, `profile.ts` ve proje dosyalarından üretiliyor. Elle
yazdırman da gerekmiyor:

```bash
npm run cv:pdf      # İngilizce  → public/cv/Tuna-Kimyonok-CV.pdf
npm run cv:pdf:tr   # Türkçe     → public/cv/Tuna-Kimyonok-Ozgecmis.pdf
```

Bu komut siteyi ayağa kaldırır, sayfayı başsız Chrome ile PDF'e basar ve
**gerçekten tek sayfa olup olmadığını söyler.** İki sayfa olduysa uyarır.

Sayfayı gözünle görmek istersen `npm run cv` (ya da `npm run cv:tr`) tarayıcıda
açar; oradan elle de basabilirsin.

### Sayfaya sığmıyorsa

CV tek sayfaya göre ayarlı. Taşarsa `src/views/CvPage.astro` içindeki tek
değişkeni düşür:

```css
--density: 9.2pt;
```

Bu değişken hem yazı boyutunu hem satır aralıklarını birlikte ölçekler.

> **Ekranda ölçerek ayar yapma.** Baskı, ekrandan biraz daha uzun diziliyor:
> ekranda 1–2 mm payla sığıyor görünen sayfa, PDF'te ikiye bölünebiliyor. Bu
> tam olarak bir kez başımıza geldi. Doğru yöntem `npm run cv:pdf` çalıştırıp
> söylediği sayfa sayısına bakmak.
>
> Mevcut içerikle kırılma noktası 9,35 pt ile 9,4 pt arasında; 9,2 pt pay
> bırakıyor. **9 pt civarına indiysen artık küçültme, madde çıkar** — en eski
> projenin en zayıf maddesinden başla.

Tarayıcının kendi üst bilgisi (tarih, adres, sayfa numarası) çıkmaz: `@page`
kenar boşluğu sıfır, gerçek boşluk sayfanın iç dolgusunda.

`astro.config.mjs` değiştiyse dev sunucusunu yeniden başlat (`npx astro dev
stop`), yoksa CV eski site adresini gösterir.

---

## 2. GitHub profilini güncellemek

```bash
npm run sync:profile
```

Bu komut siteyi derler, README'yi veriden üretir, `github-profile/README.md`
dosyasına yazar ve doğrudan `github.com/tunakmynk/tunakmynk` reposuna gönderir.
Elle kopyalaman gereken bir şey kalmadı.

Sadece dosyayı üretip göndermek istemiyorsan `npm run sync` yeter.

Tabloya proje eklemek için bir şey yapman gerekmez: yayına aldığın her proje
otomatik girer. Repo linki olan projeler repoya, olmayanlar (staj projeleri
gibi) portfolyodaki vaka analizine bağlanır.

---

## 3. Yeni proje eklemek

1. `src/content/projects/en/` içindeki bir dosyayı kopyala, yeni ad ver.
   **Dosya adı URL olur:** `/projects/yeni-proje/`
2. Aynı dosya adıyla `tr/` altında Türkçe sürümünü oluştur. Aynı isim iki dili
   birbirine bağlar.
3. Frontmatter'ı doldur:

```yaml
---
title: Proje Adı
tagline: Kartta görünen tek cümle. Ne yapıyor, kimin için?
category: Backend · RAG
period: Eki 2026 – Ara 2026
status: completed            # completed | in-progress | prototype
order: 1                     # küçük sayı = üstte
draft: true                  # true iken sadece "npm run dev"de görünür
stack: [Python, FastAPI, Redis]

cv:                          # CV'de bu proje için görünecek maddeler
  - 'Ölçülebilir bir sonuç içeren madde.'
  - 'İkinci madde.'
                             # cv: []  yazarsan proje CV'den çıkar, sitede kalır

media:                       # isteğe bağlı
  images:
    - src: /media/foo.jpg
      alt: 'Ekran okuyucular için açıklama'
      caption: 'Görselin altında görünecek metin'
  video:
    src: /media/foo.mp4
    poster: /media/foo-poster.jpg
    caption: 'Videonun altında görünecek metin'

highlights:                  # en fazla 3'ü kartta görünür; sadece GERÇEK ölçümler
  - { value: '11 sn → 3 sn', label: 'ilk sese kadar süre' }
pipeline:
  - { step: 'Adım', detail: 'Kısa açıklama' }
links:                       # olmayanı sil, buton otomatik gizlenir
  repo: https://github.com/tunakmynk/...
  demo: https://...
  video: https://...
  docs: https://...
---
```

4. Metni şu dört başlıkla yaz:
   - `## Problem` — hangi somut problemi çözüyor?
   - `## Mimari ve tasarım kararları` — hangi teknolojiyi **neden** seçtin?
   - `## Karşılaşılan zorluklar ve çözümler` — nerede takıldın, nasıl aştın?
   - `## Sonuçlar ve durum` — ölçülebilir sonuçlar ve bilinen sınırlar.
5. `npm run dev` ile kontrol et. Hazır olunca `draft: true` satırını sil.

> Bir alan eksikse `npm run build` hangi dosyada, hangi alanda sorun olduğunu
> tam olarak söyler.

### Görsel ve video hazırlamak

Medya dosyaları `public/media/` altına konur. Ham telefon videosu doğrudan
kullanılmaz — büyük olur ve önemli kısmı bulunmaz. `ffmpeg` ile kırp ve sıkıştır
(bu projede `pip install imageio-ffmpeg` ile kurulmuştu):

```bash
# Önemli aralığı kes, web için yeniden kodla
ffmpeg -ss 4.5 -t 16 -i ham.mp4 -c:v libx264 -crf 26 -preset slow \
       -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart cikti.mp4

# Kapak karesi
ffmpeg -ss 14 -i ham.mp4 -frames:v 1 -q:v 3 cikti-poster.jpg

# Fotoğrafı web boyutuna indir
ffmpeg -i foto.jpeg -vf "scale=-2:1400" -q:v 3 foto-web.jpg
```

Videoyu GIF'e çevirme: GIF 256 renkle ve kareler arası sıkıştırma olmadan
çalışır, aynı görüntü 10–20 kat büyür ve sesi taşımaz.

---

## 4. Yayına almak (Vercel)

1. Bu klasörü GitHub'da bir repoya gönder.
2. vercel.com → *Add New Project* → repoyu seç → *Deploy*. Ayar gerekmez.
3. Verilen adresi `astro.config.mjs` içindeki `site` alanına ve `profile.ts`
   içindeki `sourceRepo` alanına yaz. README ve CV'deki linkler `site`
   değerinden üretildiği için başka yeri elle düzeltmen gerekmez.
4. Bundan sonra `main` dalına her `git push` siteyi otomatik günceller.
