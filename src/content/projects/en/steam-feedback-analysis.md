---
title: Steam Player Feedback Analysis System
tagline: An AI QA assistant that turns 15,000+ negative Steam reviews of Crimson Desert into ranked, queryable bug reports for a development team.
category: Applied AI · NLP · RAG
period: Mar 2026 – May 2026
status: completed
order: 2
stack: [Python, Flask, Sentence Transformers, UMAP, HDBSCAN, ChromaDB, Gemini 2.5 Flash]
cv:
  - 'Engineered an NLP data pipeline to ingest and process 15,000+ unstructured user reviews, using UMAP/HDBSCAN clustering to automatically categorize technical issue reports.'
  - 'Integrated a ChromaDB vector database with a Gemini 2.5 Flash RAG framework to support natural language querying and dynamic metadata filtering.'
  - 'Enhanced backend pipeline resilience by implementing automated API rate-limiting and key-rotation mechanisms, plus a scoring algorithm for issue prioritization.'
highlights:
  - { value: '15,000+', label: 'negative reviews processed' }
  - { value: '59', label: 'issue clusters discovered' }
  - { value: '2', label: 'LLM roles: router + reporter' }
pipeline:
  - { step: 'Ingest', detail: 'Pull reviews from the Steam API, filter by language, clean text' }
  - { step: 'Embed', detail: 'Multilingual vectors with Sentence Transformers' }
  - { step: 'Cluster', detail: 'UMAP reduces dimensions, HDBSCAN finds 59 clusters' }
  - { step: 'Label', detail: 'LLM names and summarizes each cluster' }
  - { step: 'Index', detail: 'Reviews + metadata stored in ChromaDB' }
  - { step: 'Query', detail: 'Router LLM → metadata filters → retrieval → report' }
links:
  repo: https://github.com/tunakmynk/game-bug-tespiti-LLM
---

## Problem

When a big game launches, the negative reviews pile up faster than any QA team can read them. Crimson Desert had **more than 15,000 negative Steam reviews**, written in many languages and mixing crash reports, performance complaints, and general frustration.

The information a developer needs is in there, like *"the game crashes on startup with this GPU"*. But nobody can find it by scrolling. I wanted a system that:

1. **Groups** thousands of complaints into real issue categories automatically, without me defining the categories in advance.
2. **Answers questions** in plain language, e.g. *"What are the most critical performance problems?"*
3. **Ranks** issues so the team fixes the most damaging ones first.

## Architecture & design decisions

The system has two halves: an **offline pipeline** that builds the knowledge base, and an **online query path** served by Flask.

**Why Sentence Transformers for embeddings?** The reviews are multilingual. A multilingual embedding model puts *"crashes on launch"* and its Turkish or German version close together in vector space, so the reviews cluster by meaning instead of by language.

**Why UMAP + HDBSCAN instead of k-means?** I didn't know how many issue types existed, and k-means makes you pick that number. HDBSCAN finds the number of clusters itself and marks outliers as noise instead of forcing them into a group. Density-based clustering works poorly on raw high-dimensional embeddings, so UMAP reduces the dimensions first. The result was **59 meaningful clusters**, each named and summarized by an LLM.

**Why ChromaDB?** It stores the vectors and the metadata together (cluster, topic, language, criticality) and supports metadata filtering at query time. It also runs embedded in the Python process, with no separate server to operate.

**Why two LLM roles?** One model call can't reliably both work out what the user means and write a good report. So I split them:

- A **router LLM** (internally, the "Traffic Police") turns a natural-language question into structured metadata filters.
- A **report LLM** receives only the filtered, retrieved reviews and writes the answer.

## Challenges & how I solved them

### Vector search alone returned the wrong reviews
A question like *"critical performance issues"* is semantically close to thousands of reviews. Pure similarity search returned plausible but unfocused results.
**Fix:** the router LLM first converts the question into metadata filters (topic, cluster, criticality). Retrieval then only searches the relevant slice of the database.

### Single review chunks lacked context
Short retrieved fragments often lost the surrounding details, like which hardware was involved or what happened just before the crash.
**Fix:** a **parent-child retrieval** setup. The search matches small, precise child chunks, but the LLM receives the full parent review as context.

### API quota limits stopped bulk processing
Labeling clusters and generating reports meant many Gemini calls, and free-tier quotas ran out mid-run.
**Fix:** a key rotation mechanism that catches quota errors and switches to the next API key automatically, so long jobs finish without manual restarts.

### Finding the top 10 in 59 clusters
Cluster size alone isn't severity: a small cluster of save-file corruption reports matters more than a large cluster of UI complaints.
**Fix:** a **criticality scoring** step that ranks issues so the report puts the most damaging problems first.

## Results

- Reduced 15,000+ unstructured reviews to **59 labeled issue clusters** without defining any categories manually.
- Built a natural-language interface where a QA engineer can ask a question and get a report grounded in real player reviews.
- Made the pipeline resilient to API quota limits through automatic key rotation.

### What I'd do next
Add an evaluation set of questions with known correct clusters to measure retrieval precision, and run the ingestion on a schedule so new reviews after each patch show up automatically.
