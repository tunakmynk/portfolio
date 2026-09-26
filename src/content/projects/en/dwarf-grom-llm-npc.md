---
title: 'Dwarf Grom: AI-Driven NPC Prototype'
tagline: A Unity 6 game prototype where players persuade an NPC in their own words, by typing or speaking, and a Gemini-powered hidden judge decides whether it worked.
category: Game AI · Backend Integration
period: Oct 2025 – Dec 2025
status: prototype
order: 3
stack: [Unity 6, 'C#', Python, FastAPI, Gemini 2.5 Flash, ElevenLabs, Google Speech Recognition]
cv:
  - 'Architected an asynchronous RESTful API connection between a Python (FastAPI) backend and a Unity 6 client, handling structured JSON payloads and Base64 audio streaming at low latency.'
  - 'Implemented backend evaluation logic powered by Gemini 2.5 Flash that scores the player''s own words and drives game-state transitions accordingly.'
highlights:
  - { value: '1', label: 'LLM call returns reply + decision' }
  - { value: 'Text + voice', label: 'player input modes' }
  - { value: '≥ 2 turns', label: 'before the NPC can be convinced' }
pipeline:
  - { step: 'Player input', detail: 'Free text, or push-to-talk voice in Unity' }
  - { step: 'Speech-to-text', detail: 'Base64 audio → FastAPI → Google Speech Recognition' }
  - { step: 'Rule layer', detail: 'Greetings and farewells answered without the LLM' }
  - { step: 'Hidden judge', detail: 'Gemini returns { response, isConvinced } as JSON' }
  - { step: 'Voice', detail: 'ElevenLabs synthesizes Grom’s reply' }
  - { step: 'Game state', detail: 'Unity reads the flag; Grom starts following the player' }
links:
  repo: https://github.com/tunakmynk/unity-llm-voice-npc
  video: https://www.youtube.com/watch?v=wW9WMaQVq_k
---

## Problem

In most games, persuasion is a menu: three dialogue options, one of them is right. The player doesn't persuade anyone, they just look for the correct option. The second playthrough has no tension because they remember the answer.

LLMs can make free-form conversation possible, but **plugging a chatbot into an NPC isn't a game**. A conversation you can't lose has no challenge. I wanted to test one idea: can an LLM-driven NPC **resist** the player in a consistent way, so that convincing it takes real understanding of the character?

The prototype has one NPC: **Grom**, a proud, grumpy dwarf blacksmith. The player has to convince him to follow them, by typing or speaking.

## Architecture & design decisions

The Unity 6 client handles the world, movement, UI, and NPC behavior (`ChatUI`, `PlayerMovement`, `SimpleFollow`). A **Python FastAPI backend** handles everything AI-related: sessions, speech, LLM, and voice synthesis. They communicate over an **asynchronous REST API** with structured JSON payloads and Base64-encoded audio.

**Why a separate Python backend instead of calling APIs from C#?** The AI ecosystem (SDKs, prompt tooling, audio libraries) is much stronger in Python. Keeping the AI logic behind an API also means I can change the models without rebuilding the Unity project.

**Why one structured LLM call per turn?** Gemini 2.5 Flash returns a JSON object with two parts: the line the player hears, and a hidden decision flag.

```json
{
  "response": "Hmph. You mentioned your father… I knew him.",
  "isConvinced": false
}
```

Unity's `CallTheAPI` reads `isConvinced` and fires an event to `SimpleFollow`. One call instead of two keeps latency and cost down.

**Why a rule-based layer in front of the LLM?** Predictable inputs like greetings and farewells never reach the LLM. They cost nothing and get an instant answer.

## Challenges & how I solved them

### LLMs agree with people too easily
Tell a model to "say when you're convinced" and it gives in as soon as the player insists. That breaks the game.
**Fix:** I separated **acting from judging**. The character stays in role, and the decision is a separate structured field scored against explicit rules: sincerely mentioning Grom's father strongly helps, offering gold helps, and threats mean an immediate refusal.

### Players could win with one lucky sentence
If Grom could be convinced on the first message, the player learned nothing about him.
**Fix:** a **minimum two-turn rule**. Grom can't be convinced on the first turn, so the player has to listen to him at least once. This single rule changed how the game felt more than any other change.

### Moving audio between Unity and Python
Unity's audio clips and the Python speech and TTS libraries use different formats.
**Fix:** audio travels as **Base64 inside the JSON payloads**, and format conversion happens on the backend. The API stays a simple JSON contract and the Unity client doesn't need any extra audio libraries.

### Latency and staying in character
Every turn goes through STT → LLM → TTS, and the character must keep the same voice and personality the whole time.
**Fix:** rule-based answers for trivial inputs, a single LLM call per turn, and a carefully layered persona prompt (backstory, speaking style, red lines) to keep Grom consistent.

## Results

- A working **vertical slice**: the player walks up to Grom in a 3D scene, argues by text or voice, and Grom starts following them once convinced. [Watch the gameplay video](https://www.youtube.com/watch?v=wW9WMaQVq_k).
- Confirmed the core design question: a free-text persuasion mechanic is fun **when the NPC can say no**.
- I wrote a full game design document from the prototype, covering a 5-vector persuasion model, a hidden 0–100 trust meter, consistency memory to catch player lies, and defenses against prompt injection.

### What I'd do next
Move the judge into its own LLM call that treats player text purely as data (a stronger defense against prompt injection), and replace the yes/no flag with a trust score so NPCs can be partially persuaded.
