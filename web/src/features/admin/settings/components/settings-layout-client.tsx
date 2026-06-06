"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { paths } from "@/lib/routes/paths";
import { cn } from "@/lib/utils";

type SettingsLayoutClientProps = {
  societyId: number;
  children: ReactNode;
};

const settingsTabs = [
  { label: "General", segment: "settings/visitors" as const },
  { label: "Visitor Settings", segment: "settings/visitors" as const },
];

export function SettingsLayoutClient({
  societyId,
  children,
}: SettingsLayoutClientProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <nav
        aria-label="Settings sections"
        className="flex flex-wrap gap-2 border-border border-b pb-4"
      >
        {settingsTabs.map((tab) => {
          const href = paths.settingsVisitors(societyId);
          const active =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={tab.label}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 font-medium text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
