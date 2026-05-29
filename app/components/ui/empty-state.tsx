import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { EmptyStateProps } from "~/types";

export function EmptyState({ message, children, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-8 text-center text-slate-500">
        {message || children}
      </CardContent>
    </Card>
  );
}