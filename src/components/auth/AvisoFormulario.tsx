/** Error (role="alert") or confirmation (role="status") above or below a form. */
export function AvisoFormulario({ error, aviso }: { error: string | null; aviso?: string | null }) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive motion-safe:animate-in motion-safe:fade-in"
      >
        {error}
      </p>
    );
  }
  if (aviso) {
    return (
      <p role="status" className="rounded-lg bg-secondary px-4 py-3 text-sm text-secondary-foreground motion-safe:animate-in motion-safe:fade-in">
        {aviso}
      </p>
    );
  }
  return null;
}
