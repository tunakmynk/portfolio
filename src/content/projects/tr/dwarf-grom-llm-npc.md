---
title: 'Dwarf Grom: Yapay Zekâ Destekli NPC Prototipi'
tagline: Oyuncunun bir NPC’yi yazarak ya da konuşarak kendi cümleleriyle ikna ettiği, bunun işe yarayıp yaramadığına Gemini tabanlı gizli bir hakemin karar verdiği Unity 6 oyun prototipi.
category: Oyun Yapay Zekâsı · Backend Entegrasyonu
period: Eki 2025 – Ara 2025
status: prototype
order: 3
stack: [Unity 6, 'C#', Python, FastAPI, Gemini 2.5 Flash, ElevenLabs, Google Speech Recognition]
cv:
  - 'Python (FastAPI) backend ile Unity 6 istemcisi arasında asenkron bir RESTful API bağlantısı tasarladım; yapılandırılmış JSON yüklerini ve Base64 ses akışını düşük gecikmeyle yönettim.'
  - 'Oyuncunun kendi cümlelerini puanlayan ve oyun durumunu buna göre değiştiren, Gemini 2.5 Flash destekli backend değerlendirme mantığını geliştirdim.'
highlights:
  - { value: '1', label: 'LLM çağrısında replik + karar' }
  - { value: 'Metin + ses', label: 'oyuncu girdi türleri' }
  - { value: '≥ 2 tur', label: 'NPC ikna olmadan önce' }
pipeline:
  - { step: 'Oyuncu girdisi', detail: 'Unity’de serbest metin ya da bas-konuş ses' }
  - { step: 'Sesten metne', detail: 'Base64 ses → FastAPI → Google Speech Recognition' }
  - { step: 'Kural katmanı', detail: 'Selamlaşma ve vedalar LLM’e gitmeden cevaplanır' }
  - { step: 'Gizli hakem', detail: 'Gemini JSON olarak { response, isConvinced } döndürür' }
  - { step: 'Seslendirme', detail: 'ElevenLabs Grom’un repliğini sese çevirir' }
  - { step: 'Oyun durumu', detail: 'Unity bayrağı okur, Grom oyuncuyu takip etmeye başlar' }
links:
  repo: https://github.com/tunakmynk/unity-llm-voice-npc
  video: https://www.youtube.com/watch?v=wW9WMaQVq_k
---

## Problem

Oyunlarda ikna genellikle bir menüdür: üç diyalog seçeneği vardır ve biri doğrudur. Oyuncu kimseyi ikna etmez, sadece doğru seçeneği arar. İkinci oynayışta cevabı hatırladığı için hiç gerilim kalmaz.

LLM’ler serbest konuşmayı mümkün kılıyor, ama **bir NPC’ye sohbet botu bağlamak tek başına oyun değildir**. Kaybedilemeyen bir sohbette meydan okuma yoktur. Tek bir fikri test etmek istedim: LLM ile çalışan bir NPC oyuncuya **tutarlı biçimde direnebilir mi**, yani onu ikna etmek karakteri gerçekten anlamayı gerektirebilir mi?

Prototipte tek bir NPC var: gururlu ve huysuz cüce demirci **Grom**. Oyuncunun onu yazarak ya da konuşarak kendisini takip etmeye ikna etmesi gerekiyor.

## Mimari ve tasarım kararları

Unity 6 istemcisi dünyayı, hareketi, arayüzü ve NPC davranışını (`ChatUI`, `PlayerMovement`, `SimpleFollow`) yönetiyor. Yapay zekâyla ilgili her şey ise, yani oturumlar, ses tanıma, LLM ve seslendirme, bir **Python FastAPI backend’inde** çalışıyor. İki taraf yapılandırılmış JSON ve Base64 ses verisi taşıyan **asenkron bir REST API** üzerinden haberleşiyor.

**Neden API’leri doğrudan C#’tan çağırmak yerine ayrı bir Python backend?** Yapay zekâ ekosistemi (SDK’lar, prompt araçları, ses kütüphaneleri) Python’da çok daha güçlü. Yapay zekâ mantığını bir API’nin arkasında tutmak, Unity projesini yeniden derlemeden modelleri değiştirebilmemi de sağlıyor.

**Neden her turda tek bir yapılandırılmış LLM çağrısı?** Gemini 2.5 Flash iki parçalı bir JSON döndürüyor: oyuncunun duyduğu replik ve gizli bir karar bayrağı.

```json
{
  "response": "Hıh. Babandan bahsettin… Onu tanırdım.",
  "isConvinced": false
}
```

Unity’deki `CallTheAPI`, `isConvinced` değerini okuyup `SimpleFollow` bileşenine bir olay gönderiyor. İki çağrı yerine tek çağrı yapmak gecikmeyi ve maliyeti düşürüyor.

**Neden LLM’in önünde kural tabanlı bir katman?** Selamlaşma ve veda gibi tahmin edilebilir girdiler LLM’e hiç gitmiyor. Hem maliyetsiz hem de anında cevaplanıyor.

## Karşılaşılan zorluklar ve çözümler

### LLM’ler fazla kolay ikna oluyor
Modele “ikna olduğunda söyle” derseniz oyuncu ısrar ettiği anda teslim oluyor. Bu da oyunu bozuyor.
**Çözüm:** **Rol yapmayı karar vermekten ayırdım.** Karakter rolünde kalıyor, karar ise açık kurallara göre puanlanan ayrı bir yapılandırılmış alan: Grom’un babasından samimiyetle bahsetmek güçlü etki ediyor, altın teklif etmek işe yarıyor, tehdit ise kesin ret getiriyor.

### Oyuncu tek bir şanslı cümleyle kazanabiliyordu
Grom ilk mesajda ikna olabilseydi, oyuncu onun hakkında hiçbir şey öğrenmeyecekti.
**Çözüm:** **En az iki tur kuralı.** Grom ilk turda ikna olamıyor, bu yüzden oyuncu onu en az bir kez dinlemek zorunda. Oyun hissini en çok değiştiren tek ekleme bu oldu.

### Unity ile Python arasında ses taşımak
Unity’nin ses klipleri ile Python’daki ses tanıma ve TTS kütüphaneleri farklı formatlar kullanıyor.
**Çözüm:** Ses **JSON içinde Base64** olarak taşınıyor ve format dönüşümü backend’de yapılıyor. API sade bir JSON sözleşmesi olarak kalıyor ve Unity istemcisi ek bir ses kütüphanesine ihtiyaç duymuyor.

### Gecikme ve karakter tutarlılığı
Her tur STT → LLM → TTS zincirinden geçiyor ve karakterin sesi ile kişiliği baştan sona aynı kalmalı.
**Çözüm:** Basit girdiler için kural tabanlı cevaplar, her turda tek LLM çağrısı ve Grom’u tutarlı tutan katmanlı bir persona prompt’u (geçmiş, konuşma üslubu, kırmızı çizgiler).

## Sonuçlar

- Uçtan uca çalışan bir **dikey dilim (vertical slice)**: oyuncu 3B sahnede Grom’a yaklaşıyor, yazarak ya da konuşarak onu ikna etmeye çalışıyor ve Grom ikna olunca oyuncuyu takip ediyor. [Oynanış videosunu izle](https://www.youtube.com/watch?v=wW9WMaQVq_k).
- Temel tasarım sorusu doğrulandı: serbest metinle ikna mekaniği **NPC hayır diyebildiğinde** eğlenceli oluyor.
- Prototipten yola çıkarak eksiksiz bir oyun tasarım dokümanı yazdım: 5 vektörlü ikna modeli, 0–100 arası gizli güven ölçeri, oyuncu yalanlarını yakalayan tutarlılık hafızası ve prompt injection savunmaları.

### Sırada ne var?
Hakemi, oyuncu metnini yalnızca veri olarak işleyen ayrı bir LLM çağrısına taşımak (prompt injection’a karşı daha güçlü savunma) ve NPC’lerin kısmen ikna olabilmesi için evet/hayır bayrağı yerine bir güven puanı kullanmak.
