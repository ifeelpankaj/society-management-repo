import { Text, View } from "react-native";

type StatusPillProps = {
  status?: string | null;
};

function getStatusClasses(status?: string | null) {
  switch (status) {
    case "active":
    case "approved":
    case "verified":
      return "bg-emerald-50 text-emerald-700";
    case "pending":
    case "trial":
      return "bg-amber-50 text-amber-700";
    case "suspended":
    case "blocked":
    case "rejected":
      return "bg-rose-50 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatStatus(status?: string | null) {
  if (!status) {
    return "Unknown";
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <View className="self-start rounded-full">
      <Text className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(status)}`}>
        {formatStatus(status)}
      </Text>
    </View>
  );
}
