# NexusFlow — AI-Powered Content Workflow Platform

## Overview

**NexusFlow** is a full-stack, AI-powered content creation and repurposing platform built for content creators, marketers, and social media managers. It uses a visual **node-based canvas** (powered by ReactFlow) to let users design content workflows — transforming a single seed idea into platform-optimized posts across Twitter, LinkedIn, Instagram, YouTube, Facebook, and blogs.

---

## Tech Stack

| Layer             | Technology                                            |
| ----------------- | ----------------------------------------------------- |
| **Frontend**      | React 18, ReactFlow, Vite                             |
| **Styling**       | Vanilla CSS + Inline Styles (dark theme)              |
| **AI Backend**    | AWS Bedrock (Claude 3.5 Sonnet, Titan) via Lambda     |
| **Auth**          | AWS Cognito + Google Identity Services (OAuth 2.0)    |
| **Cloud Sync**    | AWS API Gateway + Lambda (DynamoDB-backed)            |
| **State**         | React useState/useCallback + localStorage persistence |
| **Icons**         | Lucide React                                          |
| **Notifications** | react-hot-toast                                       |

---

## Core Features

### 1. Authentication (`AuthScreen.jsx`, `AuthContext.jsx`)

- Google OAuth sign-in (one-tap + popup flows)
- AWS Cognito email/password sign-up with confirmation code
- Session persistence via localStorage tokens
- Auto-refresh and silent session checks

### 2. Onboarding (`OnboardingFlow.jsx`)

- Multi-step guided setup for new users
- Collects: content niche, target platforms, audience, and tone preferences
- Seeds the user profile with personalized defaults

### 3. Home Dashboard (`HomePage.jsx`)

- Workflow management: create, open, rename, duplicate, delete workflows
- Quick Start templates for common content strategies
- Trending content ideas (niche-aware, dynamically generated)
- Usage stats and recent activity at a glance

### 4. Node-Based Canvas (`App.jsx` → `FlowCanvas`)

The heart of the application — a visual drag-and-drop workflow editor.

#### Node Types (9 total)

| Node            | File                 | Purpose                                                          |
| --------------- | -------------------- | ---------------------------------------------------------------- |
| **Seed**        | `SeedNode.jsx`       | Input node — paste text or scrape a URL as the content source    |
| **Platform**    | `PlatformNode.jsx`   | AI-generates platform-specific content (Twitter, LinkedIn, etc.) |
| **Image**       | `ImageNode.jsx`      | AI-generates images using Titan Image Gen v2                     |
| **Viral Score** | `ViralScoreNode.jsx` | Analyzes content for engagement potential (sentiment + score)    |
| **Tags**        | `TagsNode.jsx`       | Auto-generates hashtags, SEO keywords, and categories            |
| **Schedule**    | `ScheduleNode.jsx`   | Creates optimized posting schedules per platform                 |
| **Summarize**   | `SummarizeNode.jsx`  | Condenses content into bullet points, one-liners, or paragraphs  |
| **Persona**     | `PersonaNode.jsx`    | Rewrites content for different audience personas                 |
| **A/B Test**    | `ABTestNode.jsx`     | Generates content variants with engagement scores                |

#### Canvas Features

- Drag-and-drop from sidebar to canvas
- Node connections (edges) for content flow
- Undo/Redo with full history stack
- Keyboard shortcuts (Ctrl+G generate, Ctrl+K command menu, Ctrl+S save, etc.)
- MiniMap navigation
- Zoom controls with fit-to-view
- Smart paste (Ctrl+V auto-creates Seed node)
- Command menu for quick node spawning
- Auto-save (debounced 5s) + manual save
- Canvas empty state with onboarding prompt

### 5. Right Panel (`RightPanel.jsx`)

- Contextual inspector for selected nodes
- AI-powered content suggestions and idea generation
- Content preview and editing tools
- Platform-specific formatting helpers

### 6. Caption Generator (`CaptionGenerator.jsx`)

- Standalone tool for generating photo/image captions
- Multi-platform parallel generation (all 6 platforms at once)
- Tone slider for casual ↔ professional styling
- Uses AWS Bedrock with local mock fallback

### 7. Profile System (`components/profile/`)

| Section           | File                            | Features                                                      |
| ----------------- | ------------------------------- | ------------------------------------------------------------- |
| **Wrapper**       | `ProfileWrapper.jsx`            | Layout shell, sidebar nav, theme system, state management     |
| **User Info**     | `UserInfoSection.tsx`           | Display name, email, bio, avatar management                   |
| **Content Prefs** | `ContentPreferencesSection.tsx` | Niche, platforms, audience, tone selection (portal dropdowns) |
| **App Settings**  | `AppSettingsSection.tsx`        | Theme, AI model, auto-save interval, cloud sync toggle        |
| **Usage Stats**   | `UsageStatsSection.tsx`         | Workflow count, AI usage bar, recent activity feed            |
| **Security**      | `AccountSecuritySection.tsx`    | Password change, sign-out, account deletion                   |
| **Sidebar**       | `ProfileSidebar.tsx`            | Desktop sidebar + mobile tab bar navigation                   |

---

## API Layer (`api.js`)

All AI features are powered through a unified API client that:

- Calls **AWS Bedrock** (via API Gateway → Lambda) in production
- Falls back to **intelligent mock generators** when no API URL is configured
- Implements **LRU response caching** (50 entries)
- Supports **AbortController signals** for request cancellation
- Includes **request deduplication**

### Endpoints

| Function                              | Endpoint            | Purpose                                  |
| ------------------------------------- | ------------------- | ---------------------------------------- |
| `generateContent()`                   | `/generate`         | Platform-specific content from seed text |
| `generateImage()`                     | `/image`            | AI image generation (Titan)              |
| `scoreContent()`                      | `/score`            | Viral score + sentiment analysis         |
| `generateTags()`                      | `/tags`             | Hashtags, keywords, categories           |
| `generateSchedule()`                  | `/schedule`         | Posting schedule optimization            |
| `summarizeContent()`                  | `/summarize`        | Content summarization                    |
| `generateVariants()`                  | `/variants`         | A/B test content variants                |
| `scrapeUrl()`                         | `/scrape`           | URL content extraction                   |
| `generateCaptionsFromPhoto()`         | `/generate` (multi) | Parallel caption generation              |
| `saveWorkspace()` / `loadWorkspace()` | `/workspace/:id`    | Workspace persistence                    |

---

## Utilities

| File                 | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `workflowManager.js` | Workflow CRUD, per-user data isolation, cloud sync |
| `cloudSync.js`       | Cloud ↔ local profile synchronization              |
| `authConfig.js`      | AWS Cognito configuration checker                  |
| `nodeFactory.js`     | Node type registry, default data, edge options     |
| `constants.js`       | Toast helpers, platform types, workspace ID        |
| `helpers.js`         | Node ID generation utilities                       |

## Custom Hooks

| Hook                   | Purpose                           |
| ---------------------- | --------------------------------- |
| `useKeyboardShortcuts` | Canvas keyboard shortcut handling |
| `useGenerate`          | AI generation state management    |
| `useClipboard`         | Clipboard read/write              |
| `useNodeSource`        | Node data source resolution       |
| `useResizable`         | Panel resize handling             |

---

## Routing

URL-based SPA routing (no React Router — custom `history.pushState`):

| Route                | View              |
| -------------------- | ----------------- |
| `/`                  | Home Dashboard    |
| `/canvas`            | Workflow Canvas   |
| `/profile`           | Profile Settings  |
| `/caption-generator` | Caption Generator |
| `/login`, `/signup`  | Auth Screen       |

---

## Design System

- **Theme**: Dark mode (`#0A0A0A` background, `#111111` surfaces)
- **Typography**: Inter font family
- **Borders**: `rgba(255,255,255,0.07)` subtle glass borders
- **Scrollbar**: Custom dark-themed, no arrows
- **Animations**: CSS transitions on hover, transform, and opacity
- **Layout**: Flexbox-based responsive design with sidebar + content pattern

---

## Deployment

Deployable to **AWS** using SAM CLI (see `/deploy-aws` workflow). Infrastructure includes:

- S3 + CloudFront for static hosting
- API Gateway + Lambda for backend
- Cognito User Pool for auth
- DynamoDB for data persistence
