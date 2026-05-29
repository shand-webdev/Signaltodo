# Signal ⚡

Signal is an AI-powered daily clarity tool inspired by the concept of **"Signal vs Noise"**. It is a machine designed for one specific focus: helping you cut through the morning mental clutter to immediately understand what truly matters today.

Unlike traditional task managers, Signal requires **no manual organization, calendars, or productivity dashboards**. You simply open the app, dump everything on your mind into a single input box, and let our opinionated AI strategic prioritizer separate the true *signal* from the surrounding *noise*.

---

## ⚡ Product Philosophy

1. **Dump → Clarity:** A single text input, a single processing button, and a clear, focused output. No sidebars, history trails, or analytics.
2. **Zero Manual Sorting:** The user should never organize or drag tasks manually.
3. **Opinionated AI Reasoning:** Signal acts as an elite chief-of-staff. It doesn't just categorize; it details the strategic "Why" behind today's prioritizations, calling out distractions for what they are.
4. **Strict Privacy & Persistence:** Built with zero server databases. Everything is persisted locally and securely in the browser's `localStorage`.
5. **Aesthetic Minimalism:** A sleek, high-fidelity dark interface (#080C18) with a gold accent (#F59E0B) and subtle glassmorphism cards.

---

## 🛠️ Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4.0 (Custom Theme, Dark Glows, Responsive CSS Transitions)
- **AI Completion:** Direct serverless fetch to Groq Cloud API (`llama-3.3-70b-versatile`)
- **State Management:** Native React state synchronized with browser `localStorage`

---

## ⚙️ Environment Configuration

Signal supports Groq API out of the box:
- **Groq:** Uses Groq's high-speed `llama-3.3-70b-versatile` to prioritize tasks with extreme velocity.

### Setup Environment

1. Duplicate `.env.example` to create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` and add your keys:
   ```env
   GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 🚀 Local Development

Follow these steps to run the application on your computer:

### 1. Install Dependencies
Make sure you have Node.js 18+ installed. Run:
```bash
npm install
```

### 2. Run the Development Server
Launch Next.js in development mode:
```bash
npm run dev
```

### 3. Open the Application
Navigate to [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ☁️ Vercel Deployment

Signal is fully optimized for one-click deployment to Vercel:

### Option A: Vercel CLI (Quickest)
1. Install the Vercel CLI globally if you haven't:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command from the project root:
   ```bash
   vercel
   ```
3. Follow the interactive prompts. When prompted for environment variables, add `GROQ_API_KEY`.
4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: GitHub Integration (Recommended)
1. Push your project code to a private GitHub repository.
2. Log into the [Vercel Dashboard](https://vercel.com).
3. Click **Add New** > **Project** and select your GitHub repository.
4. Expand **Environment Variables** and add:
   - `GROQ_API_KEY`
5. Click **Deploy**. Vercel will automatically build and deploy your app.

---

## 🔍 Codebase Architecture

```
/
├── app/
│   ├── layout.tsx         # Global layout (Geist font configuration, SEO tags, dark-only base)
│   ├── page.tsx           # Main page (coordinates state, localStorage restore, error handling)
│   ├── globals.css        # Custom theme values, radial gradients, and scrollbars
│   └── api/
│       └── analyze/
│           └── route.ts   # Core completions server route supporting Groq API
├── components/
│   ├── Header.tsx         # Minimalist Nothing-inspired logo & tagline
│   ├── BrainDumpInput.tsx # Translucent glass textarea, keyboard shortcuts, test loader
│   ├── ResultsDisplay.tsx # Signal cards with strategic "Why Today?", Noise items, refocus actions
│   └── LoadingState.tsx   # Typography glow loader "Separating signal from noise..."
├── types/
│   └── index.ts           # Typesafe SignalResponse and TaskItem models
├── public/                # Static assets (favicons, icons)
├── tsconfig.json          # Strict TypeScript configurations
└── package.json           # Defined scripts and core packages
```

---

## ⚡ Success Criteria & Testing
To verify the premium experience, dump a chaotic stream-of-consciousness list into the input box:
> *"Need to finish Cheeko onboarding, call mom, buy groceries, workout, send portfolio, watch startup videos, redesign homepage."*

**Expected Result:**
1. **Today's Direction:** A singular theme (e.g., *"Today is a shipping day. Close tabs and write code."*).
2. **Focus Today (Signal):** Exactly 3 high-impact cards with deeply human, strategic reasoning.
3. **Noise:** All secondary tasks (e.g., *"buy groceries"*, *"watch startup videos"*) collapsed into a dimmed list, explaining why they can wait or represent distractions today.
4. **Resiliency:** Reload the page. Your clarity dashboard must instantly restore from `localStorage` without re-running the AI call.
