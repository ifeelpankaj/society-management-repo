import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, LoadingState } from "@/components/ui";
import { getApiMessage } from "@/features/auth/api-error";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { titleize, visitorPurposes } from "@/features/guard/guard-utils";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import {
  copyVisitorInviteLink,
  formatVisitorInviteShareMessage,
  shareVisitorInvite,
  shareVisitorInviteOnWhatsApp,
} from "@/features/visitors/visitor-invite-share";
import {
  type ModelsVisitorPurpose,
  usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorInvitesMutation,
} from "@/lib/api/generated-api";
import { buildVisitorInviteUrl } from "@/lib/config";
import { theme } from "@/lib/theme";

type CreatedInvite = {
  purpose: ModelsVisitorPurpose;
  token: string;
  expiresAt?: string;
};

export default function ResidentInviteScreen() {
  const router = useRouter();
  const { flatId, canManageFlatVisitors, isLoading, requiresSelection, societyId } = useResident();
  const [purpose, setPurpose] = useState<ModelsVisitorPurpose>("guest");
  const [createdInvite, setCreatedInvite] = useState<CreatedInvite | null>(null);
  const [createInvite, createInviteState] =
    usePostV1SocietiesBySocietyIdFlatsAndFlatIdVisitorInvitesMutation();

  if (isLoading) {
    return <LoadingState message="Opening invite form" />;
  }

  if (requiresSelection || !societyId || !flatId) {
    return <ResidentSocietyGate />;
  }

  if (!canManageFlatVisitors) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
        <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
          <View className="gap-6">
            <GuardBackHeader title="Visitor Invite" />
            <Card className="gap-2">
              <Text className="text-base font-bold" style={{ color: theme.text.primary }}>
                Flat owner required
              </Text>
              <Text className="text-sm" style={{ color: theme.text.secondary }}>
                Only the flat owner can create pre-approved visitor invites.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const handleCreateInvite = async () => {
    try {
      const response = await createInvite({
        societyId,
        flatId,
        modelsCreateVisitorInviteRequest: { purpose },
      }).unwrap();

      const token = response.data?.token?.token;
      if (!token) {
        Alert.alert(
          "Invite created",
          response.message ?? "Visitor invite created successfully.",
        );
        router.back();
        return;
      }

      setCreatedInvite({
        purpose,
        token,
        expiresAt: response.data?.token?.expires_at,
      });
    } catch (error) {
      Alert.alert("Invite failed", getApiMessage(error, "Please try again."));
    }
  };

  const shareMessage = createdInvite
    ? formatVisitorInviteShareMessage(createdInvite)
    : "";

  const handleShareInvite = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      await shareVisitorInvite(shareMessage);
    } catch {
      Alert.alert("Share failed", "Unable to open the share sheet.");
    }
  };

  const handleShareWhatsApp = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      await shareVisitorInviteOnWhatsApp(shareMessage);
    } catch {
      Alert.alert("Share failed", "Unable to open WhatsApp.");
    }
  };

  const handleCopyLink = async () => {
    if (!createdInvite) {
      return;
    }

    try {
      const copied = await copyVisitorInviteLink(createdInvite.token);
      Alert.alert(
        copied ? "Link copied" : "Share link",
        copied
          ? "Visitor form link copied to clipboard."
          : "Use the share sheet to copy the visitor form link.",
      );
    } catch {
      Alert.alert("Copy failed", "Unable to copy the visitor form link.");
    }
  };

  if (createdInvite) {
    const formUrl = buildVisitorInviteUrl(createdInvite.token);

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
        <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
          <View className="gap-6">
            <GuardBackHeader title="Visitor Invite" />
            <View className="gap-1">
              <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
                Invite ready
              </Text>
              <Text className="text-sm" style={{ color: theme.text.secondary }}>
                Share this form link with your visitor so they can complete entry details on web.
              </Text>
            </View>

            <Card className="gap-4">
              <View className="gap-1">
                <Text className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Purpose
                </Text>
                <Text className="text-lg font-semibold capitalize text-slate-950">
                  {titleize(createdInvite.purpose)}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Form link
                </Text>
                <Text
                  className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-900"
                  selectable
                >
                  {formUrl}
                </Text>
              </View>

              <View className="gap-1">
                <Text className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Invite code
                </Text>
                <Text
                  className="rounded-xl bg-slate-100 px-4 py-3 font-mono text-xs text-slate-900"
                  selectable
                >
                  {createdInvite.token}
                </Text>
              </View>

              {createdInvite.expiresAt ? (
                <Text className="text-sm text-slate-600">
                  Expires {new Date(createdInvite.expiresAt).toLocaleString()}
                </Text>
              ) : null}
            </Card>

            <Button title="Share on WhatsApp" onPress={handleShareWhatsApp} />
            <Button title="Copy link" variant="secondary" onPress={handleCopyLink} />
            <Button title="Share invite" variant="secondary" onPress={handleShareInvite} />
            <Button title="Done" variant="secondary" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
        <View className="gap-6">
          <GuardBackHeader title="Visitor Invite" />
          <View className="gap-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              Create invite
            </Text>
            <Text className="text-sm" style={{ color: theme.text.secondary }}>
              Generate a shareable visitor form link for your flat.
            </Text>
          </View>

          <Card className="gap-4">
            <Text className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Visitor purpose
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {visitorPurposes.map((option) => {
                const active = option === purpose;

                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    className={[
                      "rounded-full border px-4 py-2",
                      active ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white",
                    ].join(" ")}
                    onPress={() => setPurpose(option)}
                  >
                    <Text
                      className={[
                        "text-sm font-semibold capitalize",
                        active ? "text-teal-800" : "text-slate-700",
                      ].join(" ")}
                    >
                      {option.replace(/_/g, " ")}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          <Button
            title="Create invite"
            loading={createInviteState.isLoading}
            onPress={handleCreateInvite}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
