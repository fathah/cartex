import { AppConstants } from "@/constants/constants";

export const getMediaUrl = (filename: string | null | undefined) => {
  if (!filename) return "/placeholder.png";
  if (filename.startsWith("http") || filename.startsWith("/")) return filename;
  return `${AppConstants.DRIVE_ROOT_URL}/${filename}`;
};
