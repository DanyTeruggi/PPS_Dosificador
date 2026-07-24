import { describe, expect, it } from "vitest";

import { getHomeByRole, HOME_BY_ROLE } from "./roleHome";

describe("getHomeByRole", () => {
  it.each([
    ["admin", "/dashboard"],
    ["veterinario", "/veterinarios/clientes"],
    ["cliente", "/cliente/establecimientos"],
  ] as const)("devuelve la página inicial de %s", (role, expectedPath) => {
    expect(getHomeByRole(role)).toBe(expectedPath);
    expect(HOME_BY_ROLE[role]).toBe(expectedPath);
  });
});
