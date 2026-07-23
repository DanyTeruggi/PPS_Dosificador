import { describe, expect, it } from "vitest";

import { getApiErrorDetails, getApiErrorMessage } from "./apiError";

function jsonResponse(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getApiErrorDetails", () => {
  it("conserva un mensaje detail enviado como texto", async () => {
    const result = await getApiErrorDetails(
      jsonResponse({ detail: "Credenciales inválidas" }, 401),
      "Error genérico",
    );

    expect(result).toEqual({
      message: "Credenciales inválidas",
      fieldErrors: {},
    });
  });

  it("asocia los errores 422 con los campos indicados por FastAPI", async () => {
    const result = await getApiErrorDetails(
      jsonResponse({
        detail: [
          { loc: ["body", "email"], msg: "El correo ya existe" },
          { loc: ["body", "password"], msg: "Debe tener 8 caracteres" },
        ],
      }, 422),
      "Error genérico",
    );

    expect(result.message).toBe("El correo ya existe. Debe tener 8 caracteres");
    expect(result.fieldErrors).toEqual({
      email: "El correo ya existe",
      password: "Debe tener 8 caracteres",
    });
  });

  it("conserva el primer mensaje cuando el backend repite un campo", async () => {
    const result = await getApiErrorDetails(
      jsonResponse({
        detail: [
          { loc: ["body", "email"], msg: "Primer error" },
          { loc: ["body", "email"], msg: "Segundo error" },
        ],
      }, 422),
      "Error genérico",
    );

    expect(result.fieldErrors.email).toBe("Primer error");
    expect(result.message).toBe("Primer error. Segundo error");
  });

  it.each([
    [401, "No tenés autorización para realizar esta operación."],
    [403, "No tenés permisos para realizar esta operación."],
    [409, "Ya existe un registro con esos datos."],
    [422, "Revisá los datos ingresados."],
  ])("usa el mensaje estándar para el estado %i", async (status, expected) => {
    const result = await getApiErrorDetails(jsonResponse({}, status), "Error genérico");
    expect(result.message).toBe(expected);
  });

  it("usa el fallback para un estado sin mensaje estándar", async () => {
    const result = await getApiErrorDetails(jsonResponse({}, 500), "Servidor no disponible");
    expect(result.message).toBe("Servidor no disponible");
  });

  it("tolera una respuesta cuyo cuerpo no es JSON", async () => {
    const response = new Response("Servicio caído", { status: 500 });
    const result = await getApiErrorDetails(response, "No se pudo completar la operación");

    expect(result).toEqual({
      message: "No se pudo completar la operación",
      fieldErrors: {},
    });
  });

  it("ignora elementos de validación sin mensaje o sin nombre de campo", async () => {
    const result = await getApiErrorDetails(
      jsonResponse({
        detail: [
          { loc: ["body", 0], msg: "Error general" },
          { loc: ["body", "email"] },
          { msg: "Error sin ubicación" },
        ],
      }, 422),
      "Error genérico",
    );

    expect(result.message).toBe("Error general. Error sin ubicación");
    expect(result.fieldErrors).toEqual({});
  });

  it("usa el mensaje del estado cuando detail tiene un formato desconocido", async () => {
    const result = await getApiErrorDetails(
      jsonResponse({ detail: { reason: "formato no soportado" } }, 422),
      "Error genérico",
    );

    expect(result).toEqual({
      message: "Revisá los datos ingresados.",
      fieldErrors: {},
    });
  });

  it("usa el mensaje del estado cuando la lista no contiene mensajes válidos", async () => {
    const result = await getApiErrorDetails(
      jsonResponse({ detail: [{ loc: ["body", "email"] }] }, 422),
      "Error genérico",
    );

    expect(result).toEqual({
      message: "Revisá los datos ingresados.",
      fieldErrors: {},
    });
  });
});

describe("getApiErrorMessage", () => {
  it("devuelve solamente el mensaje del detalle normalizado", async () => {
    const message = await getApiErrorMessage(
      jsonResponse({ detail: "Operación rechazada" }, 400),
      "Error genérico",
    );

    expect(message).toBe("Operación rechazada");
  });
});
