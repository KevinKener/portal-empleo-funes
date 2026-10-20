// Skeleton while the company home loads (same layout as page.tsx).
export default function EmpresaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
        <div className="h-5 w-96 max-w-full animate-pulse rounded-md bg-muted" />
      </div>
      <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[4fr_3fr]">
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
        <div className="h-36 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
