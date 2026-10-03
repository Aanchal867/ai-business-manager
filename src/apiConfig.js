const productionApiBaseUrl = "https://ai-business-manager-2.onrender.com"
const developmentApiBaseUrl = "http://127.0.0.1:8000"

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL = (
  configuredApiBaseUrl ||
  (import.meta.env.DEV ? developmentApiBaseUrl : productionApiBaseUrl)
).replace(/\/+$/, "")
