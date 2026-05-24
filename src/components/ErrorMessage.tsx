interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-left animate-fade-in-up">
      <div className="flex items-start gap-4">
        {/* Warning Symbol */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
          !
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-rose-800 text-sm">
            Something went wrong
          </h3>
          <p className="text-rose-600 text-xs mt-1 leading-relaxed">
            {message}
          </p>
          <button
            onClick={onRetry}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
