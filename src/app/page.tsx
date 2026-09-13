import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import Reveal from "@/components/Reveal";
import AnimatedStat from "@/components/AnimatedStat";

const stats = [
  { target: 1.7, decimals: 1, suffix: " M", label: "Abonnés cumulés, deux chaînes" },
  { target: 61.2, decimals: 1, suffix: " M", label: "Vues en Afrique depuis janvier 2026" },
  { target: 592.8, decimals: 1, suffix: " M", label: "Impressions générées" },
  { target: 333, decimals: 0, suffix: " K", label: "Vues générées par jour" },
];

const channels = [
  {
    name: "Novelas Avenue",
    tag: "Telenovelas",
    color: "#ec4899",
    stats: ["44,9 M vues en 2026 (+85 % sur un an)", "904 778 abonnés", "3,46 M vues en Côte d'Ivoire"],
    audience: "73,4 % de femmes, 40 % de 25-34 ans. Audience francophone mondiale : Haïti, France, Sénégal, Côte d'Ivoire, Togo.",
    posters: ["/posters/novelas-rubi.jpg", "/posters/novelas-marimar.jpg", "/posters/novelas-barbarita.jpg"],
  },
  {
    name: "Les Bobodiouf",
    tag: "Comédie africaine",
    color: "#0ea5e9",
    stats: ["39,0 M vues en 2026", "804 481 abonnés", "9,46 M vues en Côte d'Ivoire"],
    audience: "63,3 % d'hommes, 42,6 % de 25-34 ans. Audience ancrée en Côte d'Ivoire, Burkina Faso, France, Sénégal.",
    posters: ["/posters/bobodiouf-allopolice.jpg", "/posters/bobodiouf-leretour.jpg", "/posters/bobodiouf-ausecours.jpg"],
  },
];

const offers = [
  {
    name: "Novelas Avenue",
    price: "2 500 F / jour",
    total: "75 000 F HT pour 30 jours",
    detail: "240 000 à 255 000 vues, toutes zones — 18 500 à 19 500 vues en Côte d'Ivoire",
    highlight: false,
  },
  {
    name: "Pack Duo — les deux chaînes",
    price: "3 500 F / jour",
    total: "105 000 F HT au total (au lieu de 135 000 F séparément, -22 %)",
    detail: "280 000 à 315 000 vues, toutes zones — 245 000 à 275 000 personnes touchées",
    highlight: true,
  },
  {
    name: "Les Bobodiouf",
    price: "2 000 F / jour",
    total: "60 000 F HT pour 30 jours",
    detail: "40 000 à 60 000 vues, toutes zones — 10 000 à 14 500 vues en Côte d'Ivoire",
    highlight: false,
  },
];

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="flex flex-col flex-1">
      <SiteNav />

      {/* HERO */}
      <section className="relative flex-1 flex items-end bg-black text-white px-8 md:px-16 pt-32 pb-16 overflow-hidden min-h-[92vh]">
        <div className="absolute inset-0">
          <Image
            src="/hero-collage.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-40"
            style={{ animation: "heroZoom 26s ease-in-out infinite alternate" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(17,17,17,0.55) 0%, rgba(17,17,17,0.35) 40%, #111111 100%)",
            }}
          />
        </div>
        <div className="crop-mark cm-tl" />
        <div className="crop-mark cm-br" />

        <div className="relative max-w-3xl">
          <Reveal>
            <div className="eyebrow mb-6">
              <span className="eyebrow-dot" />
              Novelas Avenue × Les Bobodiouf
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl leading-tight mb-6">
              Votre spot, diffusé pendant{" "}
              <em className="italic" style={{ color: "var(--gold)" }}>30 jours</em>, sur deux chaînes qui cartonnent
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-white/70 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
              Deux chaînes YouTube, une communauté, un marché prioritaire : la Côte d&apos;Ivoire. Déposez votre spot de 15 secondes, notre équipe finalise le reste avec vous.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-wrap gap-4">
              <Link href="/sign-up" className="btn-primary" style={{ background: "white", color: "black", borderColor: "white" }}>
                Créer mon compte annonceur
              </Link>
              <Link href="/sign-in" className="btn-outline" style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
                J&apos;ai déjà un compte
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[var(--light-gray)] px-8 md:px-16 py-16">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center border-l border-black/10 first:border-l-0 px-4">
                <AnimatedStat target={s.target} decimals={s.decimals} suffix={s.suffix} />
                <div className="text-xs text-black/55 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <p className="text-center text-[11px] text-black/35 mt-8">
          Source : YouTube Analytics — Novelas Avenue et Les Bobodiouf, 1er janv. – 8 sept. 2026
        </p>
      </section>

      {/* NOS CHAINES */}
      <section className="px-8 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <span className="eyebrow">Nos chaînes</span>
            <h2 className="text-3xl md:text-4xl mt-4 mb-3">Deux audiences distinctes.</h2>
            <p className="text-black/55 mb-14 max-w-xl">Choisissez celle qui parle à votre cible — ou les deux, avec le Pack Duo.</p>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-10">
            {channels.map((c, i) => (
              <Reveal key={c.name} delay={i * 120}>
                <div className="channel-card border border-black/10">
                  <div className="px-6 py-4" style={{ background: c.color }}>
                    <span className="text-white font-medium">{c.name}</span>
                    <span className="text-white/70 text-xs ml-2">{c.tag}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-black/5">
                    {c.posters.map((p) => (
                      <div key={p} className="poster-zoom relative aspect-[2/3] bg-black/5">
                        <Image src={p} alt={c.name} fill sizes="(max-width: 768px) 33vw, 200px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                  <div className="p-6">
                    <ul className="text-sm space-y-1 mb-4">
                      {c.stats.map((s) => (
                        <li key={s} className="text-black/70">{s}</li>
                      ))}
                    </ul>
                    <p className="text-xs text-black/50 leading-relaxed">{c.audience}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* OFFRE & TARIFS */}
      <section className="bg-black text-white px-8 md:px-16 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <span className="eyebrow">Notre offre</span>
            <h2 className="text-3xl md:text-4xl mt-4 mb-3">Votre spot de 15 secondes, pendant 30 jours.</h2>
            <p className="text-white/55 mb-14 max-w-xl">
              Inséré dans un épisode inédit qui reste en ligne — contrairement à un spot télé, votre exposition ne s&apos;arrête pas après un jour.
            </p>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {offers.map((o, i) => (
              <Reveal key={o.name} delay={i * 100}>
                <div
                  className="offer-card p-8 flex flex-col h-full"
                  style={{ background: o.highlight ? "rgba(203,184,156,0.08)" : "#111111" }}
                >
                  {o.highlight && <span className="eyebrow mb-3">Le plus avantageux</span>}
                  <h3 className="serif text-xl mb-4">{o.name}</h3>
                  <div className="text-3xl serif mb-1" style={{ color: "var(--gold)" }}>{o.price}</div>
                  <div className="text-xs text-white/45 mb-6">{o.total}</div>
                  <p className="text-sm text-white/65 mt-auto">{o.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <p className="text-xs text-white/40 mt-8 max-w-2xl">
              MAX — sur devis : plusieurs épisodes, sur une ou les deux chaînes, durée à définir selon vos besoins. Tarif dégressif au-delà de 2 épisodes. Tous tarifs HT.
            </p>
          </Reveal>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section className="px-8 md:px-16 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Reveal>
            <span className="eyebrow">Comment ça marche</span>
            <h2 className="text-3xl md:text-4xl mt-4 mb-14">Trois étapes, avant contact avec notre équipe.</h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-10 text-left">
            {[
              { n: "01", t: "Créez votre compte", d: "Inscription sécurisée, en quelques secondes." },
              { n: "02", t: "Déposez votre spot", d: "Votre vidéo de 15 secondes, et la chaîne souhaitée." },
              { n: "03", t: "Notre équipe vous recontacte", d: "Formule, planning et tarif finalisés avec vous par téléphone ou email." },
            ].map((step, i) => (
              <Reveal key={step.n} delay={i * 120}>
                <div className="serif text-xl mb-3" style={{ color: "var(--gold)" }}>{step.n}</div>
                <h3 className="text-lg mb-2 serif">{step.t}</h3>
                <p className="text-sm text-black/55">{step.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-8 md:px-16 py-8 bg-black text-white/50 text-xs flex justify-between items-center">
        <span>© 2026 Côte Ouest Digital</span>
        <span>Novelas Avenue × Les Bobodiouf</span>
      </footer>
    </div>
  );
}
