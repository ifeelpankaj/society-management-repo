"use client";

import {
  Building2,
  ClipboardList,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAdminSocietySession } from "@/features/admin/society/hooks/use-admin-society";
import { getSocietyDashboardRoute } from "@/features/auth/auth-routing";
import { clearClientSession } from "@/features/auth/logout";
import { usePostV1AuthLogoutMutation } from "@/lib/api/generated-api";
import { getApiErrorMessage, getApiMessage } from "@/lib/api-message";
import { appConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/store";

const navGroups = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", segment: "", icon: LayoutDashboard }],
  },
  {
    label: "Community",
    items: [
      { label: "Flats", segment: "flats", icon: Home },
      { label: "Residents", segment: "residents", icon: UsersRound },
      { label: "Claims", segment: "claims", icon: ClipboardList },
    ],
  },
];

function getSidebarItemHref(societyId: number, segment: string) {
  const dashboardRoute = getSocietyDashboardRoute(societyId);
  return segment ? `${dashboardRoute}/${segment}` : dashboardRoute;
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 rounded-md border border-border bg-muted/40" />;
  }

  const options = [
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-1 rounded-md border border-border bg-muted/45 p-1">
      {options.map((option) => {
        const Icon = option.icon;
        const active = theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "flex h-8 items-center justify-center gap-2 rounded-[6px] font-medium text-xs transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function AppSidebar({ societyId }: { societyId?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [logout, { isLoading }] = usePostV1AuthLogoutMutation();
  const user = useAppSelector((state) => state.auth.user);
  const {
    allowedMemberships,
    changeSelectedSociety,
    isStaff,
    selectedMembershipRole,
    selectedSociety,
    selectedSocietyId,
  } = useAdminSocietySession({ selectedSocietyId: societyId });
  const userName = mounted
    ? (user?.full_name ?? user?.email ?? "Profile")
    : "Profile";
  const roleLabel = mounted
    ? (selectedMembershipRole ?? user?.global_role)
    : "Account";
  const activeSocietyId = selectedSocietyId ?? null;
  const scopedNavGroups = activeSocietyId
    ? navGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          href: getSidebarItemHref(activeSocietyId, item.segment),
        })),
      }))
    : [];
  const staffNavHrefs = activeSocietyId
    ? [
        getSidebarItemHref(activeSocietyId, ""),
        getSidebarItemHref(activeSocietyId, "flats"),
        getSidebarItemHref(activeSocietyId, "claims"),
      ]
    : [];
  const visibleNavGroups = scopedNavGroups
    .map((group) => ({
      ...group,
      items: isStaff
        ? group.items.filter((item) => staffNavHrefs.includes(item.href))
        : group.items,
    }))
    .filter((group) => group.items.length > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const toastId = toast.loading("Signing you out...");

    try {
      const response = await logout().unwrap();
      clearClientSession(dispatch);
      toast.success(getApiMessage(response, "Signed out successfully."), {
        id: toastId,
      });
      router.replace("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not sign out."), {
        id: toastId,
      });
    }
  };

  return (
    <aside className="sticky top-0 flex h-dvh w-72 shrink-0 flex-col overflow-hidden border-border/80 border-r bg-sidebar bg-[radial-gradient(circle_at_top_left,var(--muted)_0,transparent_36%)] shadow-[12px_0_32px_color-mix(in_oklch,var(--foreground)_7%,transparent)]">
      <div className="flex h-16 items-center gap-3 border-border/80 border-b px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Building2 className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-sm">{appConfig.logoText}</p>
          <p className="text-muted-foreground text-xs">
            Society command center
          </p>
        </div>
      </div>

      <div className="space-y-2 border-border/80 border-b px-3 py-4">
        <label
          htmlFor="admin-society"
          className="px-1 font-semibold text-[0.68rem] text-muted-foreground uppercase tracking-[0.14em]"
        >
          Society
        </label>
        <select
          id="admin-society"
          value={selectedSocietyId ?? ""}
          onChange={(event) => {
            const nextSocietyId = Number(event.target.value);
            changeSelectedSociety(nextSocietyId);
          }}
          className="h-10 w-full rounded-md border border-border bg-background/86 px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-ring/20"
          disabled={allowedMemberships.length <= 1}
        >
          {allowedMemberships.map((membership) => {
            const societyId =
              membership.society?.id ?? membership.member?.society_id;
            return (
              <option key={societyId} value={societyId}>
                {membership.society?.name ?? `Society #${societyId}`}
              </option>
            );
          })}
        </select>
        <p className="truncate px-1 text-muted-foreground text-xs">
          {selectedSociety?.society_code ?? "Selected workspace"}
        </p>
      </div>

      <nav className="scrollbar-none min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {visibleNavGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            <p className="px-3 font-semibold text-[0.68rem] text-muted-foreground uppercase tracking-[0.14em]">
              {group.label}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-sm transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {active ? (
                    <span className="ml-auto size-1.5 rounded-full bg-primary-foreground/80" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-3 border-border/80 border-t bg-sidebar/95 p-3 backdrop-blur">
        <SidebarThemeToggle />
        <Button
          asChild
          variant="outline"
          className="h-auto w-full justify-start gap-3 py-2"
        >
          <Link href="/profile">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-[0.68rem] text-primary">
              {getInitials(userName)}
            </span>
            <span className="min-w-0">
              <span className="block truncate">{userName}</span>
              <span className="block truncate text-muted-foreground text-xs">
                {roleLabel ?? "Account"}
              </span>
            </span>
          </Link>
        </Button>
        <Button
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          disabled={isLoading}
          onClick={handleLogout}
          type="button"
          variant="ghost"
        >
          <LogOut className="size-4" />
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}

export { AppSidebar };
