export const ROLE_LABELS = {
  developer: "Developer",
  super_admin: "Super admin",
  admin: "Admin",
  staff: "Staff",
  resident: "Resident",
  user: "User",
} as const;

export type RoleKey = keyof typeof ROLE_LABELS;

export const ROLE_STYLES = {
  developer:
    "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
  super_admin:
    "border-primary/20 bg-primary/10 text-primary dark:text-primary-foreground",
  admin: "border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  staff:
    "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  resident:
    "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
  user: "border-muted-foreground/20 bg-muted text-muted-foreground",
} as const satisfies Record<RoleKey, string>;
