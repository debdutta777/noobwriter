export default function MangaLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 h-10 w-48 rounded-md bg-muted animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[2/3] rounded-lg bg-muted animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-muted/70 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
