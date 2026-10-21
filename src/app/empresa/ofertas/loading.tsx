// Skeleton while the company's offers load (same layout as page.tsx).
export default function OfertasEmpresaLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="space-y-2">
        <div className="h-9 w-48 esqueleto rounded-md" />
        <div className="h-5 w-96 max-w-full esqueleto rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-36 esqueleto rounded-xl" />
        ))}
      </div>
    </div>
  );
}
