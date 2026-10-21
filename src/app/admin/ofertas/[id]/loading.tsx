// Skeleton while the review page loads (same layout as page.tsx).
export default function RevisarOfertaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-28 esqueleto rounded-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-4">
          <div className="h-64 esqueleto rounded-3xl" />
          <div className="h-48 esqueleto rounded-2xl" />
        </div>
        <div className="h-96 esqueleto rounded-2xl" />
      </div>
    </div>
  );
}
