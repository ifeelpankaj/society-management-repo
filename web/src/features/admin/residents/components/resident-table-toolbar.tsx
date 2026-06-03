"use client";

import { ListToolbar } from "@/components/data/list-toolbar";
import { FilterSelect } from "@/components/forms/filter-select";
import { SearchInput } from "@/components/shared/search-input";
import type {
  ModelsSocietyMemberRole,
  ModelsSocietyMemberStatus,
} from "@/lib/api/generated-api";

export function ResidentTableToolbar({
  search,
  role,
  status,
  onSearchChange,
  onRoleChange,
  onStatusChange,
}: {
  search: string;
  role: ModelsSocietyMemberRole | "all";
  status: ModelsSocietyMemberStatus | "all";
  onSearchChange: (value: string) => void;
  onRoleChange: (value: ModelsSocietyMemberRole | "all") => void;
  onStatusChange: (value: ModelsSocietyMemberStatus | "all") => void;
}) {
  return (
    <ListToolbar className="border-0 bg-transparent p-0 sm:flex-nowrap xl:grid xl:grid-cols-[minmax(240px,1fr)_150px_160px]">
      <SearchInput
        aria-label="Search members"
        className="min-w-[220px]"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search members"
        value={search}
      />
      <FilterSelect
        aria-label="Filter by role"
        onChange={(event) =>
          onRoleChange(event.target.value as ModelsSocietyMemberRole | "all")
        }
        options={[
          { label: "All roles", value: "all" },
          { label: "Owner", value: "owner" },
          { label: "Admin", value: "admin" },
          { label: "Staff", value: "staff" },
          { label: "Resident", value: "resident" },
        ]}
        value={role}
      />
      <FilterSelect
        aria-label="Filter by status"
        onChange={(event) =>
          onStatusChange(
            event.target.value as ModelsSocietyMemberStatus | "all",
          )
        }
        options={[
          { label: "All statuses", value: "all" },
          { label: "Pending", value: "pending" },
          { label: "Active", value: "active" },
          { label: "Suspended", value: "suspended" },
          { label: "Removed", value: "removed" },
        ]}
        value={status}
      />
    </ListToolbar>
  );
}
