import * as React from "react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import type { SubmitButtonProps } from "~/types/components";

export function SubmitButton({ isSubmitting, loadingText = "Guardando...", className, children, ...props }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || props.disabled}
      className={cn("h-11 w-full rounded-xl bg-blue-600 text-white shadow-sm hover:bg-blue-700", className)}
      {...props}
    >
      {isSubmitting ? loadingText : children}
    </Button>
  );
}