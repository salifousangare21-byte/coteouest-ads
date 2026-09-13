import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { R2_BUCKET_NAME } from "@/lib/r2";

export const runtime = "nodejs";

interface UploadedFile {
  key: string;
  fileName: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const clerkUser = await currentUser();
  const body = await req.json();
  const { nomComplet, entreprise, email, telephone, formule, message, file } = body as {
    nomComplet?: string;
    entreprise?: string;
    email?: string;
    telephone?: string;
    formule?: string;
    message?: string;
    file?: UploadedFile;
  };

  if (!nomComplet || !entreprise || !email || !telephone || !formule || !file) {
    return NextResponse.json(
      { error: "Nom complet, entreprise, email, téléphone, formule et un spot vidéo sont requis." },
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
    email_compte: clerkUser?.primaryEmailAddress?.emailAddress || "",
    nom_complet: nomComplet,
    entreprise,
    email,
    telephone,
    formule,
    message: message || "",
    fichier: {
      nom_original: file.fileName,
      cle_r2: file.key,
      url: r2PublicUrl ? `${r2PublicUrl}/${file.key}` : null,
      bucket: R2_BUCKET_NAME,
    },
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
