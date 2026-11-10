import type { ReactNode } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconSvgElement;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-card/40 px-6 py-16 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
        <HugeiconsIcon icon={icon} className="size-6" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-destructive/15 text-destructive">
        <HugeiconsIcon icon={Alert02Icon} className="size-6" strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold">Couldn't load data</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-6" onClick={onRetry}>
          <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} data-icon="inline-start" />
          Try again
        </Button>
      )}
    </div>
  );
}
