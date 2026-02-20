# NexusFlow - Technical Design Document

**Version:** 1.0 (Hackathon MVP)
**Date:** October 26, 2023

## 1. Introduction

This document outlines the technical design and system architecture for NexusFlow, an AI-driven visual content workflow tool. The design prioritizes a responsive user experience (UX) for the node-based graph interface while managing long-running asynchronous calls to external AI models in the backend.

## 2. High-Level System Architecture

NexusFlow follows a modern three-tier architecture separating concerns between visualization, logic orchestration, and external intelligence.

**Reference Architecture Diagram:**

### 2.1 tiers
1.  **Client Layer (Frontend):** A single-page application (SPA) built with React. It is responsible for rendering the interactive infinite canvas, managing the immediate application state (graph topology), and handling user interactions (drag-and-drop, editing text).
2.  **Application Layer (Backend):** A lightweight, asynchronous server built with FastAPI (Python). It acts as the orchestrator. It receives generation requests from the frontend, processes input data, selects appropriate prompt templates, and manages communication with external AI APIs.
3.  **Model Layer (External AI Services):** Third-party APIs utilized for intelligence.
    * **Google Gemini Pro:** Used for text generation, summarization, tone adjustment, and code snippet generation.
    * **Stability AI:** Used for generating visual assets (thumbnails, social media images) based on text prompts.

---

## 3. Component Design

### 3.1 Frontend Components (React)

The frontend is centered around the `React Flow` library.

* **`GraphCanvasContainer`**: The main wrapper component holding the state of the graph (nodes and edges). It handles callbacks for node connections, dragging, and panning.
* **`CustomNode Types`**: React Flow allows custom components for nodes. We will define specific components for different content types to render their unique data and UI controls.
    * `SeedNode`: Input field for URLs or raw text.
    * `TextGenNode`: (Used for Twitter, LinkedIn, etc.) Displays generated text with a "Regenerate" button and tone slider. editable textarea.
    * `ImageGenNode`: Displays a loading spinner or the generated image result.
* **`NodeSidebar`**: A UI palette containing draggable node types (e.g., "Twitter Thread", "IG Image"). Users drag from here onto the canvas.
* **`StateManager (Redux/Zustand)`**: A central store to hold the entire JSON representation of the graph. When a user adds a node or edits text, this store updates. The store is responsible for dispatching async actions to the backend API when a generation triggers.

### 3.2 Backend Components (FastAPI)

The backend is stateless and primarily event-driven by frontend requests.

* **`APIRouter`**: Defines endpoints for the frontend to communicate with. (e.g., `POST /api/v1/generate`).
* **`ContentIngestionService`**: A module responsible for taking a URL provided by a Seed Node, scraping the relevant content (using libraries like `beautifulsoup4` or similar), and cleaning it for the LLM.
* **`PromptEngineModule`**: A dictionary or registry of system prompts tailored for specific outputs.
    * *Example Key:* `twitter_thread`
    * *Example Value:* "You are a viral social media expert. Take the provided text and convert it into a compelling 5-tweet thread. Focus on strong hooks..."
* **`AIServiceClient (Async)`**: An asynchronous wrapper around the external API calls (Gemini and Stability) to ensure the FastAPI server remains non-blocking while waiting for external responses.

---

## 4. Data Model (Graph Representation)

The state of the application is represented as a JSON graph structure compatible with React Flow.

### 4.1 The Graph Object
```json
{
  "nodes": [ /* Array of Node Objects */ ],
  "edges": [ /* Array of Edge Objects */ ]
}
