const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = (
  configuredApiBaseUrl || "https://ai-business-manager-2.onrender.com"
).replace(/\/+$/, "")
