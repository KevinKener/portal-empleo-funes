import { MarcoAuth } from "@/components/auth/MarcoAuth";

export default function RegistroLayout({ children }: LayoutProps<"/registro">) {
  return <MarcoAuth>{children}</MarcoAuth>;
}
