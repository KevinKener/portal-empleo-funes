// Skeleton while the profile loads (same layout as page.tsx).
export default function PostulanteAdminLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-32 esqueleto rounded-full" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-4">
          <div className="h-72 esqueleto rounded-2xl" />
          <div className="h-56 esqueleto rounded-2xl" />
        </div>
        <div className="h-64 esqueleto rounded-2xl" />
      </div>
    </div>
  );
}
