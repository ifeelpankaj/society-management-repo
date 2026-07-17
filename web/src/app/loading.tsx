import { AppLoader } from "@/components/shared/app-loader";
import { PageShell } from "@/components/shared/page-shell";

export default function LoadingPage() {
  return (
    <PageShell
      size="full"
      className="min-h-screen items-center justify-center bg-background"
    >
      <AppLoader
        label="Loading dashboard"
        description="Syncing data and preparing your workspace."
      />
    </PageShell>
  );
}
