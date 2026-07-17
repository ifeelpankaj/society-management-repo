import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, EmptyState, LoadingState, ScreenHeader, StatusPill } from "@/components/ui";
import { useGuardSociety } from "@/features/guard/guard-context";
import { theme } from "@/lib/theme";

export function GuardSocietyGate() {
  const { isLoading, memberships, refetch, selectSociety } = useGuardSociety();

  if (isLoading) {
    return <LoadingState message="Opening guard workspace" />;
  }

  if (memberships.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.surface.screen }}
      >
        <ScrollView contentContainerClassName="px-6 py-8">
          <EmptyState
            title="No guard access"
            message="Your account is signed in, but active guard access is not linked yet."
            actionLabel="Refresh"
            onAction={refetch}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.surface.screen }}
    >
      <ScrollView contentContainerClassName="px-6 py-8">
        <View className="gap-8">
          <ScreenHeader
            eyebrow="Guard workspace"
            title="Select society"
            subtitle="Choose the society gate you are operating before continuing."
          />

          <View className="gap-3">
            {memberships.map((membership) => (
              <Card key={`guard-society-${membership.id ?? membership.society_id}`} className="gap-4">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text
                      className="text-xl font-bold"
                      style={{ color: theme.text.primary }}
                    >
                      Society #{membership.society_id}
                    </Text>
                    <Text
                      className="mt-1 text-base capitalize"
                      style={{ color: theme.text.secondary }}
                    >
                      {membership.role ?? "staff"} access
                    </Text>
                  </View>
                  <StatusPill status={membership.status} />
                </View>
                <Button
                  title="Operate this gate"
                  onPress={() => {
                    if (membership.society_id) {
                      selectSociety(membership.society_id);
                    }
                  }}
                />
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
