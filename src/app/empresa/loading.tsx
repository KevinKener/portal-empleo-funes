// Skeleton while the company home loads (same layout as page.tsx).
export default function EmpresaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-32 esqueleto rounded-2xl sm:h-36" />
      <div className="h-40 esqueleto rounded-2xl" />
      <div className="grid gap-4 lg:grid-cols-[4fr_3fr]">
        <div className="h-36 esqueleto rounded-2xl" />
        <div className="h-36 esqueleto rounded-2xl" />
      </div>
    </div>
  );
}
