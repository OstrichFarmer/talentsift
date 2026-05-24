export default function LoadingSkeletons() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse"
        >
          <div className="flex items-start gap-4">
            {/* Number placeholder */}
            <div className="w-8 h-8 rounded-full bg-slate-200" />

            <div className="flex-1 flex flex-col gap-3">
              {/* Question text placeholder */}
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-5/6" />
              
              {/* Intent text placeholder */}
              <div className="h-3 bg-slate-100 rounded w-3/5 mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
