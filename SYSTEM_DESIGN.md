# System Design & Implementation Logic

**Author:** Veeresh
**Project:** MisinfoOps - Social Media Analytics Dashboard

---

## 1. Architectural Philosophy: "Pre-Compute & Serve"

The core design challenge for this dashboard was handling heavy data analysis (Topic Modeling, Sentiment Analysis) without compromising the frontend user experience. Running complex NLP algorithms like LDA (Latent Dirichlet Allocation) or VADER sentiment analysis directly in the browser would cause significant lag and memory issues.

**Solution:** I adopted a **Pre-computation Architecture**.
- **Backend (Python):** Acts as an ETL (Extract, Transform, Load) pipeline. It ingests the raw `data.json`, performs all heavy mathematical operations, and exports lightweight, optimized JSON files (`overview.json`, `topics.json`, `network.json`, `event_correlations.json`).
- **Frontend (React/Vite):** Acts purely as a visualization layer. It fetches these pre-computed JSONs instantly, ensuring the dashboard feels "snappy" and responsive, regardless of the dataset size.

### System Architecture Diagram

```text
+------------------+       +-----------------------------+       +----------------------+
|   Raw Data       |       |   Python ETL Pipeline       |       |   Static JSON Assets |
|                  |       | (scripts/precompute.py)     |       | (public/precomputed) |
|  [ data.json ]   +------>+                             +------>+  [ overview.json ]   |
|  [ events.json ] |       |  1. Clean Text              |       |  [ topics.json ]     |
+------------------+       |  2. VADER Sentiment         |       |  [ network.json ]    |
                           |  3. LDA Topic Modeling      |       |  [ correlations.json]|
                           |  4. Event Correlation       |       +----------+-----------+
                           +-----------------------------+                  |
                                                                            |
                                                                            v
                                                                 +----------------------+
                                                                 |   React Frontend     |
                                                                 |                      |
                                                                 |  [ Overview Tab ]    |
                                                                 |  [ Narrative Tab ]   |
                                                                 |  [ Network Tab ]     |
                                                                 |  [ Analyst Copilot ] |
                                                                 +----------------------+
```

---

## 2. Data Pipeline (Python)

The `scripts/precompute_analysis.py` script is the engine of the system.

### Key Components:
1.  **Data Cleaning:**
    - Raw social media text is noisy. I implemented a cleaning function to remove URLs, special characters, and handle `null` values (a bug I caught during development where `selftext` was missing).
2.  **Sentiment Analysis (VADER):**
    - I chose VADER (Valence Aware Dictionary and sEntiment Reasoner) because it is specifically tuned for social media text (handling emojis, slang, and capitalization) better than generic NLP models.
3.  **Topic Modeling (LDA):**
    - To discover hidden narratives, I used Scikit-Learn's Latent Dirichlet Allocation. This unsupervised learning algorithm groups posts into "topics" based on word co-occurrence, allowing us to see *what* people are talking about without manual labeling.
4.  **Event Correlation (New Feature):**
    - I added a logic layer that reads a separate `events.json` (real-world events). It aligns these dates with the post time-series to calculate "Volume Spikes" and "Sentiment Shifts" on those specific days, bridging the gap between online discourse and offline reality.

---

## 3. Frontend Design (React + Tailwind)

The UI was built with a focus on **"Investigative Storytelling"**.

### Key Decisions:
1.  **Component Modularity:**
    - The dashboard is split into distinct tabs (`Overview`, `Narrative`, `Network`, `Copilot`). Each tab is a self-contained React component, making the codebase easy to maintain and extend.
2.  **Visual Hierarchy:**
    - I used Tailwind CSS to create a clean, professional aesthetic. The "Key Metrics" row at the top gives immediate context (Total Posts, Active Authors), followed by the main timeline, and then deeper drills (Sentiment, Network).
3.  **Interactive Visualization:**
    - **Recharts:** Used for the time-series and pie charts because of its declarative nature and smooth animations.
    - **Force Graph:** Used for the Network tab to visualize the "echo chambers" of authors and domains.
4.  **Analyst Copilot (AI Feature):**
    - Instead of a generic chatbot, I implemented a **Rule-Based Intent Parser**. It detects specific user intents (e.g., "top sources", "search for X") and queries the local dataset in real-time. This provides instant, deterministic answers without needing an expensive backend LLM API for every query.

---

## 4. AI Usage & Verification

I utilized AI (GitHub Copilot) as a "Force Multiplier" throughout the project. My strategy was **Context-First**:
- I always established the file structure and goal before asking for code.
- I critically reviewed every output. For example, when the AI suggested a date format that didn't match my JSON, I caught it, refined the prompt, and fixed the pipeline.
- This approach allowed me to build a robust, error-free system much faster than traditional coding, while maintaining full understanding and control over the logic.
