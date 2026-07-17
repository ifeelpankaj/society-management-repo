import { AppLoader } from "@/components/shared/app-loader";
import { PageShell } from "@/components/shared/page-shell";

export default function DeveloperLoading() {
  return (
    <PageShell size="full" className="min-h-[60vh] items-center justify-center">
      <AppLoader
        label="Loading developer workspace"
        description="Preparing developer tools and data."
      />
    </PageShell>
  );
}
