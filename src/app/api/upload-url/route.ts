import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";

export const runtime = "nodejs";

// Formats acceptés côté créas publicitaires — à ajuster si de nouveaux
// formats de spots sont ajoutés à la grille tarifaire.
const ALLOWED_FORMATS = ["16-9", "9-16", "1-1", "banniere"] as const;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json();
  const { fileName, fileType, format } = body as {
    fileName?: string;
    fileType?: string;
    format?: string;
  };

  if (!fileName || !fileType || !format) {
    return NextResponse.json(
      { error: "fileName, fileType et format sont requis." },
      { status: 400 }
    );
  }
  if (!ALLOWED_FORMATS.includes(format as (typeof ALLOWED_FORMATS)[number])) {
    return NextResponse.json({ error: "Format inconnu." }, { status: 400 });
  }

  // Chaque fichier est rangé par annonceur (userId Clerk) pour que Make
  // puisse ensuite créer/retrouver le bon dossier Drive.
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `${userId}/${Date.now()}-${format}-${safeName}`;

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

  return NextResponse.json({ uploadUrl, key });
}
