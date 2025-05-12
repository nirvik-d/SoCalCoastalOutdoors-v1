import esriConfig from "@arcgis/core/config";

export function AuthenticateEsriAPI() {
  esriConfig.apiKey = import.meta.env.VITE_ARCGIS_API_KEY;
  return null;
}
