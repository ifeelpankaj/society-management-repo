import { Linking, Platform, Share } from "react-native";

import { titleize } from "@/features/guard/guard-utils";
import { buildVisitorInviteUrl } from "@/lib/config";
import type { ModelsVisitorPurpose } from "@/lib/api/generated-api";

type VisitorInviteShareInput = {
  purpose: ModelsVisitorPurpose;
  token: string;
  expiresAt?: string;
};

export function formatVisitorInviteShareMessage(invite: VisitorInviteShareInput) {
  const purposeLabel = titleize(invite.purpose);
  const formUrl = buildVisitorInviteUrl(invite.token);
  const expiryLine = invite.expiresAt
    ? `\nExpires: ${new Date(invite.expiresAt).toLocaleString()}`
    : "";

  return `You're invited as a ${purposeLabel} visitor.\n\nComplete your entry details here:\n${formUrl}${expiryLine}`;
}

export async function shareVisitorInvite(message: string) {
  await Share.share({
    message,
    title: "Visitor invite",
    url: Platform.OS === "ios" ? extractInviteUrl(message) : undefined,
  });
}

export async function shareVisitorInviteOnWhatsApp(message: string) {
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  try {
    const canOpen = await Linking.canOpenURL(whatsAppUrl);
    if (!canOpen) {
      await shareVisitorInvite(message);
      return;
    }

    await Linking.openURL(whatsAppUrl);
  } catch {
    await shareVisitorInvite(message);
  }
}

export async function copyVisitorInviteLink(token: string) {
  const url = buildVisitorInviteUrl(token);

  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return true;
  }

  await Share.share({ message: url, title: "Visitor invite link" });
  return false;
}

function extractInviteUrl(message: string) {
  const match = message.match(/https?:\/\/\S+/);
  return match?.[0] ?? "";
}
