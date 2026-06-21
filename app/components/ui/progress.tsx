import * as React from "react";
import { cn } from "~/lib/utils";
import type { ProgressProps } from "~/types/components";

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    >
      <div
        className={cn("h-full w-full flex-1 transition-all duration-700 ease-out bg-slate-900", indicatorClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value || 0))}%` }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };