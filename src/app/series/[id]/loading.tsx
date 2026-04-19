export default function SeriesLoading() {
  return (
    <div>
      <div className="relative h-[300px] bg-gradient-to-r from-muted to-muted/50 animate-pulse" />
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex gap-6">
          <div className="w-48 h-72 rounded-lg bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-4 pt-8">
            <div className="h-10 w-2/3 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-muted/70 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
            <div className="h-4 w-full rounded bg-muted/50 animate-pulse" />
            <div className="flex gap-3 pt-4">
              <div className="h-11 w-32 rounded-md bg-muted animate-pulse" />
              <div className="h-11 w-40 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        </div>
        <div className="mt-12 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
