// Skeleton shown while the listing loads from the database.
export default function OfertasLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8 py-8 sm:py-12" aria-busy="true" aria-label="Cargando ofertas">
      <div className="space-y-2">
        <div className="h-9 w-64 esqueleto rounded-md" />
        <div className="h-5 w-80 max-w-full esqueleto rounded-md" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-9 w-24 esqueleto rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-56 esqueleto rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
