import { Linking, Platform, Share } from "react-native";

import { titleize } from "@/features/guard/guard-utils";
import { buildMemberInviteUrl } from "@/lib/config";
import type { ModelsFlatMemberInviteRole } from "@/lib/api/resident-api-extensions";

type MemberInviteShareInput = {
  fullName: string;
  role: ModelsFlatMemberInviteRole;
  token: string;
  expiresAt?: string;
  societyName?: string;
  flatNumber?: string;
};

export function formatMemberInviteShareMessage(invite: MemberInviteShareInput) {
  const roleLabel = titleize(invite.role);
  const joinUrl = buildMemberInviteUrl(invite.token);
  const location =
    invite.societyName && invite.flatNumber
      ? `\nFlat: ${invite.flatNumber}, ${invite.societyName}`
      : "";
  const expiryLine = invite.expiresAt
    ? `\nExpires: ${new Date(invite.expiresAt).toLocaleString()}`
    : "";

  return `${invite.fullName}, you're invited to join as ${roleLabel}.${location}\n\nAccept your invite here:\n${joinUrl}${expiryLine}`;
}

export async function shareMemberInvite(message: string) {
  await Share.share({
    message,
    title: "Flat member invite",
    url: Platform.OS === "ios" ? extractInviteUrl(message) : undefined,
  });
}

export async function shareMemberInviteOnWhatsApp(message: string) {
  const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  try {
    const canOpen = await Linking.canOpenURL(whatsAppUrl);
    if (!canOpen) {
      await shareMemberInvite(message);
      return;
    }

    await Linking.openURL(whatsAppUrl);
  } catch {
    await shareMemberInvite(message);
  }
}

export async function shareMemberInviteOnTelegram(message: string) {
  const inviteUrl = extractInviteUrl(message);
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteUrl)}&text=${encodeURIComponent(message)}`;

  try {
    const canOpen = await Linking.canOpenURL(telegramUrl);
    if (!canOpen) {
      await shareMemberInvite(message);
      return;
    }

    await Linking.openURL(telegramUrl);
  } catch {
    await shareMemberInvite(message);
  }
}

export async function copyMemberInviteLink(token: string) {
  const url = buildMemberInviteUrl(token);

  if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(url);
    return true;
  }

  await Share.share({ message: url, title: "Member invite link" });
  return false;
}

function extractInviteUrl(message: string) {
  const match = message.match(/https?:\/\/\S+/);
  return match?.[0] ?? "";
}
