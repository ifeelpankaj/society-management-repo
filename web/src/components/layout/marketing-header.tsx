"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/theme/theme-toggle";

const marketingNavItems = [
  { label: "Demo", href: "/#demo" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
];

function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-border/70 border-b bg-background/90 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 sm:px-6">
      <div className="flex h-16 w-full items-center justify-between gap-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2 transition-opacity hover:opacity-85"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Building2 className="size-4" />
          </span>
          <span className="font-semibold text-foreground">
            {appConfig.logoText}
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden md:flex">
          <ul className="flex items-center gap-6 text-sm">
            {marketingNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-muted-foreground transition-colors hover:text-foreground",
                    pathname === item.href && "text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ModeToggle className="h-8 w-[4.75rem]" />
          </div>

          <Button
            asChild
            size="sm"
            variant="ghost"
            className="hidden sm:inline-flex"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/get-started">Get started</Link>
          </Button>
        </div>
      </div>

      <nav aria-label="Mobile navigation" className="pb-3 md:hidden">
        <ul className="flex items-center gap-1 overflow-x-auto border-border/70 border-t pt-3">
          {marketingNavItems.map((item) => (
            <li key={item.href}>
              <Button asChild size="sm" variant="ghost">
                <Link href={item.href}>{item.label}</Link>
              </Button>
            </li>
          ))}
          <li className="ml-auto">
            <ModeToggle className="h-8 w-[4.75rem]" />
          </li>
        </ul>
      </nav>
    </header>
  );
}

export { MarketingHeader };
