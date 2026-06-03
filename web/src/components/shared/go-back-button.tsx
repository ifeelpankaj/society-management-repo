"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function GoBackButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      className="rounded-xl"
      onClick={() => router.back()}
    >
      <ArrowLeft className="mr-2 size-4" />
      Go back
    </Button>
  );
}
