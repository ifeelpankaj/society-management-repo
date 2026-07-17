import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export const AUTH_ACCESS_TOKEN_KEY = "auth.accessToken";

function getWebStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function getAccessToken() {
  if (Platform.OS === "web") {
    return getWebStorage()?.getItem(AUTH_ACCESS_TOKEN_KEY) ?? null;
  }

  return SecureStore.getItemAsync(AUTH_ACCESS_TOKEN_KEY);
}

export async function setAccessToken(token: string) {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(AUTH_ACCESS_TOKEN_KEY, token);
    return;
  }

  await SecureStore.setItemAsync(AUTH_ACCESS_TOKEN_KEY, token);
}

export async function deleteAccessToken() {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(AUTH_ACCESS_TOKEN_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_ACCESS_TOKEN_KEY);
}
