import { MarcoAuth } from "@/components/auth/MarcoAuth";

export default function RecuperarLayout({ children }: LayoutProps<"/recuperar">) {
  return <MarcoAuth>{children}</MarcoAuth>;
}
