import { cn } from "~/lib/utils";
import type { FormErrorProps } from "~/types";

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;
  return (
    <div role="alert" className={cn("rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700", className)}>
      <span className="font-semibold">Error al guardar:</span> {error}
    </div>
  );
}