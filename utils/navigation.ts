export function sanitizeInternalRedirectPath(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return null;
  }

  if (/[\r\n]/.test(trimmed)) {
    return null;
  }

  return trimmed;
}
