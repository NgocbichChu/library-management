const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api"

export const API_BASE_URL = (
  import.meta.env.PROD ? "/api" : configuredApiBaseUrl
).replace(/\/+$/, "")

export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === "true"
