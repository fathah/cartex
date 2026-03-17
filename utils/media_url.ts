import { AppConstants } from "@/constants/constants";

export const getMediaUrl = (filename: string | null | undefined) => {
  if (!filename) return "/placeholder.png";
  if (filename.startsWith("http") || filename.startsWith("/")) return filename;

  const driveUrl = AppConstants.DRIVE_ROOT_URL;
  if (!driveUrl || driveUrl === "undefined") {
    console.warn("[MediaUrl] DRIVE_ROOT_URL is undefined. Using placeholder.");
    return "/placeholder.png";
  }

  return `${driveUrl}/${filename}`;
};
