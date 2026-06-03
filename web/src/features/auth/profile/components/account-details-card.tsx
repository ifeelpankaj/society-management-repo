import { Mail, Phone, ShieldCheck } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { Skeleton } from "@/components/ui/skeleton";

import { ProfileRow } from "./profile-row";

type AccountDetailsCardProps = {
  user:
    | {
        email?: string;
        phone_number?: string;
        email_verified?: boolean;
      }
    | null
    | undefined;
  isLoading: boolean;
  isFetching: boolean;
};

export function AccountDetailsCard({
  user,
  isLoading,
  isFetching,
}: AccountDetailsCardProps) {
  return (
    <SectionCard
      title="Account details"
      description="These details come from your authenticated backend profile."
      contentClassName="space-y-3"
    >
      {isLoading || isFetching ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border bg-background">
          <ProfileRow
            icon={<Mail className="size-4" />}
            label="Email"
            value={user?.email ?? "Not available"}
          />

          <ProfileRow
            icon={<Phone className="size-4" />}
            label="Phone"
            value={user?.phone_number ?? "Not available"}
          />

          <ProfileRow
            icon={<ShieldCheck className="size-4" />}
            label="Verification"
            value={user?.email_verified ? "Verified" : "Pending"}
            accent={user?.email_verified}
          />
        </div>
      )}
    </SectionCard>
  );
}
