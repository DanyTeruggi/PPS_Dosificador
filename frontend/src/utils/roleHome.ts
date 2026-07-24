import type { UserRole } from "../context/authContextDefinition";

export const HOME_BY_ROLE: Readonly<Record<UserRole, string>> = {
  admin: "/dashboard",
  veterinario: "/veterinarios/clientes",
  cliente: "/cliente/establecimientos",
};

export function getHomeByRole(role: UserRole): string {
  return HOME_BY_ROLE[role];
}
