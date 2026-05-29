import { Button } from "~/components/ui/button";
import { Icon } from "@iconify/react";
import { DeleteConfirm } from "~/components/ui/delete-confirm";
import type { MultiSelectActionsProps } from "~/types";

export function MultiSelectActions({
  isDeleteMode,
  selectedCount,
  totalCount,
  onToggleMode,
  onSelectAll,
  onClearSelection,
  onDelete,
  itemName = "elemento(s)",
  children
}: MultiSelectActionsProps) {
  if (isDeleteMode) {
    return (
      <>
        <Button type="button" onClick={() => selectedCount === totalCount ? onClearSelection() : onSelectAll()} variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700">
          <Icon icon="ph:check-square-offset" className="mr-2 size-4" />
          <span className="hidden sm:inline">{selectedCount === totalCount ? "Deseleccionar" : "Seleccionar todo"}</span>
        </Button>
        <Button type="button" onClick={() => { onToggleMode(false); onClearSelection(); }} variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700">
          Cancelar
        </Button>
        <DeleteConfirm text={`¿Eliminar ${selectedCount} ${itemName}?`} onConfirm={onDelete} trigger={(onClick) => (
          <Button type="button" onClick={onClick} disabled={selectedCount === 0} className="rounded-xl bg-red-600 text-white hover:bg-red-700">
            <Icon icon="ph:trash" className="mr-2 size-4" />
            Borrar ({selectedCount})
          </Button>
        )} />
      </>
    );
  }

  return (
    <>
      {totalCount > 0 && (
        <Button type="button" onClick={() => onToggleMode(true)} variant="outline" className="rounded-xl border-slate-200 bg-white text-slate-700 hover:text-red-600 hover:bg-red-50">
          <Icon icon="ph:trash" className="mr-2 size-4" /> Eliminar
        </Button>
      )}
      {children}
    </>
  );
}