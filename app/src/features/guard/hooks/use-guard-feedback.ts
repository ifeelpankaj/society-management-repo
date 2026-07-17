import { useToast } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";

export function useGuardFeedback() {
  const { showToast } = useToast();

  return {
    showError: (title: string, error: unknown, fallback: string) => {
      showToast({
        title,
        message: getApiMessage(error, fallback),
        variant: "error",
      });
    },
    showSuccess: (title: string, message: string) => {
      showToast({
        title,
        message,
        variant: "success",
      });
    },
    showInfo: (title: string, message: string) => {
      showToast({
        title,
        message,
        variant: "info",
      });
    },
  };
}
