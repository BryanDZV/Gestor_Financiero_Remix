import { cn } from "~/lib/utils";
import type { PageHeaderProps } from "~/types";

export function PageHeader({ title, description, supertitle, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {supertitle && <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{supertitle}</p>}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description && <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
    </div>
  );
}