import { Icon } from "@iconify/react";
import type { SortToggleProps } from "./sort-toggle.types";

export function SortToggle({
  label,
  icon,
  sortOrder,
  onToggle,
  descText = "Más recientes",
  ascText = "Más antiguos",
}: SortToggleProps) {
  return (
    <div className="flex h-8 items-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex h-full items-center border-r border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-500" title={`Orden de ${label}`}>
        <Icon icon={icon} className="mr-1.5 size-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className="h-full px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 flex items-center"
      >
        <Icon icon={sortOrder === "desc" ? "ph:sort-descending" : "ph:sort-ascending"} className="mr-1.5 size-3.5 text-slate-400" />
        {sortOrder === "desc" ? descText : ascText}
      </button>
    </div>
  );
}