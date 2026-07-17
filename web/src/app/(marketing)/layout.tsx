import { MarketingFooter } from "@/components/layout/marketing-footer";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { RouteGuard } from "@/features/auth/components/route-guard";

type RouteGroupLayoutProps = {
  children: React.ReactNode;
};

export default function MarketingLayout({ children }: RouteGroupLayoutProps) {
  return (
    <RouteGuard mode="guestOrRedirect">
      <div className="min-h-screen bg-background">
        <MarketingHeader />
        {children}
        <MarketingFooter />
      </div>
    </RouteGuard>
  );
}
