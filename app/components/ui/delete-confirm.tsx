import { useState } from "react";
import { Icon } from "@iconify/react";
import type { DeleteConfirmProps } from "~/types";

export function DeleteConfirm({ onConfirm, text = "¿Eliminar?", trigger, children }: DeleteConfirmProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="flex items-center gap-1 rounded-md border border-red-100 bg-red-50 px-2 py-1">
        <span className="mr-1 hidden text-xs font-semibold text-red-600 sm:inline">{text}</span>
        
        {onConfirm ? (
          <button 
            type="button" 
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation();
              onConfirm(); 
              setIsConfirming(false); 
            }} 
            className="rounded p-1 text-red-600 transition-colors hover:bg-red-100" 
            title="Sí, confirmar"
          >
            <Icon icon="ph:check-bold" className="size-4" />
          </button>
        ) : (
          <div onClick={() => setIsConfirming(false)}>
            {children}
          </div>
        )}
        
        <button 
          type="button" 
          onClick={(e) => { 
            e.preventDefault();
            e.stopPropagation(); 
            setIsConfirming(false); 
          }} 
          className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-200" 
          title="Cancelar"
        >
          <Icon icon="ph:x-bold" className="size-4" />
        </button>
      </div>
    );
  }

  if (trigger) {
    return <>{trigger(() => setIsConfirming(true))}</>;
  }

  // Botón por defecto (papelera pequeña) si no se provee un "trigger" personalizado
  return (
    <button 
      type="button" 
      onClick={(e) => { 
        e.preventDefault();
        e.stopPropagation(); 
        setIsConfirming(true); 
      }} 
      className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600" 
      title="Eliminar"
    >
      <Icon icon="ph:trash" className="size-4" />
    </button>
  );
}