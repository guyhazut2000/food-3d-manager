import { API_URL } from "../config";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new ApiError(response.status, await readErrorDetail(response));
  }
  return response.status === 204 ? (undefined as T) : response.json();
}

async function readErrorDetail(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (typeof data?.detail === "string") return data.detail;
  if (response.status === 422) return "Please check the form fields and try again.";
  return "Something went wrong. Please try again.";
}

export function describeError(err: unknown, fallback = "Something went wrong."): string {
  return err instanceof Error ? err.message : fallback;
}

export function isApiError(err: unknown, status: number): err is ApiError {
  return err instanceof ApiError && err.status === status;
}
