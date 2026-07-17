export function canManageFlatVisitors(residence?: {
  is_primary?: boolean;
  role?: string | null;
}) {
  return residence?.is_primary === true || residence?.role === "owner";
}
