import type { AdminUserRole } from "../../../types/AdminUser";

/** Sólo clientes y veterinarios pueden cambiar de estado desde el panel. */
export function canChangeUserStatus(role: AdminUserRole | string | null | undefined) {
  const normalizedRole = role?.trim().toLowerCase();
  return normalizedRole === "cliente" || normalizedRole === "veterinario";
}
