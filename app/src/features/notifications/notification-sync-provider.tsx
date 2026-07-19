import { type PropsWithChildren, useEffect } from "react";

import { useAuth } from "@/features/auth/use-auth";
import {
  enhancedApi,
  invalidateVisitorNotificationTags,
} from "@/lib/api/enhanced-api";
import { addNotificationListeners } from "@/lib/notifications/register-notifications";
import { useAppDispatch } from "@/redux/hooks";

function getNotificationEventType(data: Record<string, unknown> | undefined) {
  const type = data?.type;
  return typeof type === "string" ? type : undefined;
}

export function NotificationSyncProvider({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch();
  const { status } = useAuth();

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const invalidateFromNotification = (data: Record<string, unknown> | undefined) => {
      const eventType = getNotificationEventType(data);
      dispatch(enhancedApi.util.invalidateTags(invalidateVisitorNotificationTags(eventType)));
    };

    return addNotificationListeners({
      onReceived: (notification) => {
        invalidateFromNotification(
          notification.request.content.data as Record<string, unknown> | undefined,
        );
      },
      onResponse: (response) => {
        invalidateFromNotification(
          response.notification.request.content.data as Record<string, unknown> | undefined,
        );
      },
    });
  }, [dispatch, status]);

  return children;
}
