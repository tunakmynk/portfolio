---
title: Curriculum-Grounded Voice AI Assistant
tagline: A push-to-talk device for grade 1–12 students that answers questions from Turkish national curriculum (MEB) textbooks, out loud and with sources, using hybrid RAG and an end-to-end streaming voice pipeline.
category: Backend · RAG · Embedded
period: Jul 2026 – Sep 2026
status: completed
order: 1
stack: [Python 3.12, FastAPI, WebSocket, Qdrant, PostgreSQL, OpenAI API, Docker Compose, ESP32-S3, ESP-IDF, LVGL]
cv: []   # covered under Experience on the CV
media:
  images:
    - src: /media/meb-device-answer.jpg
      alt: 'The device screen showing a grade 11 maths answer with the unit it came from'
      caption: 'The device reading out an answer from the grade 11 maths textbook. The source unit is printed under the answer.'
    - src: /media/meb-device-hardware.jpg
      alt: 'The ESP32-S3 board wired to a display, microphone and speaker'
      caption: 'Inside the prototype: ESP32-S3, ILI9341 display over SPI, INMP441 microphone and MAX98357A speaker over I2S.'
  video:
    src: /media/meb-device-demo.mp4
    poster: /media/meb-device-demo-poster.jpg
    caption: 'A question is asked, the system works in silence, and the device starts speaking. Sound on.'
highlights:
  - { value: '11 s → 3 s', label: 'time to first audio, measured' }
  - { value: '8,577', label: 'textbook chunks indexed' }
  - { value: '6 / 6', label: 'out-of-scope questions correctly refused' }
pipeline:
  - { step: 'Ask', detail: 'Student holds the touchscreen on the ESP32-S3 device and speaks' }
  - { step: 'Stream', detail: 'PCM audio over WebSocket to a FastAPI backend' }
  - { step: 'Transcribe', detail: 'Speech-to-text through a swappable adapter' }
  - { step: 'Retrieve', detail: 'Hybrid dense + BM25 search in Qdrant, filtered by grade and subject' }
  - { step: 'Generate', detail: 'LLM streams tokens; each finished sentence goes straight to TTS' }
  - { step: 'Speak', detail: 'Audio chunks stream back; answer and source appear on screen' }
---

> Built during my internship at THINKBRO.

## Problem

Students ask questions constantly, but general-purpose chatbots answer from the whole internet. They may use a level of detail or terminology that doesn't match the student's grade, and they don't say where the answer came from.

The goal: a **physical voice assistant** a student can hold down, ask a question, and hear an answer that:

- comes **only from MEB textbooks** for the student's own grade and subject,
- shows its **source** (grade, subject, unit) on screen,
- starts playing **in under 4 seconds**, because a longer silence feels broken.

## Architecture & design decisions

The device is a **thin client**: an ESP32-S3 with an I2S microphone (INMP441), an I2S amplifier (MAX98357A), and a 2.4" touchscreen. It captures audio, plays audio, and draws the screen. All logic lives in one **Python/FastAPI modular monolith**, with Qdrant for vectors and PostgreSQL for conversations and metrics, run locally with Docker Compose.

I documented each major choice as an **Architecture Decision Record**. The most important ones:

| Decision | Why |
|---|---|
| **Modular monolith, no queue** | One developer, one concurrent session. A message queue would add setup and debugging work with no throughput gain. |
| **Push-to-talk** | Mic and speaker are never on at the same time, so no echo cancellation or wake-word model is needed on the microcontroller. |
| **End-to-end streaming** | A blocking STT → full LLM answer → full TTS chain takes 6–10 s. Streaming sentence by sentence is the only way to reach the 4 s target. |
| **WebSocket for sessions, REST for everything else** | Audio and events need a persistent connection. Catalog, settings, and history are shared with the web panel and can be tested from a browser. |
| **Grade/subject payload filter in retrieval** | The cheapest accuracy gain: a 3rd-grade question never gets a chunk from a 12th-grade book. |
| **Providers behind adapter interfaces** | Turkish TTS quality varies a lot between providers, so switching one should be a config change, not a rewrite. |

### The knowledge base
Before the real-time system existed, I built an **offline ingestion pipeline**: **Docling** parses the textbook PDFs, **Chonkie** chunks them, and **FastEmbed** produces both dense (`multilingual-e5-large`, 1024-d) and sparse (BM25) vectors. **8,577 chunks** covering all 12 grade levels are stored in a Qdrant hybrid collection, each carrying metadata for grade, subject, unit, and a breadcrumb for citing sources. Finishing this before the device work started freed the schedule for the harder audio and firmware work.

## Challenges & how I solved them

### Silence feels broken
Waiting for the full LLM answer and then synthesizing all of it left the student in silence for up to 10 seconds.
**Fix:** **sentence-boundary streaming**. As LLM tokens arrive, each completed sentence goes to TTS immediately, and the audio chunks stream to the device while the rest of the answer is still being generated. Every turn records `stt_ms`, `retrieval_ms`, `llm_first_token_ms`, and `tts_first_audio_ms` in PostgreSQL, so latency is measured, not guessed.

### Letting students interrupt
A long or wrong answer shouldn't lock the student out.
**Fix:** each conversation turn runs as a **cancellable asyncio task**. A `cancel` event from the device stops the LLM and TTS streams, and the device clears its audio buffer. This required every provider adapter to support stopping mid-stream.

### Plans vs. hardware reality
My first plan ran speech-to-text locally with Faster-Whisper. Without a GPU on the demo machine, local models couldn't meet the latency target.
**Fix:** I moved STT, LLM, and TTS to APIs behind adapters. Because the student holds a button while speaking, the audio arrives as one complete clip, so a cheaper file-based transcription API works as well as a streaming one.

### A memory budget of 2 MB
Audio buffers, the LVGL display frame buffer, and TLS/WebSocket buffers don't all fit in the ESP32-S3's internal RAM at the same time.
**Fix:** audio buffers live in **PSRAM**, and the unused Bluetooth stack is disabled to save memory and binary size.

### Demo-day network risk
The device finds the backend by local IP, and that IP changes on every network.
**Fix:** Wi-Fi credentials and the backend address are entered on the touchscreen and saved to **NVS** (no reflashing needed). A browser test page that uses the same WebSocket protocol is a fallback if the hardware fails.

## Results & status

Delivered as a working end-to-end prototype at the end of the internship.

| Measurement | Result |
|---|---|
| Time to first audio — first measurement | 11,020 ms |
| Time to first audio — after the streaming chain | 2,697 – 3,777 ms |
| Out-of-scope questions correctly refused | 6 / 6 |
| In-scope questions correctly answered | 6 / 6 |
| Automated tests | 37, all passing |
| Textbook chunks indexed | 8,577 |

Latency was measured over four consecutive runs: 2697, 5592, 2717 and 3777 ms. Three met the target. The one that did not was provider slowness on the day — the LLM's first token took 3378 ms instead of the usual 600–1000 ms.

### Known limits
- One concurrent user — a deliberate scope decision.
- Local network, unencrypted connection; a classroom is assumed.
- The panel is a single password gate, not a real authorization boundary.
