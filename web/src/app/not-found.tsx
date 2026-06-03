import { ArrowLeft, Home, SearchX } from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <PageShell
      size="full"
      className="min-h-screen items-center justify-center bg-background"
    >
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <SearchX className="size-5" />
        </div>

        <p className="mb-3 font-medium text-muted-foreground text-sm">
          404 / Page not found
        </p>
        <h1 className="max-w-lg font-semibold text-3xl tracking-normal text-balance text-foreground">
          This page does not exist
        </h1>
        <p className="mt-4 max-w-md text-muted-foreground text-sm leading-6">
          The page you are looking for may have moved, been removed, or never
          existed.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="size-4" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="..">
              <ArrowLeft className="size-4" />
              Go back
            </Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
