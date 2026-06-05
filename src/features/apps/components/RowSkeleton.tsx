/**
 * App-list loading skeleton — shared so the OAuth landing and the Installed Apps
 * page show the exact same placeholder. Keeping them identical is what makes the
 * sign-in transition read as one continuous "loading" state instead of a flicker.
 */
export default function RowSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div key={i} className={i > 0 ? 'border-t border-white/10' : ''}>
          <div className="flex items-center gap-4 px-5 py-3">
            <div className="animate-pulse bg-white/10 rounded-lg w-12 h-12" />
            <div className="flex-1">
              <div className="animate-pulse bg-white/10 rounded h-5 w-[35%]" />
              <div className="animate-pulse bg-white/10 rounded h-3.5 w-[45%] mt-1" />
              <div className="animate-pulse bg-white/10 rounded h-3 w-[15%] mt-1" />
            </div>
            <div className="animate-pulse bg-white/10 rounded-lg w-[72px] h-8" />
            <div className="animate-pulse bg-white/10 rounded-full w-7 h-7" />
          </div>
        </div>
      ))}
    </div>
  );
}
