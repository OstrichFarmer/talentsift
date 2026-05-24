import { useState } from 'react';
import type { InterviewQuestion } from '../utils/gemini';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(question.question);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-left relative flex items-start gap-3 sm:gap-4 animate-fade-in-up">
      {/* Question Number Badge */}
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-50 text-violet-600 text-sm font-semibold flex items-center justify-center mt-0.5">
        {index + 1}
      </span>

      {/* Question & Evaluation Intent Content */}
      <div className="flex-1 flex flex-col gap-2">
        <p className="text-slate-800 font-medium leading-relaxed text-sm sm:text-base pr-10 sm:pr-8">
          {question.question}
        </p>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pr-10 sm:pr-0">
          <span className="font-semibold text-slate-500">Evaluates: </span>
          {question.intent}
        </p>
      </div>

      {/* Inline Copy Button */}
      <button
        onClick={handleCopy}
        className={`absolute right-2 top-2 w-11 h-11 flex items-center justify-center rounded-xl border transition cursor-pointer active:scale-90 ${
          copied
            ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
            : 'border-slate-100 text-slate-400 md:hover:text-slate-600 md:hover:bg-slate-50'
        }`}
        title="Copy Question"
      >
        {copied ? (
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        )}
      </button>
    </div>
  );
}
