/** Genera hasta dos iniciales usando la primera y la última palabra. */
export function getInitials(name: string | undefined): string {
  if (!name?.trim()) return "?";

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
