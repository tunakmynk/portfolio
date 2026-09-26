---
title: Steam Oyuncu Geri Bildirim Analiz Sistemi
tagline: Crimson Desert’a yazılmış 15.000+ olumsuz Steam yorumunu geliştirici ekip için önceliklendirilmiş ve sorgulanabilir hata raporlarına dönüştüren yapay zekâ destekli QA asistanı.
category: Uygulamalı YZ · NLP · RAG
period: Mar 2026 – May 2026
status: completed
order: 2
stack: [Python, Flask, Sentence Transformers, UMAP, HDBSCAN, ChromaDB, Gemini 2.5 Flash]
cv:
  - '15.000’den fazla yapılandırılmamış kullanıcı yorumunu işleyen bir NLP veri hattı kurdum; teknik sorun bildirimlerini UMAP/HDBSCAN kümelemesiyle otomatik olarak sınıflandırdım.'
  - 'ChromaDB vektör veritabanını Gemini 2.5 Flash tabanlı bir RAG çatısıyla birleştirerek doğal dilde sorgulamayı ve dinamik metadata filtrelemeyi mümkün kıldım.'
  - 'Otomatik API hız sınırlama ve anahtar rotasyonu mekanizmalarıyla, ayrıca sorunları önceliklendiren bir puanlama algoritmasıyla backend hattının dayanıklılığını artırdım.'
highlights:
  - { value: '15.000+', label: 'olumsuz yorum işlendi' }
  - { value: '59', label: 'sorun kümesi keşfedildi' }
  - { value: '2', label: 'LLM rolü: yönlendirici + raporlayıcı' }
pipeline:
  - { step: 'Toplama', detail: 'Yorumlar Steam API’den çekilir, dil filtresi ve temizlik uygulanır' }
  - { step: 'Vektörleştirme', detail: 'Sentence Transformers ile çok dilli vektörler' }
  - { step: 'Kümeleme', detail: 'UMAP boyutu indirger, HDBSCAN 59 küme bulur' }
  - { step: 'Etiketleme', detail: 'LLM her kümeye isim ve özet verir' }
  - { step: 'İndeksleme', detail: 'Yorumlar ve metadata ChromaDB’ye yazılır' }
  - { step: 'Sorgulama', detail: 'Yönlendirici LLM → metadata filtresi → arama → rapor' }
links:
  repo: https://github.com/tunakmynk/game-bug-tespiti-LLM
---

## Problem

Büyük bir oyun çıktığında olumsuz yorumlar, hiçbir QA ekibinin okuyamayacağı hızda birikir. Crimson Desert’ın Steam’de **15.000’den fazla olumsuz yorumu** vardı. Bu yorumlar farklı dillerde yazılmıştı ve çökme raporlarını, performans şikâyetlerini ve genel memnuniyetsizliği iç içe barındırıyordu.

Geliştiricinin ihtiyaç duyduğu bilgi (*“şu ekran kartında oyun açılışta çöküyor”* gibi) bu yorumların içindeydi, ama kaydırarak bulmak imkânsızdı. Şunları yapan bir sistem hedefledim:

1. Binlerce şikâyeti, kategorileri benim önceden tanımlamama gerek kalmadan, gerçek sorun başlıkları altında otomatik olarak **gruplamak**.
2. *“En kritik performans sorunları neler?”* gibi doğal dildeki sorulara **cevap vermek**.
3. Ekibin en çok zarar veren sorunu önce çözebilmesi için sorunları **önceliklendirmek**.

## Mimari ve tasarım kararları

Sistem iki parçadan oluşuyor: bilgi tabanını kuran **çevrimdışı bir veri hattı** ve Flask ile sunulan **çevrimiçi bir sorgu katmanı**.

**Neden Sentence Transformers?** Yorumlar çok dilli. Çok dilli bir embedding modeli, *“açılışta çöküyor”* cümlesini İngilizce ya da Almanca karşılığıyla vektör uzayında yan yana koyar. Böylece yorumlar dile göre değil, anlama göre kümelenir.

**Neden k-means değil de UMAP + HDBSCAN?** Kaç tür sorun olduğunu bilmiyordum ve k-means bu sayıyı baştan vermenizi ister. HDBSCAN küme sayısını kendisi bulur ve uç değerleri bir gruba zorla sokmak yerine gürültü olarak işaretler. Yoğunluk tabanlı kümeleme yüksek boyutlu vektörlerde kötü çalıştığı için önce UMAP ile boyut indirgedim. Sonuç, her biri LLM tarafından adlandırılıp özetlenen **59 anlamlı küme** oldu.

**Neden ChromaDB?** Vektörleri ve metadata’yı (küme, konu, dil, kritiklik) birlikte saklıyor ve sorgu anında metadata filtrelemeyi destekliyor. Python sürecinin içinde gömülü çalıştığı için ayrıca bir sunucu yönetmek de gerekmiyor.

**Neden iki ayrı LLM rolü?** Tek bir model çağrısı hem kullanıcının ne istediğini anlama hem de iyi bir rapor yazma işini güvenilir biçimde yapamıyor. Bu yüzden işi ikiye ayırdım:

- **Yönlendirici LLM** (projedeki adıyla “Trafik Polisi”), doğal dildeki soruyu yapılandırılmış metadata filtrelerine çevirir.
- **Rapor LLM’i** yalnızca filtrelenmiş ve getirilmiş yorumları alır ve cevabı yazar.

## Karşılaşılan zorluklar ve çözümler

### Yalnızca vektör araması yanlış yorumları getiriyordu
*“Kritik performans sorunları”* gibi bir soru anlamsal olarak binlerce yoruma yakın. Saf benzerlik araması makul ama odaksız sonuçlar döndürüyordu.
**Çözüm:** Yönlendirici LLM soruyu önce metadata filtrelerine (konu, küme, kritiklik) çeviriyor. Arama da yalnızca veritabanının ilgili bölümünde yapılıyor.

### Tek bir yorum parçası yeterli bağlam taşımıyordu
Getirilen kısa parçalar çoğu zaman hangi donanım olduğu ya da çökmeden hemen önce ne yaşandığı gibi önemli ayrıntıları kaybediyordu.
**Çözüm:** **Parent-child retrieval** yapısı. Arama küçük ve isabetli alt parçalarla eşleşiyor, ama LLM’e bağlam olarak yorumun tamamı veriliyor.

### API kotaları toplu işlemeyi durduruyordu
Kümeleri etiketlemek ve rapor üretmek çok sayıda Gemini çağrısı gerektiriyordu ve ücretsiz kotalar işlem ortasında doluyordu.
**Çözüm:** Kota hatasını yakalayıp otomatik olarak sıradaki API anahtarına geçen bir **anahtar rotasyonu** mekanizması. Uzun işler elle yeniden başlatmaya gerek kalmadan tamamlanıyor.

### 59 küme içinden en önemli 10’u bulmak
Küme büyüklüğü tek başına ciddiyet göstermiyor: kayıt dosyası bozulmasıyla ilgili küçük bir küme, arayüzle ilgili büyük bir şikâyet kümesinden daha önemli.
**Çözüm:** Sorunları sıralayan bir **kritiklik skorlama** adımı. Böylece rapor en çok zarar veren sorunlarla başlıyor.

## Sonuçlar

- 15.000+ yapılandırılmamış yorum, elle hiçbir kategori tanımlamadan **59 etiketli sorun kümesine** indirgendi.
- QA mühendisinin doğal dilde soru sorup gerçek oyuncu yorumlarına dayanan bir rapor alabildiği bir arayüz geliştirildi.
- Otomatik anahtar rotasyonu sayesinde veri hattı API kota sınırlarına karşı dayanıklı hâle geldi.

### Sırada ne var?
Retrieval isabetini ölçmek için doğru kümesi bilinen sorulardan oluşan bir değerlendirme seti eklemek ve her yamadan sonra gelen yeni yorumların otomatik olarak sisteme girmesi için veri hattını zamanlanmış çalıştırmak.
