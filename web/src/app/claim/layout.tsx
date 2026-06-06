import { Building2 } from "lucide-react";
import Link from "next/link";

export default function ClaimLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link
            className="flex items-center gap-2 font-heading font-semibold text-sm"
            href="/"
          >
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Building2 className="size-4" />
            </span>
            Gatezy
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
