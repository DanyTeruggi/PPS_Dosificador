import { describe, expect, it, vi } from "vitest";

import type { ClienteAdmin, VeterinarioOption } from "../../../types/ClientAssignment";
import {
  getClienteVeterinarioId,
  getVeterinarioId,
  reasignarCliente,
} from "./assignmentUtils";

const usuario = {
  id: 10,
  nombre: "Usuario de prueba",
  email: "prueba@example.com",
};

function cliente(overrides: Partial<ClienteAdmin> = {}): ClienteAdmin {
  return {
    cliente_id: 1,
    razon_social: "Campo de prueba",
    usuario,
    ...overrides,
  };
}

function veterinario(overrides: Partial<VeterinarioOption> = {}): VeterinarioOption {
  return {
    id: 4,
    usuario,
    ...overrides,
  };
}

describe("getClienteVeterinarioId", () => {
  it("prioriza veterinario_id cuando está presente", () => {
    expect(getClienteVeterinarioId(cliente({
      veterinario_id: 7,
      veterinario: 9,
    }))).toBe(7);
  });

  it("acepta un veterinario representado directamente como número", () => {
    expect(getClienteVeterinarioId(cliente({ veterinario: 12 }))).toBe(12);
  });

  it("lee veterinario_id desde un objeto anidado", () => {
    expect(getClienteVeterinarioId(cliente({
      veterinario: veterinario({ id: 4, veterinario_id: 15 }),
    }))).toBe(15);
  });

  it("usa id cuando el objeto anidado no tiene veterinario_id", () => {
    expect(getClienteVeterinarioId(cliente({
      veterinario: veterinario({ id: 4 }),
    }))).toBe(4);
  });

  it("devuelve null cuando el cliente no tiene veterinario", () => {
    expect(getClienteVeterinarioId(cliente({
      veterinario_id: null,
      veterinario: null,
    }))).toBeNull();
  });
});

describe("getVeterinarioId", () => {
  it("prioriza veterinario_id", () => {
    expect(getVeterinarioId(veterinario({ id: 4, veterinario_id: 8 }))).toBe(8);
  });

  it("utiliza id como alternativa", () => {
    expect(getVeterinarioId(veterinario({ id: 4 }))).toBe(4);
  });
});

describe("reasignarCliente", () => {
  it("envía el endpoint, método y cuerpo esperados", async () => {
    const apiFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));

    await reasignarCliente(apiFetch, 23, 9);

    expect(apiFetch).toHaveBeenCalledOnce();
    expect(apiFetch).toHaveBeenCalledWith(
      "/api/v1/admin/clientes/23/veterinario",
      {
        method: "PATCH",
        body: JSON.stringify({ veterinario_id: 9 }),
      },
    );
  });

  it("informa cuando el servidor no devuelve una respuesta", async () => {
    const apiFetch = vi.fn().mockResolvedValue(undefined);

    await expect(reasignarCliente(apiFetch, 23, 9))
      .rejects.toThrow("No se recibió respuesta del servidor.");
  });

  it("propaga el detalle de error devuelto por el backend", async () => {
    const apiFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ detail: "El veterinario está inactivo" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(reasignarCliente(apiFetch, 23, 9))
      .rejects.toThrow("El veterinario está inactivo");
  });
});
