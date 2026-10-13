"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Shown when the profile cannot be read (e.g. the database is unreachable).
export default function PostulanteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
      <TriangleAlert aria-hidden className="size-10 text-destructive" />
      <h1 className="font-heading text-2xl font-semibold">No pudimos cargar tu perfil</h1>
      <p className="text-muted-foreground">Puede ser un problema momentáneo. Probá de nuevo en unos segundos.</p>
      <Button size="lg" className="h-10 px-5" onClick={() => retry()}>
        Reintentar
      </Button>
    </div>
  );
}
