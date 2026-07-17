type ApiMessageResponse = {
  message?: string;
};

type ApiErrorResponse = {
  data?: {
    error?: {
      message?: string;
    };
    message?: string;
  };
  error?: string;
};

export function getApiMessage(response: ApiMessageResponse, fallback: string) {
  return response.message || fallback;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as ApiErrorResponse;

  return (
    apiError?.data?.error?.message ||
    apiError?.data?.message ||
    apiError?.error ||
    fallback
  );
}
