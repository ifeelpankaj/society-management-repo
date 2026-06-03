import { AppLoader } from "@/components/shared/app-loader";
import { PageShell } from "@/components/shared/page-shell";

export default function SocietyDashboardLoading() {
  return (
    <PageShell size="full" className="min-h-[60vh] items-center justify-center">
      <AppLoader
        label="Loading society dashboard"
        description="Syncing data and preparing your workspace."
      />
    </PageShell>
  );
}
