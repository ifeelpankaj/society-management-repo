import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, ROLE_STYLES, type RoleKey } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";

type RoleBadgeProps = {
  role: RoleKey;
  className?: string;
};

function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge variant="outline" className={cn(ROLE_STYLES[role], className)}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}

export { RoleBadge, type RoleBadgeProps };
