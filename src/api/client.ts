import { API_BASE_URL } from "@/api/config"

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, data: unknown) {
    super(`HTTP ${status}`)
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
  const isFormData = body instanceof FormData
  if (
    body !== undefined &&
    !isFormData &&
    !requestHeaders.has("Content-Type")
  ) {
    requestHeaders.set("Content-Type", "application/json")
  }

  const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`, {
    credentials: "include",
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
