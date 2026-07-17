import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export async function configureNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    return null;
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (existingPermission.status !== "granted") {
    const permission = await Notifications.requestPermissionsAsync();
    finalStatus = permission.status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  return Notifications.getExpoPushTokenAsync();
}

export function addNotificationListeners({
  onReceived,
  onResponse,
}: {
  onReceived?: (notification: Notifications.Notification) => void;
  onResponse?: (response: Notifications.NotificationResponse) => void;
}) {
  const receivedSubscription =
    Notifications.addNotificationReceivedListener((notification) => {
      onReceived?.(notification);
    });
  const responseSubscription =
    Notifications.addNotificationResponseReceivedListener((response) => {
      onResponse?.(response);
    });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}
