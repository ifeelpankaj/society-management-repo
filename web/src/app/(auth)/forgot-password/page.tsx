import { AuthPublicShell } from "@/features/auth/components/auth-public-shell";
import { ForgotPasswordCard } from "@/features/auth/forgot-password/components/forgot-password-card";
import { ForgotPasswordHero } from "@/features/auth/forgot-password/components/forgot-password-hero";
import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Forgot password",
  "Reset access to your society management account.",
);

export default function ForgotPasswordPage() {
  return (
    <AuthPublicShell hero={<ForgotPasswordHero />}>
      <ForgotPasswordCard />
    </AuthPublicShell>
  );
}
