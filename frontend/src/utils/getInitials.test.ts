import { describe, expect, it } from "vitest";

import { getInitials } from "./getInitials";

describe("getInitials", () => {
  it("devuelve un signo de pregunta cuando el nombre no existe", () => {
    expect(getInitials(undefined)).toBe("?");
  });

  it("devuelve un signo de pregunta para una cadena vacía", () => {
    expect(getInitials("   ")).toBe("?");
  });

  it("usa la primera letra cuando hay un solo nombre", () => {
    expect(getInitials("ana")).toBe("A");
  });

  it("usa las iniciales del nombre y del apellido", () => {
    expect(getInitials("Juan Pérez")).toBe("JP");
  });

  it("usa la primera y la última palabra en nombres compuestos", () => {
    expect(getInitials("María del Carmen López")).toBe("ML");
  });

  it("ignora los espacios repetidos y exteriores", () => {
    expect(getInitials("  José    Gómez  ")).toBe("JG");
  });
});
