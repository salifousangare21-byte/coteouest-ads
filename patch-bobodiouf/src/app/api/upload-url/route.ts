import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await req.json();
  const { fileName, fileType } = body as { fileName?: string; fileType?: string };

  if (!fileName || !fileType) {
    return NextResponse.json({ error: "fileName et fileType sont requis." }, { status: 400 });
  }

  // Chaque spot est rangé par annonceur (userId Clerk) pour que Make
  // puisse ensuite créer/retrouver le bon dossier Drive.
  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const key = `${userId}/${Date.now()}-${safeName}`;

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });

  return NextResponse.json({ uploadUrl, key });
}
