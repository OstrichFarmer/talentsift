# TalentSift — AI-Powered Recruitment Interview Platform

TalentSift is a highly responsive, professional web application designed to generate high-signal, competency-based interview questions for any job role in seconds. By coupling Google's **Gemini 2.5 Flash** with an optimized, accessible React frontend, TalentSift provides hiring managers and recruiters with immediate, actionable questions tailored to specific role competencies.

---

## 🚀 Key Features & Premium UX Details

* **Smart Copy-to-Clipboard Flow:** Each interview question is rendered in a clean card equipped with a dedicated **Copy** trigger. Built specifically for recruiter workflows, it allows hiring managers to immediately copy high-signal questions into prep sheets, documents, or applicant tracking systems.
* **Stable Action Feedback:** When copied, the button undergoes a seamless transition to a green checkmark icon. This keeps dimensions stable, preventing visual layout shifts or text overlaps on mobile screens.
* **Fully Responsive Mobile Interface:** 
  * Stacked layouts (`flex-col sm:flex-row`) ensure comfortable reading and maximum input width on narrow viewports.
  * Employs tight vertical safe-margins to raise the content above-the-fold.
* **iOS Viewport Zoom Mitigation:** The job title input employs a `text-base` (16px) font on mobile viewports. This blocks iOS browsers (Safari/Chrome on iPhone) from triggering automatic viewport zoom when focusing the field, ensuring a premium native app feel.
* **Sleek Visual Feedback:** Utilizes custom-tailored skeleton cards, animated loading states, and fade-in transitions (`animate-fade-in-up`) for a modern, fluid interactive experience.

---

## 🛠️ Deep-Dive Technical Highlights (For Loom Walkthrough)

When walking through the codebase, these deliberate engineering choices highlight production-grade architecture:

### 1. Direct Structured JSON Generation
* **Implementation:** `src/utils/gemini.ts`
* **Details:** We configure the Gemini call with `responseMimeType: 'application/json'` in the generation config. This forces the model to return structured, parseable JSON directly. 
* **Benefit:** It eliminates brittle, regex-based markdown wrapper stripping (handling missing triple backticks) and completely prevents JSON syntax parsing failures.

### 2. Dual-Layer Input Validation (Guardrails)
To save API costs, prevent LLM hallucinations, and ensure high-signal inputs, we built a layered validation strategy:
* **Client-Side Regex Guard:** Matches incoming inputs against `/^[a-zA-Z][a-zA-Z\s\-\/&.]{1,}$/` inside `App.tsx` first. Obvious garbage, emojis, numbers, or single letters are intercepted immediately on the device without wasting API query limits.
* **Prompt-Level LLM Guardrail:** If an input slips through the regex but is still gibberish or a non-professional role (e.g. a color, country, or random word), the Gemini model's system prompt instructs it to return a typed error payload:
  `{ "error": "That doesn't look like a job title..." }`
* **Unified UI Response:** If Gemini throws this API guardrail error, the React frontend catches it and displays it inline under the text field rather than crashing or showing a global error card.

### 3. Accessibility & Touch Boundaries
* **Standard Compliant:** All interactive buttons, including the copy triggers, are structured with a minimum dimension of `w-11 h-11` (44px x 44px). This matches WCAG standards for touch targets, ensuring comfortable usability on mobile devices.
* **Stuck Hover Safe:** Hover animations are scoped strictly to `md:hover:` to avoid sticky highlights on mobile touch screens.

---

## 💻 Tech Stack
* **Framework:** React 19 (TypeScript)
* **Build Tooling:** Vite
* **Styling:** Tailwind CSS v4 + Plus Jakarta Sans & Outfit Display typography
* **Core Engine:** Gemini API (`gemini-2.5-flash`)

---

## 🔧 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/OstrichFarmer/talentsift.git
   cd talentsift
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a local, untracked `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and insert your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).)*

4. **Launch Local Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```
