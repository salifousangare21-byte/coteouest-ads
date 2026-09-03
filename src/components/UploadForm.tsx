"use client";

import { useState } from "react";

type FormatSlot = {
  key: "16-9" | "9-16" | "1-1" | "banniere";
  label: string;
  hint: string;
  accept: string;
};

const FORMAT_SLOTS: FormatSlot[] = [
  { key: "16-9", label: "Format 16:9", hint: "Spot pré-roll / paysage", accept: "video/*" },
  { key: "9-16", label: "Format 9:16", hint: "Stories / Shorts", accept: "video/*" },
  { key: "1-1", label: "Format carré 1:1", hint: "Vidéo ou visuel carré", accept: "video/*,image/*" },
  { key: "banniere", label: "Bannière / visuel statique", hint: "Image (JPG, PNG)", accept: "image/*" },
];

type SlotFile = { file: File; status: "idle" | "uploading" | "done" | "error"; key?: string };

export default function UploadForm() {
  const [entreprise, setEntreprise] = useState("");
  const [contact, setContact] = useState("");
  const [telephone, setTelephone] = useState("");
  const [formule, setFormule] = useState("");
  const [message, setMessage] = useState("");
  const [slotFiles, setSlotFiles] = useState<Partial<Record<string, SlotFile>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileSelect(formatKey: string, file: File | null) {
    if (!file) return;
    setSlotFiles((prev) => ({ ...prev, [formatKey]: { file, status: "idle" } }));
  }

  async function uploadOneFile(formatKey: string, entry: SlotFile) {
    setSlotFiles((prev) => ({ ...prev, [formatKey]: { ...entry, status: "uploading" } }));

    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: entry.file.name,
        fileType: entry.file.type || "application/octet-stream",
        format: formatKey,
      }),
    });
    if (!res.ok) throw new Error("Impossible de préparer l'envoi de " + entry.file.name);
    const { uploadUrl, key } = await res.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": entry.file.type || "application/octet-stream" },
      body: entry.file,
    });
    if (!putRes.ok) throw new Error("Échec de l'envoi de " + entry.file.name);

    setSlotFiles((prev) => ({ ...prev, [formatKey]: { ...entry, status: "done", key } }));
    return { key, format: formatKey, fileName: entry.file.name };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const entries = Object.entries(slotFiles).filter(([, v]) => v) as [string, SlotFile][];
    if (entries.length === 0) {
      setError("Ajoutez au moins un fichier avant d'envoyer.");
      return;
    }
    if (!entreprise || !contact || !telephone) {
      setError("Entreprise, contact et téléphone sont obligatoires.");
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = await Promise.all(
        entries.map(([formatKey, entry]) => uploadOneFile(formatKey, entry))
      );

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entreprise, contact, telephone, formule, message, files: uploaded }),
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
          Vos créas ont bien été reçues. Notre équipe commerciale vous recontacte
          rapidement par téléphone ou par email pour finaliser votre campagne.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-6">
      <div className="eyebrow mb-3">Espace annonceur</div>
      <h1 className="text-3xl md:text-4xl mb-2">Déposez vos créas publicitaires</h1>
      <p className="text-black/55 mb-10">
        Renseignez vos coordonnées et ajoutez vos fichiers dans les formats souhaités.
      </p>

      <form onSubmit={handleSubmit} className="card p-8 md:p-10 space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label>Nom d&apos;entreprise *</label>
            <input value={entreprise} onChange={(e) => setEntreprise(e.target.value)} placeholder="Ma Marque SARL" />
          </div>
          <div className="space-y-2">
            <label>Contact *</label>
            <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Marie Dupont" />
          </div>
          <div className="space-y-2">
            <label>Téléphone *</label>
            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+225 07 00 00 00 00" />
          </div>
          <div className="space-y-2">
            <label>Formule envisagée</label>
            <select value={formule} onChange={(e) => setFormule(e.target.value)}>
              <option value="">Sélectionnez (facultatif)</option>
              <option value="Standard — 30 spots">Standard — 30 spots</option>
              <option value="Premium — 60 spots">Premium — 60 spots</option>
              <option value="Max — 60+ spots">Max — 60+ spots</option>
              <option value="Je ne sais pas encore">Je ne sais pas encore</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label>Message (facultatif)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Contexte de la campagne, dates souhaitées..."
          />
        </div>

        <div>
          <label className="block mb-4">Vos créas, par format</label>
          <div className="grid sm:grid-cols-2 gap-4">
            {FORMAT_SLOTS.map((slot) => {
              const entry = slotFiles[slot.key];
              return (
                <label
                  key={slot.key}
                  className="border border-dashed border-black/20 p-5 flex flex-col gap-2 cursor-pointer hover:border-[var(--gold)] transition-colors"
                >
                  <span className="text-sm font-medium">{slot.label}</span>
                  <span className="text-xs text-black/45">{slot.hint}</span>
                  <input
                    type="file"
                    accept={slot.accept}
                    className="hidden"
                    onChange={(e) => handleFileSelect(slot.key, e.target.files?.[0] ?? null)}
                  />
                  {entry ? (
                    <span
                      className="text-xs mt-2 truncate"
                      style={{
                        color:
                          entry.status === "error"
                            ? "#b91c1c"
                            : entry.status === "done"
                            ? "#15803d"
                            : "var(--gold)",
                      }}
                    >
                      {entry.status === "uploading" && "Envoi en cours…"}
                      {entry.status === "done" && "✓ "}
                      {entry.status === "idle" && "Prêt — "}
                      {entry.file.name}
                    </span>
                  ) : (
                    <span className="text-xs mt-2 text-black/30">Cliquez pour ajouter un fichier</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-50">
          {submitting ? "Envoi en cours…" : "Envoyer mes créas"}
        </button>
      </form>
    </div>
  );
}
