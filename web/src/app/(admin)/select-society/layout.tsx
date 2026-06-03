import type { ReactNode } from "react";

import { createPageMetadata } from "@/lib/site-metadata";

export const metadata = createPageMetadata(
  "Select society",
  "Choose which society workspace to open.",
);

export default function SelectSocietyLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
