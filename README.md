# ⌨️ TypeMaster — Professional Typing Learning & Speed Test Platform

<p align="center">
  <img src="public/favicon.svg" alt="TypeMaster Logo" width="80" height="80" />
</p>

<p align="center">
  <strong>Master touch typing, accelerate your WPM, and achieve flawless accuracy with structured courses, live analytics, and gamified mastery.</strong>
</p>

<p align="center">
  <a href="https://github.com/Prasanna-1166/Typer-Test/actions"><img src="https://img.shields.io/badge/build-passing-brightgreen?style=flat-square" alt="Build Status" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://vitest.dev/"><img src="https://img.shields.io/badge/Vitest-32%20Passed-FCC72B?style=flat-square&logo=vitest&logoColor=black" alt="Vitest" /></a>
  <a href="https://oxc.rs/"><img src="https://img.shields.io/badge/Linter-Oxlint-orange?style=flat-square" alt="Oxlint" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" /></a>
</p>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Curriculum & Learning Paths](#-curriculum--learning-paths)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Privacy & Local Storage](#-privacy--local-storage)
- [Roadmap & Future Enhancements](#-roadmap--future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Overview

**TypeMaster** is a modern, responsive, offline-first touch-typing education platform built with **React 19**, **TypeScript**, and **Vite**. Whether you are a beginner learning home row finger positions or a developer sharpening syntax typing speed, TypeMaster provides an end-to-end curriculum, granular real-time feedback, and comprehensive analytics.

All session data, streaks, and achievements are saved locally using **IndexedDB**, guaranteeing privacy, instantaneous performance, and offline availability with zero cloud dependence.

---

## ✨ Key Features

### 🎓 1. Structured Curriculum (47 Handcrafted Lessons)
- **3 Progressive Levels**: Beginner, Intermediate, and Advanced tracks.
- **Micro-Targeted Objectives**: Focused practice on home row, alphabet expansion, capitalizations, numbers, symbols, and programming syntax.
- **Passing Requirements**: Thresholds for accuracy percentage and minimum WPM to ensure genuine muscle memory before advancing.

### ⌨️ 2. Interactive Virtual Keyboard & Finger Guide
- **Dynamic Key Highlighting**: Shows the exact key to press in real time.
- **Visual Finger Guide**: Color-coded finger zones teaching ergonomic finger-to-key mapping.
- **Responsive Layout**: Adapts gracefully across desktop and tablet screens.

### ⚡ 3. Real-Time Typing Engine
- **Instant Character Feedback**: Color-coded character states for correct, incorrect, and corrected keystrokes.
- **Live Metrics**: Monotonic timer calculating Gross WPM, Net WPM, accuracy percentage, and mistake distribution on the fly.
- **Configurable Caret**: Customizable caret styles (`line`, `block`, `underline`) and adjustable font sizes.

### ⏱️ 4. Flexible Typing Tests & Custom Drills
- **Timed Modes**: Standard 15s, 30s, 60s, and 120s speed tests.
- **Passage Mode**: Curated literary, historical, and technical excerpts.
- **Free Practice Mode**: Practice custom text snippets with configurable backspace rules.

### 📊 5. In-Depth Performance Analytics
- **Visual Charts (Recharts)**: Interactive graphs tracking WPM progression, accuracy consistency, and speed trends over time.
- **Weak-Key Heatmap**: Pinpoint problematic characters and frequent typos to target deliberate practice.
- **Intelligent Recommendations**: Automated guidance recommending lessons or speed drills based on your recent error patterns.

### 🏆 6. Gamification & Achievements
- **Level & XP Engine**: Earn experience points for every completed lesson and test.
- **Daily Streak Tracker**: Stay consistent with practice streak tracking.
- **21 Unlockable Badges**: Milestone achievements covering speed plateaus, perfect accuracy, lesson milestones, and endurance.

### 📜 7. Verifiable Certificates
- Earn completion certificates upon finishing track milestones.
- Generates beautiful, printable credentials complete with student name, date, track level, verified WPM, and accuracy rating.

### 🛠️ 8. Admin Studio & Data Portability
- **Custom Lesson Creator**: Create, edit, and organize custom lessons and practice drills.
- **Full Data Backup**: One-click JSON export and import for seamless migration and backup.
- **Data Reset**: Reset stats safely at any time.

---

## 📚 Curriculum & Learning Paths

| Level | Lessons | Target Focus | Core Skills Learned |
| :--- | :---: | :--- | :--- |
| 🟢 **Beginner** | 22 | Foundation & Muscle Memory | Home row keys (`ASDF JKL;`), index reach, top/bottom rows, shift capitalization, basic punctuation. |
| 🟡 **Intermediate** | 14 | Speed & Rhythm | Number row, frequent symbol combinations, speed bursts, rhythm consistency, error minimization. |
| 🟣 **Advanced** | 11 | Professional & Code Mastery | Complex literature, programming syntax (`{}`, `[]`, `=>`, `;`), multi-line code drills, final certification test. |

---

## 🛠 Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) | Latest React features and concurrency optimizations |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Strict type-safety across all modules and states |
| **Bundler & Tooling** | [Vite 8](https://vite.dev/) | Lightning-fast HMR and optimized production bundling |
| **Routing** | [React Router v7](https://reactrouter.com/) | Declarative client-side routing and page management |
| **Data Visualization** | [Recharts 3](https://recharts.org/) | Responsive SVG charts for metrics and progression |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible SVG iconography |
| **Client Storage** | [idb](https://github.com/jakearchibald/idb) | Promise-based IndexedDB wrapper for local persistence |
| **Testing** | [Vitest](https://vitest.dev/) & [Testing Library](https://testing-library.com/) | Unit tests, DOM assertions, and test runners |
| **Linter** | [Oxlint](https://oxc.rs/) | High-performance Rust-based JavaScript/TypeScript linter |

---

## 📂 Project Architecture

```text
Typer/
├── public/                 # Static assets & SVG icons
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/             # Images and design assets
│   ├── components/         # Reusable UI components
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── TypingInterface.tsx   # Core character-by-character typing engine
│   │   └── VirtualKeyboard.tsx   # Interactive visual keyboard & finger guide
│   ├── context/            # React Context for global state & storage sync
│   │   └── AppContext.tsx
│   ├── data/               # Default curriculum & practice passages
│   │   ├── courseData.ts   # 47 lessons structured across 3 tiers
│   │   └── passages.ts     # Curated passages for test modes
│   ├── hooks/              # Custom hooks (e.g. keyboard listeners, sound)
│   ├── lib/                # Pure business logic & utility modules
│   │   ├── achievements.ts # Achievement rules engine
│   │   ├── metrics.ts      # Net/Gross WPM, accuracy, mistake calculations
│   │   ├── recommendations.ts # Heuristic practice recommendation system
│   │   └── storage.ts      # IndexedDB repository layer
│   ├── pages/              # Application views
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── LevelPage.tsx
│   │   ├── LessonPage.tsx
│   │   ├── TestPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── AchievementsPage.tsx
│   │   ├── CertificatesPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── AdminPage.tsx
│   ├── test/               # Comprehensive Vitest test suite
│   ├── types/              # Domain TypeScript interfaces and types
│   ├── App.tsx             # Root layout and route configuration
│   ├── index.css           # Design tokens, variables & responsive styling
│   └── main.tsx            # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher recommended
- **npm** (or `pnpm` / `yarn`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Prasanna-1166/Typer-Test.git
   cd Typer-Test
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173` to start typing!

---

## 📜 Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Launches the Vite local dev server with Hot Module Replacement (HMR). |
| `npm run build` | Runs typecheck (`tsc -b`) and generates production bundles in `dist/`. |
| `npm run preview` | Locally previews the production build. |
| `npm run test` | Runs the full Vitest unit and integration test suite. |
| `npm run test:watch` | Runs Vitest in interactive watch mode. |
| `npm run test:ui` | Opens the Vitest graphical web test runner. |
| `npm run typecheck` | Validates TypeScript types across the entire project without emitting files. |
| `npm run lint` | Runs Oxlint for ultra-fast static code analysis. |

---

## 🧪 Testing & Quality Assurance

TypeMaster is built with robust test coverage across all business logic, metrics calculations, achievement conditions, and UI components:

```bash
# Run unit and integration tests
npm run test

# Run linter
npm run lint

# Validate TypeScript types
npm run typecheck
```

Unit test suites cover:
- **`metrics.test.ts`**: Strict Gross WPM, Net WPM, accuracy %, error tracking, and penalty calculations.
- **`courseData.test.ts`**: Curriculum integrity, module structures, and objective validations.
- **`achievements.test.ts`**: Condition evaluators for badges, streaks, and personal records.
- **`recommendations.test.ts`**: Heuristics for detecting weak keys and suggesting next steps.
- **`components.test.tsx`**: Accessibility and rendering sanity checks.

---

## 🔒 Privacy & Local Storage

Your privacy is paramount:
- **100% Client-Side**: No typing inputs or keystrokes are transmitted over the network.
- **IndexedDB**: All test history, custom lessons, progress, and settings reside directly in your browser's persistent storage.
- **Portability**: Export all your data into a JSON file whenever you want to transfer your stats to another browser or device.

---

## 🗺️ Roadmap & Future Enhancements

- [ ] Multiplayer real-time typing races via WebSockets / WebRTC.
- [ ] Custom mechanical keyboard sound profiles (Cherry MX Blue, Brown, Red, Topre).
- [ ] Code syntax typing modes for Python, Rust, Go, and C++.
- [ ] Custom themes (Dracula, Nord, Solarized, Cyberpunk).
- [ ] Multi-language keyboard layouts (AZERTY, QWERTZ, Dvorak, Colemak).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Crafted with ❤️ for typists, students, and developers everywhere.
</p>
