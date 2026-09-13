"use client";

import { useState } from "react";

type SpotFile = { file: File; status: "idle" | "uploading" | "done" | "error"; key?: string };

const FORMULES = [
  "Novelas Avenue",
  "Les Bobodiouf",
  "Pack Duo (les deux chaînes)",
  "Max — plusieurs épisodes (sur devis)",
];

export default function UploadForm() {
  const [nomComplet, setNomComplet] = useState("");
  const [entreprise, setEntreprise] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [formule, setFormule] = useState("");
  const [message, setMessage] = useState("");
  const [spot, setSpot] = useState<SpotFile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(file: File | null) {
    if (!file) return;
    setSpot({ file, status: "idle" });
  }

  async function uploadSpot(entry: SpotFile) {
    setSpot({ ...entry, status: "uploading" });

    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: entry.file.name,
        fileType: entry.file.type || "video/mp4",
      }),
    });
    if (!res.ok) throw new Error("Impossible de préparer l'envoi de " + entry.file.name);
    const { uploadUrl, key } = await res.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": entry.file.type || "video/mp4" },
      body: entry.file,
    });
    if (!putRes.ok) throw new Error("Échec de l'envoi de " + entry.file.name);

    setSpot({ ...entry, status: "done", key });
    return { key, fileName: entry.file.name };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!spot) {
      setError("Ajoutez votre spot vidéo avant d'envoyer.");
      return;
    }
    if (!nomComplet || !entreprise || !email || !telephone || !formule) {
      setError("Tous les champs marqués d'un * sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = await uploadSpot(spot);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomComplet,
          entreprise,
          email,
          telephone,
          formule,
          message,
          file: uploaded,
        }),
      });
      if (!res.ok) throw new Error("Échec de l'envoi final. Réessayez.");

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <div className="eyebrow mb-4">C&apos;est envoyé</div>
        <h1 className="text-3xl mb-4">Merci, {entreprise} !</h1>
        <p className="text-black/60">
          Votre spot a bien été reçu. Notre équipe commerciale vous recontacte
          rapidement par téléphone ou par email pour finaliser votre campagne
          ({formule}).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="eyebrow mb-3">Espace annonceur</div>
      <h1 className="text-3xl md:text-4xl mb-2">Déposez votre spot publicitaire</h1>
      <p className="text-black/55 mb-10">
        Renseignez vos coordonnées, choisissez votre chaîne, et ajoutez votre vidéo de 15 secondes.
      </p>

      <form onSubmit={handleSubmit} className="card p-8 md:p-10 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label>Nom complet *</label>
            <input value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} placeholder="Marie Dupont" />
          </div>
          <div className="space-y-2">
            <label>Nom d&apos;entreprise *</label>
            <input value={entreprise} onChange={(e) => setEntreprise(e.target.value)} placeholder="Ma Marque SARL" />
          </div>
          <div className="space-y-2">
            <label>Email professionnel *</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marie@mamarque.com" />
          </div>
          <div className="space-y-2">
            <label>Téléphone *</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 00 00 00 00" />
          </div>
        </div>

        <div className="space-y-2">
          <label>Chaîne / formule souhaitée *</label>
          <select value={formule} onChange={(e) => setFormule(e.target.value)}>
            <option value="" disabled>Sélectionnez une formule</option>
            {FORMULES.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label>Message (facultatif)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Dates souhaitées, contexte de la campagne..."
          />
        </div>

        <div>
          <label className="block mb-4">Votre spot vidéo (15 secondes) *</label>
          <label className="border border-dashed border-black/20 p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-[var(--gold)] transition-colors text-center">
            <span className="text-sm font-medium">Cliquez pour ajouter votre vidéo</span>
            <span className="text-xs text-black/45">Format MP4 recommandé</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            {spot && (
              <span
                className="text-xs mt-2 truncate max-w-full"
                style={{
                  color:
                    spot.status === "error" ? "#b91c1c" : spot.status === "done" ? "#15803d" : "var(--gold)",
                }}
              >
                {spot.status === "uploading" && "Envoi en cours…"}
                {spot.status === "done" && "✓ "}
                {spot.status === "idle" && "Prêt — "}
                {spot.file.name}
              </span>
            )}
          </label>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-50">
          {submitting ? "Envoi en cours…" : "Envoyer mon spot"}
        </button>
      </form>
    </div>
  );
}
