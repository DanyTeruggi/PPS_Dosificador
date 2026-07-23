import { describe, expect, it } from "vitest";

import { canChangeUserStatus } from "./userStatusUtils";

describe("canChangeUserStatus", () => {
  it("permite cambiar el estado de un cliente", () => {
    expect(canChangeUserStatus("cliente")).toBe(true);
  });

  it("permite cambiar el estado de un veterinario", () => {
    expect(canChangeUserStatus("veterinario")).toBe(true);
  });

  it("impide cambiar el estado de un administrador", () => {
    expect(canChangeUserStatus("admin")).toBe(false);
  });

  it("normaliza espacios y mayúsculas antes de evaluar el rol", () => {
    expect(canChangeUserStatus("  ADMIN  ")).toBe(false);
  });

  it("rechaza un rol desconocido por seguridad", () => {
    expect(canChangeUserStatus("supervisor")).toBe(false);
  });

  it("rechaza un rol ausente por seguridad", () => {
    expect(canChangeUserStatus(undefined)).toBe(false);
  });
});
