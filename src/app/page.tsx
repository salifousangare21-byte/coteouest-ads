import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const stats = [
  { value: "1,1 M", label: "Spectateurs par mois" },
  { value: "37,8 M", label: "Vues depuis janvier 2026 (+96 % sur un an)" },
  { value: "70,7 %", label: "Audience africaine" },
  { value: "272,7 M", label: "Impressions générées" },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col flex-1">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 py-4 bg-white/95 backdrop-blur-md border-b border-black/[.08]">
        <span className="serif text-xl">Côte Ouest <em className="italic text-gold" style={{ color: "var(--gold)" }}>Ads</em></span>
        <div className="flex items-center gap-6">
          <Link href="/sign-in" className="text-sm hover:opacity-60 transition-opacity">
            Se connecter
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Créer mon compte
          </Link>
        </div>
      </nav>

      <section className="flex-1 flex items-center bg-black text-white px-8 md:px-16 pt-32 pb-20">
        <div className="max-w-3xl">
          <div className="eyebrow mb-6">Novelas Avenue · Espace Annonceurs</div>
          <h1 className="text-4xl md:text-6xl leading-tight mb-6">
            Diffusez votre publicité sur la chaîne{" "}
            <em className="italic" style={{ color: "var(--gold)" }}>Novelas Avenue</em>
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            Déposez vos créas publicitaires en quelques minutes, dans tous les formats
            requis. Notre équipe revient vers vous rapidement pour finaliser votre
            campagne.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/sign-up" className="btn-primary" style={{ background: "white", color: "black", borderColor: "white" }}>
              Créer mon compte annonceur
            </Link>
            <Link href="/sign-in" className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--light-gray)] px-8 md:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((s) => (
            <div key={s.label} className="text-center border-l border-black/10 first:border-l-0 px-4">
              <div className="serif text-3xl md:text-4xl mb-2">{s.value}</div>
              <div className="text-xs text-black/55 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-[11px] text-black/35 mt-8">
          Source : YouTube Analytics — chaîne Novelas Avenue
        </p>
      </section>

      <section className="px-8 md:px-16 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow">Comment ça marche</span>
          <h2 className="text-3xl md:text-4xl mt-4 mb-14">Trois étapes, avant contact avec notre équipe.</h2>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            {[
              { n: "01", t: "Créez votre compte", d: "Inscription sécurisée, en quelques secondes." },
              { n: "02", t: "Déposez vos créas", d: "Vidéos et visuels, dans les formats requis pour vos spots." },
              { n: "03", t: "Notre équipe vous recontacte", d: "Formule, planning et tarif finalisés avec vous par téléphone ou email." },
            ].map((step) => (
              <div key={step.n}>
                <div className="serif text-xl mb-3" style={{ color: "var(--gold)" }}>{step.n}</div>
                <h3 className="text-lg mb-2 serif">{step.t}</h3>
                <p className="text-sm text-black/55">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-8 md:px-16 py-8 bg-black text-white/50 text-xs flex justify-between items-center">
        <span>© 2026 Côte Ouest Audiovisuel</span>
        <span>Novelas Avenue Advertising</span>
      </footer>
    </div>
  );
}
