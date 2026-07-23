import { describe, expect, it } from "vitest";

import { formatBusinessName } from "./formatBusinessName";

describe("formatBusinessName", () => {
  it("normaliza mayúsculas y minúsculas para mostrar un nombre", () => {
    expect(formatBusinessName("ESTANCIA LA ESPERANZA")).toBe("Estancia La Esperanza");
  });

  it("elimina los espacios exteriores y reduce espacios repetidos", () => {
    expect(formatBusinessName("  campo   los   álamos  ")).toBe("Campo Los Álamos");
  });

  it("formatea la terminación SA", () => {
    expect(formatBusinessName("ganadera del sur sa")).toBe("Ganadera Del Sur S.A.");
  });

  it("formatea la terminación SAS aunque incluya puntos", () => {
    expect(formatBusinessName("productores unidos s.a.s.")).toBe("Productores Unidos S.A.S.");
  });

  it("formatea la terminación SRL", () => {
    expect(formatBusinessName("la rural SRL")).toBe("La Rural S.R.L.");
  });

  it("mantiene una cadena vacía como cadena vacía", () => {
    expect(formatBusinessName("")).toBe("");
  });
});
