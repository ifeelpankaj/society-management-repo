"use client";

import { Eye } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { paths } from "@/lib/routes/paths";

type ResidentRowActionsProps = {
  societyId: number;
  memberId?: number;
};

export function ResidentRowActions({
  societyId,
  memberId,
}: ResidentRowActionsProps) {
  if (!memberId) return null;

  return (
    <div className="flex justify-end">
      <Button
        asChild
        onClick={(event) => event.stopPropagation()}
        size="sm"
        type="button"
        variant="outline"
      >
        <Link href={paths.residentDetail(societyId, memberId)}>
          <Eye className="size-4" />
          View
        </Link>
      </Button>
    </div>
  );
}
