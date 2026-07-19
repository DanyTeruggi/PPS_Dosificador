type FastApiValidationError = {
  msg?: string;
};

function extractDetail(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) {
    return null;
  }

  const detail = payload.detail;
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: FastApiValidationError) => item?.msg)
      .filter((message): message is string => Boolean(message));

    return messages.length > 0 ? messages.join(". ") : null;
  }

  return null;
}

export async function getApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const detail = extractDetail(await response.json());
    if (detail) return detail;
  } catch {
    // La respuesta puede no incluir un cuerpo JSON.
  }

  switch (response.status) {
    case 401:
      return "No tenés autorización para realizar esta operación.";
    case 403:
      return "No tenés permisos para realizar esta operación.";
    case 409:
      return "Ya existe un usuario con esos datos.";
    case 422:
      return "Revisá los datos ingresados.";
    default:
      return fallback;
  }
}
