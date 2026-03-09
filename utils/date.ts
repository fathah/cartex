import { format } from "date-fns";

/**
 * Formats a date string or Date object into a readable format.
 * Default format is "dd MMM yyyy" (e.g., 09 Mar 2026)
 */
export const formatDate = (
  date: string | Date | number,
  formatStr: string = "dd MMM yyyy",
) => {
  if (!date) return "";
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
};

/**
 * Formats a date string or Date object into a readable date and time format.
 * Default format is "dd MMM yyyy, HH:mm" (e.g., 09 Mar 2026, 14:30)
 */
export const formatDateTime = (
  date: string | Date | number,
  formatStr: string = "dd MMM yyyy, HH:mm",
) => {
  if (!date) return "";
  try {
    return format(new Date(date), formatStr);
  } catch (error) {
    console.error("Error formatting date time:", error);
    return String(date);
  }
};
