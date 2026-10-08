import Image from "next/image";

/** Public site footer on the brand's dark green. */
export function PiePagina() {
  return (
    <footer className="mt-auto bg-primary-deep text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <Image
          src="/marca/logo-blanco.png"
          alt="Gobierno de la Ciudad de Funes"
          width={185}
          height={52}
          className="h-10 w-auto"
        />
        <div className="space-y-1 text-sm text-primary-foreground/80 sm:text-right">
          <p className="font-medium text-primary-foreground">Oficina de Empleo · Municipalidad de Funes</p>
          <p>Desarrollado en el programa Funes Tech Lab.</p>
        </div>
      </div>
    </footer>
  );
}
