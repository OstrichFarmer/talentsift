import { useState, useRef } from 'react';
import QuestionCard from './components/QuestionCard';
import LoadingSkeletons from './components/LoadingSkeletons';
import ErrorMessage from './components/ErrorMessage';
import { fetchInterviewQuestions, type InterviewQuestion } from './utils/gemini';

type AppState = 'idle' | 'loading' | 'success' | 'error';

export default function App() {
  const [jobTitle, setJobTitle] = useState('');
  const [appState, setAppState] = useState<AppState>('idle');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationError, setValidationError] = useState('');

  // Keep a reference of the last submitted title to support direct retries
  const lastJobTitle = useRef('');

  const handleSubmit = async (titleOverride?: string) => {
    const title = (titleOverride ?? jobTitle).trim();

    // Basic client-side validation
    if (!title) {
      setValidationError('Please enter a job title before generating.');
      return;
    }

    // Heuristic guard: a plausible job title has at least 2 characters per word
    // and contains only letters, spaces, hyphens, slashes, and ampersands.
    // This stops clear non-titles (single letters, numbers, emoji strings) before
    // we spend an API call on them. The prompt-level guardrail in gemini.ts handles
    // anything more nuanced that slips through here.
    const looksLikeJobTitle = /^[a-zA-Z][a-zA-Z\s\-\/&.]{1,}$/.test(title);
    if (!looksLikeJobTitle) {
      setValidationError('Please enter a valid job title (letters only, e.g. "Product Manager").');
      return;
    }

    setValidationError('');
    lastJobTitle.current = title;
    setAppState('loading');
    setQuestions([]);
    setErrorMessage('');

    try {
      // Call our API utility to fetch questions from Gemini 2.5 Flash
      const results = await fetchInterviewQuestions(title);
      setQuestions(results);
      setAppState('success');
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';

      // If Gemini's prompt-level guardrail fired, the error is about the input
      // itself — show it inline under the field, not in the red error card.
      const isInputError =
        msg.toLowerCase().includes("doesn't look like a job title") ||
        msg.toLowerCase().includes('not a job title') ||
        msg.toLowerCase().includes('not a real job title');

      if (isInputError) {
        setAppState('idle');
        setValidationError(msg);
      } else {
        setErrorMessage(msg);
        setAppState('error');
      }
    }
  };

  const handleRetry = () => {
    handleSubmit(lastJobTitle.current);
  };

  const handleReset = () => {
    setJobTitle('');
    setQuestions([]);
    setAppState('idle');
    setErrorMessage('');
    setValidationError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-16 md:py-24">
        
        {/* Logo and Header */}
        <header className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            {/* Soft Purple SVG Logo */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-sm">
              <svg
                className="w-5.5 h-5.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 21l8.982-11.795m-10.196 9.079L7.75 9.75h11.963L17.31 20.264a2.25 2.25 0 01-3.166.553L9.813 15.904z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              TalentSift
            </h1>
          </div>
          <p className="text-slate-500 text-sm sm:text-base font-sans font-medium">
            AI-powered interview questions in seconds
          </p>
        </header>

        {/* Input Controller Card */}
        <div className="w-full max-w-xl bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm mb-6 text-left">
          <label
            htmlFor="job-title-input"
            className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
          >
            Enter Job Title
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="job-title-input"
              type="text"
              value={jobTitle}
              onChange={(e) => {
                setJobTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Customer Success Manager"
              disabled={appState === 'loading'}
              className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:bg-slate-50 disabled:cursor-not-allowed transition font-sans"
            />

            <button
              onClick={() => handleSubmit()}
              disabled={appState === 'loading'}
              className="w-full sm:w-auto px-6 py-3 bg-violet-600 hover:bg-violet-750 disabled:bg-violet-400 text-white text-sm font-semibold rounded-xl transition duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap active:scale-98 shadow-sm shadow-violet-600/10"
            >
              {appState === 'loading' ? 'Generating…' : 'Generate'}
            </button>
          </div>

          {validationError && (
            <p className="mt-2 text-rose-500 text-xs font-semibold animate-pulse">{validationError}</p>
          )}
        </div>

        {/* Results Container */}
        <div className="w-full max-w-xl flex flex-col gap-4">
          {appState === 'loading' && <LoadingSkeletons />}

          {appState === 'error' && (
            <ErrorMessage message={errorMessage} onRetry={handleRetry} />
          )}

          {appState === 'success' && (
            <div className="flex flex-col gap-4 animate-fade-in-up">
              {/* Question list mapped */}
              {questions.map((q, index) => (
                <QuestionCard key={index} question={q} index={index} />
              ))}

              {/* Reset Action */}
              <button
                onClick={handleReset}
                className="mt-2 w-full py-3.5 border border-dashed border-slate-200 hover:border-violet-300 text-slate-500 hover:text-violet-600 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer hover:bg-slate-50/50"
              >
                Try Another Role
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Clean Recruiter Footer */}
      <footer className="py-6 text-center border-t border-slate-100 bg-white">
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">
          Powered by Gemini 2.5 Flash • React 19 • Tailwind CSS v4
        </p>
      </footer>
    </div>
  );
}
