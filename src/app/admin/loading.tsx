// Skeleton while the Bandeja loads (same layout as page.tsx).
export default function AdminLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Cargando">
      <div className="h-32 esqueleto rounded-2xl sm:h-36" />
      <div className="space-y-4">
        <div className="h-7 w-40 esqueleto rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-40 esqueleto rounded-2xl" />
          <div className="h-40 esqueleto rounded-2xl" />
          <div className="h-40 esqueleto rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
