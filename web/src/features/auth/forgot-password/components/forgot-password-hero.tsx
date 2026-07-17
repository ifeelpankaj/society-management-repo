import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const recoverySteps = [
  "Send OTP to registered email",
  "Verify the code",
  "Set a stronger password",
];

export function ForgotPasswordHero() {
  return (
    <section className="w-full max-w-2xl space-y-8">
      <Button asChild variant="ghost" className="px-0">
        <Link href="/login">
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </Button>

      <div className="space-y-4">
        <Badge
          variant="outline"
          className="h-7 gap-2 rounded-full bg-card/70 px-3"
        >
          <ShieldCheck className="size-3.5 text-primary" />
          Account recovery
        </Badge>

        <h1 className="font-semibold text-4xl text-balance leading-tight md:text-6xl">
          Reset access without slowing daily operations.
        </h1>

        <p className="max-w-xl text-muted-foreground text-base leading-7">
          We will send an OTP to your registered email. Use it as your reset
          code and set a new password.
        </p>
      </div>

      <div className="rounded-lg border border-border/70 bg-background/45 p-2">
        {recoverySteps.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-4 rounded-md px-3 py-3"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-sm">
              {index + 1}
            </span>
            <span className="font-medium text-sm">{step}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/70 bg-card/55 p-4 shadow-sm">
          <MailCheck className="mb-3 size-4 text-primary" />
          <p className="font-medium text-sm">Email verified reset</p>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            Reset starts only from the registered account email.
          </p>
        </div>
        <div className="rounded-lg border border-border/70 bg-card/55 p-4 shadow-sm">
          <KeyRound className="mb-3 size-4 text-primary" />
          <p className="font-medium text-sm">OTP protected</p>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            The reset code is required before a new password is accepted.
          </p>
        </div>
      </div>
    </section>
  );
}
