import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { R2_BUCKET_NAME } from "@/lib/r2";

export const runtime = "nodejs";

interface UploadedFile {
  key: string;
  format: string;
  fileName: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const user = await currentUser();
  const body = await req.json();
  const { entreprise, contact, telephone, formule, message, files } = body as {
    entreprise?: string;
    contact?: string;
    telephone?: string;
    formule?: string;
    message?: string;
    files?: UploadedFile[];
  };

  if (!entreprise || !contact || !telephone || !files || files.length === 0) {
    return NextResponse.json(
      { error: "Entreprise, contact, téléphone et au moins un fichier sont requis." },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "MAKE_WEBHOOK_URL n'est pas configuré côté serveur." },
      { status: 500 }
    );
  }

  const r2PublicUrl = process.env.R2_PUBLIC_URL;

  const payload = {
    user_id: userId,
    email: user?.primaryEmailAddress?.emailAddress || "",
    entreprise,
    contact,
    telephone,
    formule: formule || "Non précisé",
    message: message || "",
    fichiers: files.map((f) => ({
      format: f.format,
      nom_original: f.fileName,
      cle_r2: f.key,
      // Make peut retélécharger le fichier via cette URL (si le bucket a un accès public activé)
      // ou via l'API S3/R2 directement avec la clé ci-dessus.
      url: r2PublicUrl ? `${r2PublicUrl}/${f.key}` : null,
      bucket: R2_BUCKET_NAME,
    })),
    soumis_le: new Date().toISOString(),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Webhook Make a répondu ${res.status}`);
  } catch {
    return NextResponse.json(
      { error: "Échec de l'envoi vers Make. Réessayez dans un instant." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
