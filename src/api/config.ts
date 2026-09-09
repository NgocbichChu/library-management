export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "/api"
).replace(/\/+$/, "")

// Keep the existing demo login until a backend is available.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false"
