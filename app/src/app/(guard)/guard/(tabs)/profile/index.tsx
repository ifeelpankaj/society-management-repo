import { ProfileScreen } from "@/features/profile/components/profile-screen";
import { useGuardProfileModel } from "@/features/guard/hooks/use-guard-profile-model";

export default function GuardProfileScreen() {
  const model = useGuardProfileModel();
  return <ProfileScreen {...model} />;
}
