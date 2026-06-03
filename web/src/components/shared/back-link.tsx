"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href?: string;
  label?: string;
  className?: string;
};

function BackLink({ href, label = "Back", className }: BackLinkProps) {
  const router = useRouter();

  if (href) {
    return (
      <Button asChild className={cn("rounded-xl", className)} variant="outline">
        <Link href={href}>
          <ArrowLeft className="mr-2 size-4" />
          {label}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      className={cn("rounded-xl", className)}
      onClick={() => router.back()}
      type="button"
      variant="outline"
    >
      <ArrowLeft className="mr-2 size-4" />
      {label}
    </Button>
  );
}

export { BackLink, type BackLinkProps };
