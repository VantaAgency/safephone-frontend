import type { ApiErrorDetail, ApiErrorResponse, ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export class ApiError extends Error {
  code: string;
  requestId: string;
  fields?: Record<string, string>;
  status: number;

  constructor(detail: ApiErrorDetail, status: number) {
    super(detail.message);
    this.name = "ApiError";
    this.code = detail.code;
    this.requestId = detail.request_id;
    this.fields = detail.fields;
    this.status = status;
  }
}

let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAuthToken = getter;
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (getAuthToken) {
    const token = await getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let errorDetail: ApiErrorDetail;
    try {
      const errorBody: ApiErrorResponse = await res.json();
      errorDetail = errorBody.error;
    } catch {
      errorDetail = {
        code: "NETWORK_ERROR",
        message: res.statusText || "An unexpected error occurred",
        request_id: "",
      };
    }
    throw new ApiError(errorDetail, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const body: ApiResponse<T> = await res.json();
  return body.data;
}

export const api = {
  get<T>(path: string, params?: Record<string, string | number | undefined>) {
    let url = path;
    if (params) {
      const search = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) search.set(key, String(value));
      }
      const qs = search.toString();
      if (qs) url += `?${qs}`;
    }
    return fetchApi<T>(url);
  },

  post<T>(path: string, body?: unknown) {
    return fetchApi<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put<T>(path: string, body?: unknown) {
    return fetchApi<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string) {
    return fetchApi<T>(path, { method: "DELETE" });
  },
};
