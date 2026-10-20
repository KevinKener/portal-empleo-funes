// Skeleton while the job seeker's panel loads (same layout as page.tsx).
export default function PostulanteLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-40 animate-pulse rounded-2xl bg-muted sm:h-44" />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        </div>
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    </div>
  );
}
