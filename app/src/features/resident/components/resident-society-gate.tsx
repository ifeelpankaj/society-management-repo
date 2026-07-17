import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, EmptyState, LoadingState, ScreenHeader, StatusPill } from "@/components/ui";
import { useResident } from "@/features/resident/resident-context";

export function ResidentSocietyGate() {
  const { isLoading, refetch, residences, selectResidence } = useResident();

  if (isLoading) {
    return <LoadingState message="Opening resident workspace" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerClassName="px-6 py-8">
        <View className="gap-8">
          <ScreenHeader
            eyebrow="Resident workspace"
            title="Select residence"
            subtitle="Choose the flat you want to manage before continuing."
          />

          <View className="gap-3">
            {residences.map((residence) => (
              <Card key={`residence-${residence.id ?? residence.flat_id}`} className="gap-4">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-slate-950">
                      {residence.society_name ?? "Your society"}
                    </Text>
                    <Text className="mt-1 text-base text-slate-600">
                      Flat {residence.flat_number ?? "-"}
                      {residence.block ? ` · Block ${residence.block}` : ""}
                    </Text>
                  </View>
                  <StatusPill status={residence.status} />
                </View>
                <Button
                  title="Open this flat"
                  onPress={() => {
                    if (residence.flat_id) {
                      selectResidence(residence.flat_id);
                    }
                  }}
                />
              </Card>
            ))}

            {residences.length === 0 ? (
              <EmptyState
                title="No active residence"
                message="Your account is signed in, but a flat has not been linked yet."
                actionLabel="Refresh"
                onAction={refetch}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
