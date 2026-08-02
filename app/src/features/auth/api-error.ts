export function getApiMessage(error: unknown, fallback: string) {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return fallback;
  }

  const data = error.data;
  if (!data || typeof data !== "object") {
    return fallback;
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  if ("error" in data && data.error && typeof data.error === "object") {
    const nested = data.error;
    if ("message" in nested && typeof nested.message === "string") {
      return nested.message;
    }
  }

  return fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("data" in error)) {
    return undefined;
  }

  const data = error.data;
  if (!data || typeof data !== "object" || !("error" in data)) {
    return undefined;
  }

  const nested = data.error;
  if (!nested || typeof nested !== "object" || !("code" in nested)) {
    return undefined;
  }

  return typeof nested.code === "string" ? nested.code : undefined;
}

export function getVisitorActionErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "status" in error && error.status === 403) {
    return "Only an active flat resident can perform this action.";
  }

  return getApiMessage(error, fallback);
}
