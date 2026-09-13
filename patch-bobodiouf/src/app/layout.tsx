import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Côte Ouest Digital | Novelas Avenue × Les Bobodiouf",
  description:
    "Déposez votre spot publicitaire pour les chaînes Novelas Avenue et Les Bobodiouf — espace annonceur sécurisé Côte Ouest Digital.",
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
