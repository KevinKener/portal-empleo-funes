// Narrow, focused column for the sign-up screens: no extra content that
// distracts from creating the account (GOV.UK "Create accounts" pattern).
export default function RegistroLayout({ children }: LayoutProps<"/registro">) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8 sm:py-12">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">{children}</div>
    </div>
  );
}
