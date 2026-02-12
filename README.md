# Forge

> **Turn messy startup ideas into launch-ready MVPs — guided by AI.**

Forge is a structured idea-to-MVP platform that helps solo founders, side hustlers, and early-stage teams move from vague concept → validated plan → focused MVP → pitch deck — all in one seamless flow.

It is not a brainstorming tool. It is a **decision engine**.

![Forge Hero](https://via.placeholder.com/1200x600.png?text=Forge+Hero+Section)  
*(Replace with actual screenshot once deployed)*

---

## 🎯 Vision

Most startup ideas don't fail because they're bad.  
They fail because they're never clarified.

Forge exists to bring structure to early-stage thinking. It guides founders through a clear path:

1. **Clarify the problem**  
2. **Evaluate viability**  
3. **Define a focused MVP**  
4. **Generate a pitch-ready narrative**  

**The goal is clarity, not content volume.**  
**The outcome is decisions, not inspiration.**

---

## ✨ Core Features

### 🧪 The Lab (Idea Validation)
The entry point for every project. Describe your raw idea and receive:
- **The Honest Verdict**: Ruthless logic check identifying market fit and viability
- **The Devil's Advocate**: Analysis of potential pitfalls and market risks
- **Unique Value Proposition (UVP)**: Crystal-clear differentiation from competitors
- **Competitor & Moat Analysis**: Real competitive landscape assessment
- **"Should You Build It?" Decision**: Clear go/refine/reconsider verdict

### 📐 The Blueprint (MVP Planning)
Once validated, Forge builds your foundation:
- **Core User Definition**: Who exactly is this for?
- **Core Action**: What's the one critical thing users do?
- **MVP Feature List**: 5–7 must-have features (and explicit "Not in MVP" list)
- **Tailored Tech Stack**: Expert recommendations based on your specific idea
- **Success Metrics**: How you'll know if it's working

### 🎤 The Pitch Room (Presentation)
Generate professional outputs instantly:
- **AI-Generated Pitch Decks**: Structured slides (Problem, Solution, Market, Business Model, MVP, Roadmap)
- **Audience Toggling**: Tailored versions for investors, customers, technical co-founders
- **Export Options**: PowerPoint (.pptx) and PDF formats
- **Promotional Copy**: Ready-to-use social posts, landing page text, email blurbs

### 🛡️ The War Room (Execution Tracking)
Keep momentum after planning:
- **Build Progress Tracker**: Simple checklist + notes for building stages
- **Build Log**: Track daily progress against your MVP roadmap
- **Launch Copy Generator**: "Build in Public" content for LinkedIn and X/Twitter

---

## 🧠 Core Philosophy

Forge is built on four principles:

### 1. Structured, Not Open-Ended
Ideas are messy. Progress shouldn't be.  
Forge guides users through a defined sequence.

### 2. Opinionated, Not Passive
Forge evaluates ideas and provides clear feedback — even when the answer is uncomfortable.

### 3. Decisions Over Content
More text does not equal more clarity.  
Forge helps users decide what to build and what to ignore.

### 4. Action Over Inspiration
Users leave with:
- A focused MVP plan
- A clear problem statement
- A structured pitch deck
- Concrete next steps

---

## 👥 Target Users

**Designed for:**
- First-time founders
- Solo builders & indie hackers
- Students with startup ideas
- Non-technical entrepreneurs
- Side hustlers validating concepts

**Not intended for (v1):**
- Large enterprise teams
- Late-stage funded startups
- Complex multi-product organizations

---

## 🛠 Tech Stack

| Layer          | Technology                    | Why?                                        |
|----------------|-------------------------------|---------------------------------------------|
| **Frontend**   | React / Next.js               | Modern SPA with SSR capabilities            |
| **UI Framework** | React  | Fast dev, great for learning & routing      |
| **Styling**    | Tailwind CSS                  | Rapid, responsive, consistent design system |
| **State**      | React Context / Zustand       | Simple global state without boilerplate     |
| **Backend**    | Node.js + Appwrite            | PostgreSQL + Auth + Edge Functions          |
| **Auth**       | Appwrite Auth / Clerk         | Secure authentication out of the box        |
| **AI Engine**  | Gemini Api Key          | Powerful natural language processing        |
| **Search**     | Gemini Google Search / Tavily API       | Real-time competitor and market data        |
| **PDF Export** | jsPDF                         | Client-side pitch deck downloads            |
| **PPTX Export** | PptxGenJS                    | PowerPoint generation                       |
| **Persistence** | PostgreSQL (Supabase)        | Robust data storage and real-time updates   |
| **Deployment** | Vercel                        | Free tier, instant previews, auto-deploys   |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- An Apprite project 


### Installation

```bash
# 1. Clone the repository
git clone https://github.com/adesinaisaiah100/forge.git
cd forge

# 2. Install dependencies
npm install
# or
yarn install

# 3. Set up environment variables
cp .env.example .env.local

# Edit .env.local and add:
#apprite
#vercel ai sdk
#gemini api key

# 4. Start the development server
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) — you're live!

### Useful Commands

```bash
npm run build       # Production build
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm run format      # Prettier code formatting
npm test            # Run tests
```

---

## 📂 Project Structure

```
forge/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Navbar, Sidebar, Footer
│   │   └── ui/             # Buttons, Cards, Modals
│   ├── features/           # Feature-specific modules
│   │   ├── brainstorm/     # The Lab - validation logic
│   │   ├── blueprint/      # MVP planning & tech stack
│   │   ├── pitch/          # Pitch deck generation
│   │   └── tracker/        # Build logs & progress tracking
│   ├── pages/              # Route-based pages
│   ├── services/           # API wrappers (Vercel Ai SDk, Appwrite)
│   ├── contexts/           # State management
│   ├── utils/              # Helper functions
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .env.local              # Your local environment variables
├── vite.config.js
├── tailwind.config.js
├── package.json
└── README.md               # You are here
```

---

## 🎨 Design System

### Brand Tone
- **Calm** — No hype, just clarity
- **Clear** — Direct communication
- **Structured** — Organized thinking
- **Confident** — Opinionated guidance
- **Non-hype** — Substance over flash

### Core Colors
```
Primary Blue:    #2563EB
Secondary Green: #10B981
Background:      #F8FAFC
Headings:        #0F172A
Body Text:       #334155
```

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400 / 500 / 600 / 700

---

## 📊 Success Metrics (MVP)

We consider v1 successful if:

- ✅ Users complete the full flow (Idea → Pitch Deck)
- ✅ Users export pitch decks
- ✅ Users return to refine ideas
- ✅ Feedback indicates clarity improvement

**Primary Metric:**  
> Completion rate from Idea Intake → Pitch Deck Export

---

## 🗺 Roadmap

### ✅ Phase 1: Core Foundation
- [x] Landing page design
- [x] Project structure setup
- [ ] Supabase integration
- [ ] Authentication flow

### 🔄 Phase 2: The Lab (Current)
- [ ] Idea intake form
- [ ] AI evaluation logic
- [ ] Verdict generation
- [ ] Competitor analysis

### 📋 Phase 3: The Blueprint
- [ ] MVP feature scoping
- [ ] Tech stack recommendations
- [ ] "Not in MVP" list generator
- [ ] Success metrics definition

### 🎯 Phase 4: The Pitch Room
- [ ] Pitch deck structure
- [ ] Audience-specific variants
- [ ] PowerPoint export
- [ ] PDF export
- [ ] Promotional copy generator

### 🚀 Phase 5: The War Room
- [ ] Build progress tracker
- [ ] Daily build logs
- [ ] Social media content generator
- [ ] Launch checklist

### 🔮 Future Enhancements
- [ ] Real-time competitor data (SimilarWeb, Crunchbase APIs)
- [ ] Collaboration features (share sessions with co-founders)
- [ ] PWA support (offline mode, installable)
- [ ] Dark mode toggle
- [ ] Analytics dashboard
- [ ] Mobile native app
- [ ] Integration with project management tools

---

## 🔥 What Forge Is NOT

- ❌ Not a generic AI chat wrapper
- ❌ Not a template marketplace
- ❌ Not a pitch deck theme generator
- ❌ Not a brainstorming toy
- ❌ Not for late-stage startups

**Forge is a structured thinking system for early-stage founders.**

---

## 🤝 Contributing

This is currently a personal learning project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please open an issue first for major changes to discuss what you'd like to modify.

### Contribution Guidelines
- Follow the existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📄 License

MIT License — feel free to use, modify, and learn from it.

See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built as a React practice project that solves real founder problems.

**Guiding Question:**  
> If a founder asks: "What should I build, and is it worth it?"  
> Forge should provide a clear, structured answer.

---

## 📞 Contact & Support

- **Developer**: Adesina
- **Location**: Ibadan, Nigeria
- **Year**: 2026

For questions, feedback, or feature requests, please open an issue on GitHub.

---

**Happy forging!** 🚀  

If Forge helps you ship faster, consider starring ⭐ the repo to support the project.

---

*Built for founders who want clarity.*