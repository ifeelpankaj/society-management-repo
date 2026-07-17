import { AuthPublicShell } from "@/features/auth/components/auth-public-shell";
import { LoginCard } from "@/features/auth/login/components/login-card";
import { LoginHero } from "@/features/auth/login/components/login-hero";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Sign in",
  "Sign in to your society management workspace.",
);

export default function LoginPage() {
  return (
    <AuthPublicShell hero={<LoginHero />}>
      <LoginCard />
    </AuthPublicShell>
  );
}
