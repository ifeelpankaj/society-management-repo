function requireEnv(key: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const swaggerDocsUrl = process.env.EXPO_PUBLIC_SWAGGER_URL;

export const appConfig = {
  get apiBaseUrl() {
    return requireEnv("EXPO_PUBLIC_API_BASE_URL", apiBaseUrl);
  },
  get swaggerDocsUrl() {
    return requireEnv("EXPO_PUBLIC_SWAGGER_URL", swaggerDocsUrl);
  },
};
