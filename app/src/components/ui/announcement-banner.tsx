import { Text, View } from "react-native";

import { theme } from "@/lib/theme";

type AnnouncementBannerProps = {
  message?: string;
  title?: string;
};

export function AnnouncementBanner({
  message = "AGM Meeting Today at 7 PM",
  title = "Society Announcement",
}: AnnouncementBannerProps) {
  return (
    <View
      className="rounded-[18px] px-4 py-3.5"
      style={{
        backgroundColor: theme.announcement.bg,
      }}
    >
      <Text
        className="text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: theme.announcement.text, opacity: 0.75 }}
      >
        {title}
      </Text>
      <Text
        className="mt-1 text-[15px] font-semibold leading-5"
        style={{ color: theme.announcement.text }}
      >
        {message}
      </Text>
    </View>
  );
}
