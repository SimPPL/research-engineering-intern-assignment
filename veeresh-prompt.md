# AI Prompt Engineering Log

**Author:** Veeresh
**Role:** Research Engineering Intern


This document logs the progressive prompting strategy used to build the Social Media Analytics Dashboard. It demonstrates the application of advanced prompt engineering techniques including **Persona Assignment**, **Context Grounding**, **Chain-of-Thought (CoT)**, **Few-Shot Prompting**, and **Iterative Refinement**.

---

## Phase 1: System Architecture & Data Pipeline

### Prompt 1: Persona & Context Grounding
**Technique:** *Persona/Role Prompting + Context Setting*

> **My prompt:** You are Senior Data Architect specializing in social media analytics having a IQ of 230.I am building a dashboard to track misinformation. I have a raw dataset `data.json` containing Reddit posts. The frontend is React (Vite) and the backend processing is Python.

> Here is my current file structure:
> - `my-data-ui/src/` (React App)
> - `scripts/` (Python scripts)
> - `public/data.json` (Raw Data)
>
> **Task:** Analyze this structure. Propose a data pipeline where the Python script pre-computes heavy analysis (Topic Modeling, Sentiment) and saves it as static JSON files for the React app to consume. Explain the data flow.

**Outcome:** The AI proposed a "Pre-computation Pattern" to ensure the frontend remains fast, suggesting the creation of `overview.json`, `topics.json`, and `network.json`.

---

## Phase 2: Backend Logic Implementation

### Prompt 2: Logic Generation
**Technique:** *Chain-of-Thought (CoT)*

> **My prompt:** I need to write the `precompute_analysis.py` script. Do not write the full code yet. Instead, break down the logic into steps for the following requirements:
> 1. Load `data.json`.
> 2. Clean the text (remove URLs, special characters).
> 3. Perform Sentiment Analysis using VADER.
> 4. Perform Topic Modeling using LDA (Latent Dirichlet Allocation).
> 5. Export the results to `public/precomputed/`.
>
> **Task:** Outline the functions we will need for each step.

**Outcome:** The AI outlined a modular structure (`clean_text`, `analyze_sentiment`, `run_lda`), which prevented monolithic, unmaintainable code.

### Prompt 3: Iterative Refinement (Debugging)
**Technique:** *Iterative Refinement*

> **My prompt:** I ran the generated Python script, but I am getting a `TypeError: expected string or bytes-like object` in the LDA step.
>
> **Observation:** It seems some `selftext` fields in the JSON are `null` or empty.
>
> **Refined Prompt:** Modify the `clean_text` function. Before processing, check if the text is `None`. If it is, return an empty string `""`. Also, ensure we only pass valid non-empty tokens to the LDA model to avoid the TypeError.

**Bugs Fixed:** Handled `null` values in the raw dataset which were crashing the topic modeling library.

---

## Phase 3: Frontend Development

### Prompt 4: Component Design
**Technique:** *Few-Shot Prompting*

> **My prompt:** I want to create a "KPI Card" component for the dashboard.
>
> **Example Input (What I like):**
> ```tsx
> <Card title="Total Users" value="5,000" trend="+12%" />
> ```
>
> **Task:** Create a more advanced `KPICard` component in React using Tailwind CSS. It should accept `label`, `value`, `icon` (from lucide-react), and a `trend` object. If the trend is positive, color it green; if negative, red.

**Outcome:** The AI generated a reusable, styled component that matched the design system of the provided example.

### Prompt 5: Complex Feature Implementation (Event Correlation)
**Technique:** *Context Grounding + CoT*

> **Context:** We have a file `events.json` with real-world dates (e.g., "Election Day"). We want to see if these events correlate with spikes in social media posts.
>
> **Task:**
> 1. In `OverviewTab.tsx`, read the `event_correlations.json`.
> 2. Overlay these dates on the main `LineChart`.
> 3. Use a `ReferenceLine` to mark the date.
> 4. When hovering over the line, show a custom tooltip with the event description.

---

## Phase 4: AI Copilot Logic

### Prompt 6: Intent Engineering
**Technique:** *Few-Shot Prompting (Logic)*

> **My prompt:** I am building the `handleSend` function for the AI Copilot. It needs to understand user intent without a backend LLM.
>
> **Task:** Implement a rule-based parser.
>
> **Examples of Rules:**
> - If input contains "top authors" -> Calculate top 5 authors from `data` and return list.
> - If input contains "sentiment" -> Calculate % positive/negative and return summary.
>
> **New Rule to Add:**
> - If input contains "search for [keyword]" -> Filter `data` for that keyword and return the count and top 3 post titles.

**Outcome:** The AI implemented a robust `if/else` intent parser that mimics a smart assistant, allowing users to query the dataset naturally.

---

## Summary of Experience
By using **Persona Prompting**, I ensured the code structure was professional. **Chain-of-Thought** helped break down complex logic (like LDA) into manageable chunks. **Iterative Refinement** was crucial for debugging data quality issues in the Python pipeline.

# Task and outcome is highlighted to show the main things.