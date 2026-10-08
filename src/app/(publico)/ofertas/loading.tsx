// Skeleton shown while the listing loads from the database.
export default function OfertasLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:py-12" aria-busy="true" aria-label="Cargando ofertas">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
