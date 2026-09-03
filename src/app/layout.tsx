import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Publicité Novelas Avenue | Côte Ouest Audiovisuel",
  description:
    "Déposez vos créas publicitaires pour la chaîne Novelas Avenue — espace sécurisé Côte Ouest Audiovisuel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={frFR} afterSignOutUrl="/">
      <html lang="fr" className="antialiased">
        <body className="min-h-screen flex flex-col bg-white text-black">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
