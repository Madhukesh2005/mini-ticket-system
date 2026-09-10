export class ApiError extends Error {
  errors?: Record<string, string>;
  status: number;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiErrorBody {
  message?: unknown;
  errors?: unknown;
}

const normalizeErrors = (
  errors: unknown,
): Record<string, string> | undefined => {
  if (!errors || typeof errors !== "object" || Array.isArray(errors)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(errors).map(([key, value]) => [
      key,
      String(value ?? ""),
    ]),
  );
};

const parseJson = async (
  response: Response,
): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.toLowerCase().includes("application/json")) {
    return undefined;
  }

  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const errorMessage = (
  body: ApiErrorBody | undefined,
  response: Response,
): string => {
  const errors = normalizeErrors(body?.errors);
  const details = errors
    ? Object.values(errors).filter(Boolean).join(". ")
    : "";

  if (details) {
    const message = typeof body?.message === "string"
      ? body.message
      : "Validation failed";
    return `${message}: ${details}`;
  }

  if (typeof body?.message === "string" && body.message) {
    return body.message;
  }

  return response.statusText || `Request failed (${response.status})`;
};

export const handleResponse = async <T>(
  response: Response,
): Promise<T> => {
  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const data = await parseJson(response);

  if (!response.ok) {
    const body = data && typeof data === "object"
      ? data as ApiErrorBody
      : undefined;

    throw new ApiError(
      errorMessage(body, response),
      response.status,
      normalizeErrors(body?.errors),
    );
  }

  return data as T;
};

export const extractErrorMessage = (
  data: unknown,
): string => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request failed";
  }

  const body = data as ApiErrorBody;
  const errors = normalizeErrors(body.errors);
  const details = errors
    ? Object.values(errors).filter(Boolean).join(". ")
    : "";

  if (details) {
    const message = typeof body.message === "string"
      ? body.message
      : "Validation failed";
    return `${message}: ${details}`;
  }

  return typeof body.message === "string" && body.message
    ? body.message
    : "Request failed";
};
