import { S3Client } from "@aws-sdk/client-s3";

/**
 * Client S3 compatible pointé vers Cloudflare R2.
 * R2 expose une API compatible S3 — on peut donc utiliser le SDK AWS standard
 * sans dépendre des bindings natifs Cloudflare, ce qui marche aussi bien
 * en local qu'une fois déployé sur Cloudflare Pages.
 */
export function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Variables R2 manquantes (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)."
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "coteouest-ads-uploads";