import { Text, View } from "react-native";

import { Badge } from "./badge";
import { Card } from "./card";

type ProfileHeroProps = {
  name: string;
  subtitle?: string;
  email?: string | null;
  badge?: string;
};

export function ProfileHero({ name, subtitle, email, badge }: ProfileHeroProps) {
  return (
    <Card className="gap-4 bg-slate-950">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <Text className="text-sm font-bold uppercase tracking-widest text-teal-200">Profile</Text>
          <Text className="text-3xl font-black text-white">{name}</Text>
          {subtitle ? <Text className="text-sm text-slate-300">{subtitle}</Text> : null}
          {email ? <Text className="text-sm text-slate-400">{email}</Text> : null}
        </View>
        {badge ? <Badge label={badge} tone="emerald" /> : null}
      </View>
    </Card>
  );
}
