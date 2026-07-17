export function getErrorText(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return undefined;
}

export function getFieldValidity(
  value: string | undefined,
  getError: (value: string) => string | null,
) {
  return value ? getError(value) === null : null;
}
