---
title: Müfredat Tabanlı Sesli Yapay Zekâ Asistanı
tagline: 1–12. sınıf öğrencilerinin sorularını hibrit RAG ve uçtan uca akışlı bir ses hattıyla MEB ders kitaplarından, sesli ve kaynak göstererek cevaplayan bas-konuş cihazı.
category: Backend · RAG · Gömülü
period: Tem 2026 – Eyl 2026
status: completed
order: 1
stack: [Python 3.12, FastAPI, WebSocket, Qdrant, PostgreSQL, OpenAI API, Docker Compose, ESP32-S3, ESP-IDF, LVGL]
cv: []   # covered under Experience on the CV
media:
  images:
    - src: /media/meb-device-answer.jpg
      alt: 'Cihaz ekranında 11. sınıf Matematik cevabı ve cevabın alındığı ünite'
      caption: 'Cihaz 11. sınıf Matematik ders kitabından gelen cevabı okurken. Cevabın altında kaynak ünite yazıyor.'
    - src: /media/meb-device-hardware.jpg
      alt: 'Ekran, mikrofon ve hoparlöre bağlanmış ESP32-S3 kartı'
      caption: 'Prototipin içi: ESP32-S3, SPI üzerinden ILI9341 ekran, I2S üzerinden INMP441 mikrofon ve MAX98357A hoparlör.'
  video:
    src: /media/meb-device-demo.mp4
    poster: /media/meb-device-demo-poster.jpg
    caption: 'Soru soruluyor, sistem sessizce çalışıyor, cihaz konuşmaya başlıyor. Sesi açın.'
highlights:
  - { value: '11 sn → 3 sn', label: 'ilk sese kadar geçen süre, ölçüldü' }
  - { value: '8.577', label: 'indekslenen metin parçası' }
  - { value: '6 / 6', label: 'kapsam dışı soruda doğru reddetme' }
pipeline:
  - { step: 'Sor', detail: 'Öğrenci ESP32-S3 cihazın ekranına basılı tutup konuşur' }
  - { step: 'Aktar', detail: 'PCM ses WebSocket ile FastAPI backend’e akar' }
  - { step: 'Metne çevir', detail: 'Değiştirilebilir adapter üzerinden STT' }
  - { step: 'Bul', detail: 'Qdrant’ta sınıf ve ders filtreli hibrit dense + BM25 arama' }
  - { step: 'Üret', detail: 'LLM token akışı; biten her cümle anında TTS’e gider' }
  - { step: 'Konuş', detail: 'Ses parçaları cihaza akar; cevap ve kaynak ekranda görünür' }
---

> THINKBRO’daki stajım sırasında geliştirildi.

## Problem

Öğrenciler sürekli soru soruyor, ama genel amaçlı sohbet botları bütün internetten cevap veriyor. Cevapların ayrıntı düzeyi ya da terimleri öğrencinin sınıfına uymayabiliyor ve bilginin nereden geldiği belirtilmiyor.

Hedef, öğrencinin basılı tutup soru sorabileceği **fiziksel bir sesli asistan**. Duyacağı cevap:

- **yalnızca öğrencinin kendi sınıf ve dersine ait MEB kitaplarından** gelmeli,
- **kaynağını** (sınıf, ders, ünite) ekranda göstermeli,
- **4 saniyeden kısa sürede** çalmaya başlamalı, çünkü daha uzun bir sessizlik cihaz bozulmuş gibi hissettiriyor.

## Mimari ve tasarım kararları

Cihaz bir **ince istemci (thin client)**: I2S mikrofon (INMP441), I2S amfi (MAX98357A) ve 2.4" dokunmatik ekranlı bir ESP32-S3. Ses kaydediyor, ses çalıyor ve ekranı çiziyor. Tüm mantık tek bir **Python/FastAPI modüler monolitinde** duruyor. Vektörler için Qdrant, sohbet ve ölçümler için PostgreSQL kullanılıyor ve hepsi Docker Compose ile yerelde çalışıyor.

Her büyük kararı bir **Mimari Karar Kaydı (ADR)** olarak belgeledim. En önemlileri:

| Karar | Gerekçe |
|---|---|
| **Kuyruksuz modüler monolit** | Tek geliştirici, tek eşzamanlı oturum. Mesaj kuyruğu verim kazandırmadan kurulum ve hata ayıklama yükü eklerdi. |
| **Bas-konuş** | Mikrofon ve hoparlör hiçbir zaman aynı anda açık olmadığı için mikrodenetleyicide yankı engellemeye ya da uyandırma kelimesi modeline gerek kalmıyor. |
| **Uçtan uca akış** | STT → tam LLM cevabı → tam TTS şeklindeki bloklu zincir 6–10 sn sürüyor. 4 sn hedefine ulaşmanın tek yolu cümle cümle akış. |
| **Oturum için WebSocket, geri kalan her şey için REST** | Ses ve olaylar kalıcı bağlantı gerektiriyor. Katalog, ayarlar ve geçmiş web paneliyle ortak kullanılıyor ve tarayıcıdan test edilebiliyor. |
| **Aramada sınıf/ders payload filtresi** | En ucuz doğruluk kazancı: 3. sınıf sorusuna asla 12. sınıf kitabından parça gelmiyor. |
| **Sağlayıcılar adapter arayüzleri arkasında** | Türkçe TTS kalitesi sağlayıcıdan sağlayıcıya çok değişiyor. Sağlayıcı değiştirmek yeniden yazmayı değil, yapılandırma değişikliğini gerektirmeli. |

### Bilgi tabanı
Gerçek zamanlı sistemden önce **çevrimdışı bir veri hattı** kurdum: **Docling** ders kitabı PDF’lerini ayrıştırıyor, **Chonkie** parçalara bölüyor, **FastEmbed** de hem dense (`multilingual-e5-large`, 1024 boyut) hem sparse (BM25) vektörler üretiyor. 12 sınıf düzeyini kapsayan **8.577 metin parçası**, kaynak gösterimi için sınıf, ders, ünite ve breadcrumb metadata’sıyla birlikte hibrit bir Qdrant koleksiyonunda duruyor. Bu işin cihaz çalışmasından önce bitmesi, takvimi daha zor olan ses ve firmware işlerine ayırmamı sağladı.

## Karşılaşılan zorluklar ve çözümler

### Sessizlik bozukluk gibi hissettiriyor
LLM’in cevabı bitirmesini bekleyip sonra tamamını sese çevirmek öğrenciyi 10 saniyeye kadar sessizlikte bırakıyordu.
**Çözüm:** **Cümle sınırı tespitiyle akış.** LLM token’ları gelirken tamamlanan her cümle anında TTS’e gidiyor ve cevabın geri kalanı üretilirken ses parçaları cihaza akıyor. Her turda `stt_ms`, `retrieval_ms`, `llm_first_token_ms` ve `tts_first_audio_ms` PostgreSQL’e yazılıyor, yani gecikme tahmin edilmiyor, ölçülüyor.

### Öğrencinin sözü kesebilmesi
Uzun ya da yanlış bir cevap öğrenciyi kilitlememeli.
**Çözüm:** Her konuşma turu **iptal edilebilir bir asyncio görevi** olarak çalışıyor. Cihazdan gelen `cancel` olayı LLM ve TTS akışlarını durduruyor, cihaz da ses tamponunu boşaltıyor. Bu da her sağlayıcı adapter’ının akışı yarıda durdurabilmesini zorunlu kıldı.

### Plan ile donanım gerçeği
İlk planım STT’yi Faster-Whisper ile yerelde çalıştırmaktı. Demo bilgisayarında GPU olmadığı için yerel modeller gecikme hedefini tutturamıyordu.
**Çözüm:** STT, LLM ve TTS’i adapter’ların arkasında API’lere taşıdım. Öğrenci konuşurken tuşa basılı tuttuğu için ses tek parça hâlinde geliyor. Bu yüzden daha ucuz olan dosya tabanlı transkripsiyon API’si akışlı bir API kadar iyi çalışıyor.

### 2 MB’lık bellek bütçesi
Ses tamponları, LVGL ekran çerçeve tamponu ve TLS/WebSocket tamponları ESP32-S3’ün dahili RAM’ine aynı anda sığmıyor.
**Çözüm:** Ses tamponları **PSRAM**’de tutuluyor. Kullanılmayan Bluetooth yığını da bellek ve derleme boyutu kazanmak için kapatıldı.

### Demo günü ağ riski
Cihaz backend’i yerel IP ile buluyor ve bu IP her ağda değişiyor.
**Çözüm:** Wi-Fi bilgileri ve backend adresi dokunmatik ekrandan girilip **NVS**’e kaydediliyor, yani yeniden yükleme gerekmiyor. Donanım çalışmazsa aynı WebSocket protokolünü kullanan bir tarayıcı test sayfası yedek yol olarak hazır.

## Sonuçlar ve durum

Staj sonunda uçtan uca çalışan bir prototip olarak teslim edildi.

| Ölçüm | Sonuç |
|---|---|
| İlk sese kadar geçen süre — ilk ölçüm | 11.020 ms |
| İlk sese kadar — akışlı zincirden sonra | 2.697 – 3.777 ms |
| Kapsam dışı soruda doğru reddetme | 6 / 6 |
| Kapsam içi soruda doğru cevaplama | 6 / 6 |
| Otomatik test | 37, tamamı geçiyor |
| İndekslenen metin parçası | 8.577 |

Gecikme dört ardışık koşuda ölçüldü: 2697, 5592, 2717 ve 3777 ms. Üçü hedefi karşıladı. Aşan koşudaki tek sebep sağlayıcının o günkü yavaşlığıydı — dil modelinin ilk kelimesi normalde 600–1000 ms sürerken 3378 ms'ye çıktı.

### Bilinen sınırlar
- Tek eşzamanlı kullanıcı — bilinçli bir kapsam kararı.
- Yerel ağ, şifresiz bağlantı; sınıf ortamı varsayımı.
- Panel gerçek bir yetki sınırı değil, tek şifreli bir kapı.
