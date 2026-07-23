type FastApiValidationError = {
  loc?: Array<string | number>;
  msg?: string;
};

export type ApiErrorDetails = {
  message: string;
  fieldErrors: Record<string, string>;
};

function extractDetail(payload: unknown) {
  const fieldErrors: Record<string, string> = {};
  if (!payload || typeof payload !== "object" || !("detail" in payload)) {
    return { message: null, fieldErrors };
  }

  const detail = payload.detail;
  if (typeof detail === "string") return { message: detail, fieldErrors };

  if (Array.isArray(detail)) {
    const messages: string[] = [];
    detail.forEach((item: FastApiValidationError) => {
      if (!item?.msg) return;
      messages.push(item.msg);
      // FastAPI informa el campo en loc; conservamos el último segmento para el formulario.
      const field = item.loc?.filter((part) => part !== "body").at(-1);
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = item.msg;
    });
    return {
      message: messages.length > 0 ? messages.join(". ") : null,
      fieldErrors,
    };
  }

  return { message: null, fieldErrors };
}

export async function getApiErrorDetails(
  response: Response,
  fallback: string,
): Promise<ApiErrorDetails> {
  let parsed = { message: null as string | null, fieldErrors: {} as Record<string, string> };
  try {
    parsed = extractDetail(await response.json());
  } catch {
    // La respuesta puede no incluir un cuerpo JSON.
  }

  if (parsed.message) return { message: parsed.message, fieldErrors: parsed.fieldErrors };

  const statusMessages: Record<number, string> = {
    401: "No tenés autorización para realizar esta operación.",
    403: "No tenés permisos para realizar esta operación.",
    409: "Ya existe un registro con esos datos.",
    422: "Revisá los datos ingresados.",
  };
  return {
    message: statusMessages[response.status] ?? fallback,
    fieldErrors: parsed.fieldErrors,
  };
}

export async function getApiErrorMessage(response: Response, fallback: string) {
  return (await getApiErrorDetails(response, fallback)).message;
}
