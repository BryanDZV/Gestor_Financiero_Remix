import { Icon } from "@iconify/react";
import type { SelectionIndicatorProps } from "~/types";

export function SelectionIndicator({ isSelected, className = "size-6", iconClassName = "size-4" }: SelectionIndicatorProps) {
  return (
    <div className={`flex items-center justify-center rounded-md border-2 transition-colors ${isSelected ? "border-red-500 bg-red-500 text-white" : "border-slate-300 bg-white"} ${className}`}>
      {isSelected && <Icon icon="ph:check-bold" className={iconClassName} />}
    </div>
  );
}