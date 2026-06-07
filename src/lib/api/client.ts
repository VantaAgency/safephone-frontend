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

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
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

// Verification media is served by the backend behind JWT Bearer auth, but an
// <img>/<video> tag can't send an Authorization header. Fetch the (absolute)
// URL with the Bearer token and hand back an object URL the browser can render.
// Caller is responsible for URL.revokeObjectURL once done.
export async function fetchAuthedObjectUrl(url: string): Promise<string> {
  const headers = new Headers();
  if (getAuthToken) {
    const token = await getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`media fetch failed (${res.status})`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
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

  postForm<T>(path: string, body: FormData) {
    return fetchApi<T>(path, {
      method: "POST",
      body,
    });
  },

  put<T>(path: string, body?: unknown) {
    return fetchApi<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: unknown) {
    return fetchApi<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string) {
    return fetchApi<T>(path, { method: "DELETE" });
  },
};
