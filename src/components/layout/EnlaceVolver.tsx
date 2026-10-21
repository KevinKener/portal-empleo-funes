import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The way back from a sub-page, as a pill big enough to tap (44 px tall
 * area on phones) and the same everywhere, so "back" is always found in the
 * same place: above the title.
 */
export function EnlaceVolver({ href, texto, className }: { href: string; texto: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card pr-3.5 pl-2.5 text-sm font-medium text-primary shadow-sm transition-[border-color,background-color] hover:border-primary/40 hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        className,
      )}
    >
      <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
      {texto}
    </Link>
  );
}
