"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

type SocietyDashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SocietyDashboardError({
  error,
  reset,
}: SocietyDashboardErrorProps) {
  useEffect(() => {
    console.error("Society dashboard error:", error);
  }, [error]);

  return (
    <PageShell size="full" className="min-h-[60vh] items-center justify-center">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="size-5" />
        </div>

        <p className="mb-3 font-medium text-muted-foreground text-sm">
          Something went wrong
        </p>
        <h1 className="max-w-lg font-semibold text-3xl tracking-normal text-balance text-foreground">
          We could not load this page
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground text-sm leading-6">
          An unexpected error interrupted this screen. Try again, or return to
          the dashboard.
        </p>

        {error.digest ? (
          <p className="mt-5 rounded-md bg-muted px-3 py-2 text-muted-foreground text-xs">
            Error ID: {error.digest}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button onClick={reset}>
            <RefreshCcw className="size-4" />
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <Home className="size-4" />
              Go to dashboard
            </Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
