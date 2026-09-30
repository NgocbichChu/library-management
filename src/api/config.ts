const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api"

export const API_BASE_URL = (
  import.meta.env.PROD ? "/api" : configuredApiBaseUrl
).replace(/\/+$/, "")

const configuredMockMode = import.meta.env.VITE_USE_MOCK_API

export const USE_MOCK_API =
  configuredMockMode === "true" ||
  (!import.meta.env.PROD && configuredMockMode !== "false")
