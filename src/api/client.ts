import { API_BASE_URL } from "@/api/config"

const TOKEN_KEY = "library_access_token"

export const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setStoredToken = (token: string | null) => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : `HTTP ${status}`
    super(message)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }
}

type RequestOptions = Omit<RequestInit, "body" | "method"> & {
  body?: unknown
}

async function request<T>(
  method: string,
  path: string,
  { body, headers, ...options }: RequestOptions = {}
): Promise<T> {
  const requestHeaders = new Headers(headers)
  if (!requestHeaders.has("Accept"))
    requestHeaders.set("Accept", "application/json")

  const token = getStoredToken()
  if (token && !requestHeaders.has("Authorization")) {
    requestHeaders.set("Authorization", `Bearer ${token}`)
  }

  const isFormData = body instanceof FormData
  if (
    body !== undefined &&
    !isFormData &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json")
  }

  const cleanPath = path.replace(/^\/+/, "")
  const normalizedPath =
    API_BASE_URL.endsWith("/api") && cleanPath.startsWith("api/")
      ? cleanPath.slice(4)
      : cleanPath

  const response = await fetch(`${API_BASE_URL}/${normalizedPath}`, {
    ...options,
    method,
    headers: requestHeaders,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
  })
  const text = await response.text()
  let data: unknown = undefined
  if (text) {
    if (response.headers.get("content-type")?.includes("json")) {
      try {
        data = JSON.parse(text)
      } catch {
        if (response.ok) throw new Error("Phản hồi JSON không hợp lệ.")
        data = text
      }
    } else {
      data = text
    }
  }
  if (!response.ok) throw new ApiError(response.status, data)
  return data as T
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("GET", path, options),
  post: <T = void>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
  ) => request<T>("POST", path, { ...options, body }),
  put: <T = void>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
  ) => request<T>("PUT", path, { ...options, body }),
  patch: <T = void>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">
  ) => request<T>("PATCH", path, { ...options, body }),
  delete: <T = void>(path: string, options?: Omit<RequestOptions, "body">) =>
    request<T>("DELETE", path, options),
}
