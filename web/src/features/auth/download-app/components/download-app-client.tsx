"use client";

import { LogOut, Smartphone } from "lucide-react";
import Link from "next/link";

import { AppLoader } from "@/components/shared/app-loader";
import { PageShell } from "@/components/shared/page-shell";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDownloadAppPage } from "@/features/auth/download-app/hooks/use-download-app-page";
import { appConfig } from "@/lib/config";

export function DownloadAppClient() {
  const { roleLabel, isLoading, isLoggingOut, handleLogout } =
    useDownloadAppPage();

  if (isLoading) {
    return (
      <AppLoader
        description="Preparing your mobile download options."
        label="Loading"
      />
    );
  }

  return (
    <PageShell background="subtle" size="default">
      <Card className="mx-auto mt-10 w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
            <Smartphone className="size-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Gatezy is built for mobile</CardTitle>
          <CardDescription className="text-base">
            As a {roleLabel.toLowerCase()}, use the {appConfig.logoText} mobile
            app for visitors, approvals, and day-to-day society access.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild className="h-11 w-full" size="lg">
              <Link
                href={appConfig.playStoreUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Get it on Google Play
              </Link>
            </Button>
            <Button
              asChild
              className="h-11 w-full"
              size="lg"
              variant="outline"
            >
              <Link
                href={appConfig.appStoreUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Download on App Store
              </Link>
            </Button>
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Society admin tools stay on the web. Your role is mobile-only.
          </p>
          <Button
            className="w-full"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
            variant="ghost"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </PageShell>
  );
}
