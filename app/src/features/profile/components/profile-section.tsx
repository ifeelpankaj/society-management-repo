import type { ReactNode } from "react";
import { View } from "react-native";

import { Card, SectionHeader } from "@/components/ui";

type ProfileSectionProps = {
  children: ReactNode;
  title: string;
};

export function ProfileSection({ children, title }: ProfileSectionProps) {
  return (
    <View className="gap-2.5">
      <SectionHeader title={title} />
      <Card className="!p-0 overflow-hidden">{children}</Card>
    </View>
  );
}
