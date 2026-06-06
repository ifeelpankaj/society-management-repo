import { Building2, Clipboard, KeyRound, MapPin } from "lucide-react";

import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ProfileRow } from "./profile-row";

type SocietyDetailsCardProps = {
  society:
    | {
        name?: string;
        society_code?: string;
        address?: string;
        city?: string;
        state?: string;
        pin_code?: string;
      }
    | null
    | undefined;
  isFetchingSociety: boolean;
  claimLink: string;
  host: string;
  qrUrl: string;
  onCopyLink: () => void;
};

export function SocietyDetailsCard({
  society,
  isFetchingSociety,
  claimLink,
  host,
  qrUrl,
  onCopyLink,
}: SocietyDetailsCardProps) {
  return (
    <SectionCard
      title="Society details"
      description="Use the code and claim link for public resident flat claims."
      contentClassName="space-y-5"
    >
      {isFetchingSociety ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : society ? (
        <>
          <div className="divide-y divide-border rounded-lg border border-border bg-background">
            <ProfileRow
              icon={<Building2 className="size-4" />}
              label="Society"
              value={society.name ?? "Not available"}
            />

            <ProfileRow
              icon={<KeyRound className="size-4" />}
              label="Society code"
              value={society.society_code ?? "Not generated"}
            />

            <ProfileRow
              icon={<KeyRound className="size-4" />}
              label="Current host"
              value={host || "Not available"}
            />

            <ProfileRow
              icon={<MapPin className="size-4" />}
              label="Address"
              value={[
                society.address,
                society.city,
                society.state,
                society.pin_code,
              ]
                .filter(Boolean)
                .join(", ")}
            />
          </div>

          {claimLink ? (
            <div className="grid gap-4 rounded-lg border border-border bg-background p-4 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="rounded-md border border-border bg-white p-3">
                {/* biome-ignore lint/performance/noImgElement: external QR endpoint is a generated image and next/image needs remote config */}
                <img
                  src={qrUrl}
                  alt={`QR code for ${society.name ?? "society"} claim link`}
                  className="size-44"
                />
              </div>

              <div className="min-w-0 space-y-3">
                <div>
                  <h3 className="font-semibold text-base">Resident claim QR</h3>

                  <p className="mt-1 text-muted-foreground text-sm leading-6">
                    Scanning this opens the public claim page for this society.
                  </p>
                </div>

                <p className="break-all rounded-md bg-muted px-3 py-2 text-muted-foreground text-xs">
                  {claimLink}
                </p>

                <Button onClick={onCopyLink} type="button" variant="outline">
                  <Clipboard className="size-4" />
                  Copy link
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="rounded-lg border border-border bg-background p-4 text-muted-foreground text-sm">
          Society details are not assigned to this account yet.
        </p>
      )}
    </SectionCard>
  );
}
