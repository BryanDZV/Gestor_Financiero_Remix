import React, { useState } from "react";
import { Icon } from "@iconify/react";

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Collapsible({ title, defaultOpen = false, children, className = "" }: CollapsibleProps) {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <details open={defaultOpen} onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)} className={`group ${className}`}>
      <summary className="flex items-center justify-between cursor-pointer py-3 px-4 bg-slate-50 rounded-lg border border-slate-100">
        <span className="font-semibold text-slate-800">{title}</span>
        <Icon icon={open ? "ph:chevron-up" : "ph:chevron-down"} className="size-5 text-slate-500" />
      </summary>
      <div className="mt-3">
        {children}
      </div>
    </details>
  );
}

export default Collapsible;
