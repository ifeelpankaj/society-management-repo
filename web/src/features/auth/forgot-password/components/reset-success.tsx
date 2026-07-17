import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ResetSuccess() {
  return (
    <div className="space-y-7 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/20 dark:text-emerald-300">
        <CheckCircle2 className="size-6" />
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold text-2xl">Password reset</h2>
        <p className="text-muted-foreground text-sm leading-6">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
      </div>

      <Button asChild className="h-11 w-full">
        <Link href="/login">
          Continue to login
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
