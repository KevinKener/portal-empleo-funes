// Skeleton while the company home loads (same layout as page.tsx).
export default function EmpresaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-32 animate-pulse rounded-2xl bg-muted sm:h-36" />
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[4fr_3fr]">
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
