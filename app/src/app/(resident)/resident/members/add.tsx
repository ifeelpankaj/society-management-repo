import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, Input, LoadingState, SegmentTabs } from "@/components/ui";
import { GuardBackHeader } from "@/features/guard/components/guard-back-header";
import { useProfileAction } from "@/features/profile/use-profile-action";
import { ResidentSocietyGate } from "@/features/resident/components/resident-society-gate";
import { useResident } from "@/features/resident/resident-context";
import type { ModelsFlatResidentRole } from "@/lib/api/generated-api";
import { theme } from "@/lib/theme";

const ROLE_OPTIONS: { label: string; value: ModelsFlatResidentRole }[] = [
  { label: "Family", value: "family" },
  { label: "Tenant", value: "tenant" },
];

export default function AddFlatMemberScreen() {
  const { canManageFlatMembers, isLoading, requiresSelection, selectedResidence } = useResident();
  const { showComingSoon } = useProfileAction();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ModelsFlatResidentRole>("family");

  if (isLoading) {
    return <LoadingState message="Opening add member" />;
  }

  if (requiresSelection || !selectedResidence) {
    return <ResidentSocietyGate />;
  }

  if (!canManageFlatMembers) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
        <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
          <View className="gap-6">
            <GuardBackHeader title="Add Member" />
            <Card className="gap-2">
              <Text className="text-base font-bold" style={{ color: theme.text.primary }}>
                Flat owner only
              </Text>
              <Text className="text-sm" style={{ color: theme.text.secondary }}>
                Only the flat owner can add members to this flat.
              </Text>
            </Card>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.guard.screenBg }}>
      <ScrollView contentContainerClassName="px-5 pb-8 pt-3">
        <View className="gap-6">
          <GuardBackHeader title="Add Member" />

          <View className="gap-1">
            <Text className="text-2xl font-bold" style={{ color: theme.text.primary }}>
              Add flat member
            </Text>
            <Text className="text-sm" style={{ color: theme.text.secondary }}>
              Invite a family member or tenant to your flat at{" "}
              {selectedResidence.society_name ?? "your society"}.
            </Text>
          </View>

          <Card className="gap-4">
            <Input
              autoCapitalize="words"
              label="Full name"
              value={fullName}
              onChangeText={setFullName}
            />
            <Input
              autoComplete="tel"
              keyboardType="phone-pad"
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
            />
            <Input
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              value={email}
              onChangeText={setEmail}
            />

            <View className="gap-2">
              <Text className="text-sm font-semibold" style={{ color: theme.text.secondary }}>
                Role
              </Text>
              <SegmentTabs options={ROLE_OPTIONS} value={role} onChange={setRole} />
            </View>
          </Card>

          <Button
            title="Add member"
            onPress={() => showComingSoon("Add member")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
