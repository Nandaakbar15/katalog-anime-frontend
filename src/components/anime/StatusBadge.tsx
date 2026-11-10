import type { AnimeStatus } from "@/lib/api";
import { STATUS_LABEL, STATUS_STYLE } from "@/lib/anime";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: AnimeStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 backdrop-blur",
        STATUS_STYLE[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full bg-current", status === "RELEASING" && "animate-pulse")} />
      {STATUS_LABEL[status]}
    </span>
  );
}
