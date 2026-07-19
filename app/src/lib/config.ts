function requireEnv(key: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const swaggerDocsUrl = process.env.EXPO_PUBLIC_SWAGGER_URL;
const webBaseUrl = process.env.EXPO_PUBLIC_WEB_BASE_URL;

export const appConfig = {
  get apiBaseUrl() {
    return requireEnv("EXPO_PUBLIC_API_BASE_URL", apiBaseUrl);
  },
  get swaggerDocsUrl() {
    return requireEnv("EXPO_PUBLIC_SWAGGER_URL", swaggerDocsUrl);
  },
  get webBaseUrl() {
    return requireEnv("EXPO_PUBLIC_WEB_BASE_URL", webBaseUrl).replace(/\/+$/, "");
  },
};

export function buildVisitorInviteUrl(token: string) {
  return `${appConfig.webBaseUrl}/visit/invite/${encodeURIComponent(token)}`;
}
