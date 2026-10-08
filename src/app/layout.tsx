import type { Metadata } from "next";
import { Be_Vietnam_Pro, Sora } from "next/font/google";
import "./globals.css";

// Same typefaces as funes.gob.ar: Sora for headings, Be Vietnam Pro for body text.
const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-be-vietnam-pro",
});

export const metadata: Metadata = {
  title: {
    default: "Portal de Empleo · Municipalidad de Funes",
    template: "%s · Portal de Empleo Funes",
  },
  description:
    "Ofertas de trabajo en Funes publicadas por la Oficina de Empleo de la Municipalidad.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${sora.variable} ${beVietnamPro.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
