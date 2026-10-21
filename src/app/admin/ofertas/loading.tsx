// Skeleton while the offers list loads (same layout as page.tsx).
export default function OfertasAdminLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-9 w-40 esqueleto rounded-lg" />
        <div className="h-5 w-80 max-w-full esqueleto rounded-lg" />
      </div>
      <div className="h-11 max-w-xl esqueleto rounded-xl" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-28 esqueleto rounded-full" />
        ))}
      </div>
      <div className="h-80 esqueleto rounded-2xl" />
    </div>
  );
}
