# ShikshaAI - Intelligent Learning & AI-Guided Career Roadmap Platform

ShikshaAI is a modern, personalized AI-powered learning path and skill mastery platform built with Next.js, React 19, TypeScript, and Tailwind CSS.

## 🌟 Key Features

- **Personalized Path Builder:** 4-step interactive onboarding wizard that constructs custom multi-phase roadmaps based on experience level, available study pace, and goals.
- **Dynamic Learning Dashboard:** Real-time tracking of milestones, weekly study hours, daily streaks, skill mastery metrics, and recommended next lessons.
- **Learning Path & Milestone View:** Deep phase-by-phase breakdown with interactive lesson detail modals, code snippets, key learning objectives, and 1-click completion tracking.
- **Resource Explorer:** Search and filter curated technologies, tutorials, capstone projects, and learning paths with 1-click "Add to Path" integration.
- **Progress & Analytics:** Deep mastery analytics, streak momentum, phase completion charts, and learning history.
- **Shiksha Bot (AI Chatbot):** Context-aware AI learning companion for concept explanations, tailored study schedules, and knowledge check quizzes with support for Google Gemini and OpenAI.
- **Responsive Layout & Visual Theme:** Warm editorial aesthetic adhering to the 5-color brand system (Oxblood `#54252C`, Muted Wine `#803F47`, Chalk White `#F6F1E9`, Warm Stone `#D8C8BA`, Charcoal `#292827`) with full mobile/tablet/desktop responsiveness.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure AI Provider (Optional)
Create a `.env.local` file in the root directory if you wish to enable live LLM generation with Shiksha Bot:
```env
# Google Gemini 1.5 Flash (Recommended)
GEMINI_API_KEY=your_gemini_api_key_here

# Or OpenAI GPT-4o-mini
OPENAI_API_KEY=your_openai_api_key_here
```
*(If no API keys are provided, Shiksha Bot automatically operates in the built-in Educational Demo Engine).*

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start exploring ShikshaAI.

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router, Turbopack)
- **UI & Animation:** React 19, Tailwind CSS, Lucide React, Framer Motion, GSAP
- **State & Data:** LocalStorage-backed reactive services with full cross-page synchronization
