"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

import {
  getFirebaseClientConfig,
  getFirebaseVapidKey,
  isFirebaseConfigured,
} from "./firebase-config";

let cachedToken: string | null = null;

function getFirebaseApp() {
  const config = getFirebaseClientConfig();
  if (!config) {
    return null;
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}

export async function registerWebPushToken() {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return null;
  }

  if (!(await isSupported())) {
    return null;
  }

  if (Notification.permission === "denied") {
    return null;
  }

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return null;
    }
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    { scope: "/" },
  );
  await navigator.serviceWorker.ready;

  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: getFirebaseVapidKey(),
    serviceWorkerRegistration: registration,
  });

  cachedToken = token || null;
  return cachedToken;
}

export function getCachedWebPushToken() {
  return cachedToken;
}

export async function unregisterWebPushToken() {
  cachedToken = null;
}
