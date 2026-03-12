"use server";

import { ENV } from "@/constants/envs";
import { ZDrive } from "@ziqx/drive";

export async function generateSignedUrl(fileName: string) {
  const drive = new ZDrive(ENV.ZDRIVE_KEY!, ENV.ZDRIVE_SECRET!);

  const signed = await drive.generatePutUrl(fileName);

  if (signed.success && signed.url) {
    return signed.url;
  } else {
    console.error("❌ Error generating URL:", signed.message);
    return null;
  }
}
