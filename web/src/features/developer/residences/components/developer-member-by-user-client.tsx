"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AsyncPanel } from "@/components/shared/async-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { WorkspacePage } from "@/components/shared/workspace-page";
import { Button } from "@/components/ui/button";
import { SocietyMemberDetail } from "@/features/members";
import {
  useGetV1SocietiesBySocietyIdAllmemberQuery,
  useGetV1SocietiesBySocietyIdQuery,
} from "@/lib/api/generated-api";
import { paths } from "@/lib/routes/paths";

type DeveloperMemberByUserClientProps = {
  societyId: number;
  userId: number;
};

export function DeveloperMemberByUserClient({
  societyId,
  userId,
}: DeveloperMemberByUserClientProps) {
  const membersQuery = useGetV1SocietiesBySocietyIdAllmemberQuery({
    societyId,
    userId,
    limit: 1,
    offset: 0,
  });
  const societyQuery = useGetV1SocietiesBySocietyIdQuery({ societyId });

  const memberId = useMemo(() => {
    const items = membersQuery.data?.data?.members?.items ?? [];
    return items.find((member) => member.user_id === userId)?.id;
  }, [membersQuery.data, userId]);

  const societyName = societyQuery.data?.data?.society?.name;

  if (membersQuery.isLoading) {
    return (
      <WorkspacePage size="narrow" mainClassName="space-y-0">
        <AsyncPanel loading loadingLabel="Resolving member">
          {null}
        </AsyncPanel>
      </WorkspacePage>
    );
  }

  if (!memberId) {
    return (
      <WorkspacePage size="narrow" mainClassName="space-y-0">
        <EmptyState
          action={
            <Button asChild type="button" variant="outline">
              <Link href={paths.developerResidences()}>Back to residences</Link>
            </Button>
          }
          description="This user may not be a society member yet."
          title="Member not found"
        />
      </WorkspacePage>
    );
  }

  return (
    <SocietyMemberDetail
      backHref={paths.developerResidences()}
      backLabel="Residences"
      flatDetailHref={(flatId) => paths.developerFlatDetail(societyId, flatId)}
      memberId={memberId}
      societyId={societyId}
      societyName={societyName}
    />
  );
}
