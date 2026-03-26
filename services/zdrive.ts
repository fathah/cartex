"use server";

import { z } from "zod";
import { ENV } from "@/constants/envs";
import { ZDrive } from "@ziqx/drive";
import {
  buildStorageFileName,
  validateMediaUpload,
} from "@/services/security";

const signedUrlSchema = z.object({
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  size: z.number().int().positive(),
});

export async function generateSignedUrl(input: {
  fileName: string;
  mimeType: string;
  size: number;
}) {
  const parsed = signedUrlSchema.parse(input);
  validateMediaUpload(parsed);

  const drive = new ZDrive(ENV.ZDRIVE_KEY!, ENV.ZDRIVE_SECRET!);
  const storageFileName = buildStorageFileName(
    parsed.fileName,
    parsed.mimeType,
  );
  const signed = await drive.generatePutUrl(storageFileName);

  if (!signed.success || !signed.url) {
    throw new Error(signed.message || "Failed to generate upload URL");
  }

  return {
    filename: storageFileName,
    signedUrl: signed.url,
  };
}
