import { MarketingHeader } from "@/components/layout/marketing-header";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <MarketingHeader />
      {children}
    </div>
  );
}
