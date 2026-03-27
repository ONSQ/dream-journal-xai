# Vigilant Spirit XAI Journal

**Vigilant Spirit XAI Journal** is a specialized dream journaling application and classification engine built as a research project focusing on **AI Trust, Confidence, and Explainable AI (XAI)**. 

The application analyzes user dreams to determine if they contain elements of **Spiritual / Divine Communication**, **Trauma Processing**, or everyday **Maintenance / Biological Processing**.

## The "Glass Box" Approach to XAI

Most modern AI systems (like Large Language Models) operate as unpredictable "Black Boxes", making it difficult for users—especially in highly sensitive, religious, or psychological domains—to trust the AI's conclusions.

This project purposely uses a deterministic, lexicon-weighted heuristic engine (a **"Glass Box"**) rather than a neural network. By applying sophisticated XAI visualization paradigms to a fully interpretable model, the application bridges the trust gap and provides users with a transparent *UI of Explainability*.

The system generates:
*   **SHAP (Additive Feature Attribution):** Shows exactly *how much* specific individual words contributed to the final classification globally.
*   **LIME (Local Surrogates):** Uses leave-one-out perturbation to show how probabilities shift *locally* when specific words are removed.
*   **Counterfactual Analysis:** Generates human-readable sentences explaining alternate realities (e.g., *"Removing the word 'chasing' would cause the Trauma probability to fall by 22%"*).

## Project Architecture

This project is structured as a **pnpm monorepo** containing three main components:

1.  **Vigilant Spirit Dream Journal** (`artifacts/vigilant-spirit`):
    *   The primary React-based frontend application for users.
    *   Features decoupled flows for Morning (Dream Capture) and Evening (Pre-sleep grounding).
2.  **XAI Explorer** (`artifacts/xai-explorer`):
    *   A secondary React-based frontend used for analyzing the AI's logic.
    *   Displays SHAP tables, LIME charts, and allows adversarial live testing of the classification engine.
3.  **API Server** (`artifacts/api-server`):
    *   An Express backend that runs the core classification logic (`classify.ts`).
    *   Manages the SQLite database (via Drizzle ORM) containing user entries.

## Live Deployment

The application is deployed live on Replit.
*   **Main App:** [https://dream-vigilant-spirit.replit.app](https://dream-vigilant-spirit.replit.app)
*   **XAI Explorer:** [https://dream-vigilant-spirit.replit.app/xai-explorer](https://dream-vigilant-spirit.replit.app/xai-explorer)

## Local Development Setup

### Prerequisites
*   Node.js (v18+)
*   `pnpm` package manager installed (`npm install -g pnpm`)

### Installation & Running
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ONSQ/dream-journal-xai.git
    cd dream-journal-xai
    ```
2.  **Install dependencies:**
    *(Note for Windows users: Ensure any Linux-specific `preinstall` scripts in the root `package.json` are removed before running).*
    ```bash
    pnpm install
    ```
3.  **Start all services:**
    ```bash
    pnpm run dev
    ```

This command will simultaneously boot the backend API server and both Vite frontend applications on your local machine.

### Seeding the Database
The project includes a seeder script capable of generating 42 diverse, pre-classified dreams (Spiritual, Trauma, Maintenance, and Mixed) into the database for demonstration purposes.
```bash
node artifacts/api-server/scripts/seed_replit.js
```

## Presentation / Lab Mode

This repository is designed to be used in an educational setting to teach AI Masters students about trust and explainability. It includes an "Adversarial Lab" format where students attempt to trick the deterministic classifier and then use the XAI Explorer to instantly understand why the machine graded it the way it did.
