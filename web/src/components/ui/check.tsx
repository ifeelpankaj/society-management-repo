import Image from "next/image";
import check from "@/icons/check.png";
import cross from "@/icons/cross.png";
import { cn } from "@/lib/utils";

type CheckProps = {
  valid: boolean | null;
  className?: string;
};

function Check({ valid, className }: CheckProps) {
  if (valid === null) return null;

  return (
    <span
      aria-hidden="true"
      style={{ right: "1rem" }}
      className={cn(
        "pointer-events-none absolute top-1/2 z-10 flex size-4 -translate-y-1/2 select-none items-center justify-center",
        className,
      )}
    >
      <Image
        src={valid ? check : cross}
        alt=""
        className="size-4 object-contain"
      />
    </span>
  );
}

export { Check, type CheckProps };
