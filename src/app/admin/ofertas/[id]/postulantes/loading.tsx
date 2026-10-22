// Skeleton while the applicants load (same layout as page.tsx).
export default function PostulantesOfertaLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando">
      <div className="space-y-3">
        <div className="h-8 w-28 esqueleto rounded-full" />
        <div className="h-9 w-56 esqueleto rounded-lg" />
        <div className="h-5 w-80 max-w-full esqueleto rounded" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          <div className="h-11 max-w-xl esqueleto rounded-xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-10 w-28 esqueleto rounded-full" />
            ))}
          </div>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 esqueleto rounded-2xl lg:h-16" />
          ))}
        </div>
        <div className="hidden h-64 esqueleto rounded-2xl lg:block" />
      </div>
    </div>
  );
}
