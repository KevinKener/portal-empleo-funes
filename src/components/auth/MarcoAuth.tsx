import type { ReactNode } from "react";

// Narrow, focused card for the account screens: no extra content that
// distracts from the task (GOV.UK "Create accounts" pattern).
export function MarcoAuth({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">{children}</div>
    </div>
  );
}
