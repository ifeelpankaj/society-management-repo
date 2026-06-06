"use client";

import { FilterPanel } from "@/components/data/filter-panel";
import { ListToolbar } from "@/components/data/list-toolbar";
import { FilterSelect } from "@/components/forms/filter-select";
import { SearchInput } from "@/components/shared/search-input";
import { Input } from "@/components/ui/input";
import type {
  ModelsSocietyMemberRole,
  ModelsSocietyMemberStatus,
} from "@/lib/api/generated-api";

export function ResidentTableToolbar({
  search,
  searchMode,
  role,
  status,
  joinedFrom,
  joinedTo,
  sortBy,
  sortOrder,
  onSearchChange,
  onSearchModeChange,
  onRoleChange,
  onStatusChange,
  onJoinedFromChange,
  onJoinedToChange,
  onSortByChange,
  onSortOrderChange,
}: {
  search: string;
  searchMode: string;
  role: ModelsSocietyMemberRole | "all";
  status: ModelsSocietyMemberStatus | "all";
  joinedFrom: string;
  joinedTo: string;
  sortBy: "all" | "joined_at" | "role" | "status";
  sortOrder: "all" | "asc" | "desc";
  onSearchChange: (value: string) => void;
  onSearchModeChange: (value: string) => void;
  onRoleChange: (value: ModelsSocietyMemberRole | "all") => void;
  onStatusChange: (value: ModelsSocietyMemberStatus | "all") => void;
  onJoinedFromChange: (value: string) => void;
  onJoinedToChange: (value: string) => void;
  onSortByChange: (value: "all" | "joined_at" | "role" | "status") => void;
  onSortOrderChange: (value: "all" | "asc" | "desc") => void;
}) {
  return (
    <div className="space-y-3">
      <ListToolbar className="border-0 bg-transparent p-0 lg:grid lg:grid-cols-[minmax(220px,1fr)_160px_150px_160px]">
        <SearchInput
          aria-label="Search members"
          className="min-w-[220px]"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search members"
          value={search}
        />
        <FilterSelect
          aria-label="Search members by"
          onChange={(event) => onSearchModeChange(event.target.value)}
          options={[
            { label: "All fields", value: "all" },
            { label: "Resident", value: "resident" },
            { label: "Invited by", value: "invited_by" },
            { label: "Removed by", value: "removed_by" },
          ]}
          value={searchMode}
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
            { label: "All status", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Active", value: "active" },
            { label: "Suspended", value: "suspended" },
            { label: "Removed", value: "removed" },
          ]}
          value={status}
        />
      </ListToolbar>
      <FilterPanel>
        <Input
          aria-label="Filter by joined from"
          onChange={(event) => onJoinedFromChange(event.target.value)}
          placeholder="Joined from"
          value={joinedFrom}
        />
        <Input
          aria-label="Filter by joined to"
          onChange={(event) => onJoinedToChange(event.target.value)}
          placeholder="Joined to"
          value={joinedTo}
        />
        <FilterSelect
          aria-label="Sort members by"
          onChange={(event) =>
            onSortByChange(
              event.target.value as "all" | "joined_at" | "role" | "status",
            )
          }
          options={[
            { label: "Default sort", value: "all" },
            { label: "Joined", value: "joined_at" },
            { label: "Role", value: "role" },
            { label: "Status", value: "status" },
          ]}
          value={sortBy}
        />
        <FilterSelect
          aria-label="Sort order"
          onChange={(event) =>
            onSortOrderChange(event.target.value as "all" | "asc" | "desc")
          }
          options={[
            { label: "Default", value: "all" },
            { label: "Ascending", value: "asc" },
            { label: "Descending", value: "desc" },
          ]}
          value={sortOrder}
        />
      </FilterPanel>
    </div>
  );
}
