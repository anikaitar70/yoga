import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-sm border border-dashed border-border bg-card/50 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="font-display text-xl font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
      {actionLabel && actionHref ? (
        <div className="mt-8">
          <Button href={actionHref} variant="secondary">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
