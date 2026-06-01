import { useEffect, useRef } from "react";
import { toast } from "sonner";

import type { AccountActionData, AccountFeedbackEvent } from "~/types";

interface UseAccountActionFeedbackParams {
  actionData?: AccountActionData;
  actionError?: string;
  isSubmitting: boolean;
  onFeedback?: (event: AccountFeedbackEvent) => void;
}

function getSuccessMessage(actionData: AccountActionData) {
  if (actionData.message) return actionData.message;

  switch (actionData.intent) {
    case "add_transaction":
      return "Movimiento registrado correctamente.";
    case "transfer_transaction":
      return "Transferencia registrada correctamente.";
    case "split_transaction":
      return "Movimiento dividido correctamente.";
    case "edit_transaction":
      return "Movimiento actualizado correctamente.";
    case "delete_transactions":
      return "Movimientos eliminados correctamente.";
    case "import_file":
      return `Importacion completada: ${actionData.count || 0} movimientos procesados.`;
    case "create_cycle":
      return "Ciclo creado correctamente.";
    case "close_cycle":
      return "Ciclo cerrado correctamente.";
    case "open_cycle":
      return "Ciclo reabierto correctamente.";
    case "delete_cycle":
      return "Ciclo eliminado correctamente.";
    case "delete_cycles":
      return "Ciclos eliminados correctamente.";
    default:
      return "Operacion completada correctamente.";
  }
}

export function useAccountActionFeedback({ actionData, actionError, isSubmitting, onFeedback }: UseAccountActionFeedbackParams) {
  const lastToastKeyRef = useRef<string>("");

  useEffect(() => {
    if (isSubmitting) return;

    const currentKey = JSON.stringify({
      actionError,
      success: actionData?.success,
      error: actionData?.error,
      warning: actionData?.warning,
      intent: actionData?.intent,
      count: actionData?.count,
      message: actionData?.message,
    });

    if (currentKey === lastToastKeyRef.current) return;

    if (actionError) {
      toast.error(actionError);
      onFeedback?.({ severity: "error", message: actionError, intent: actionData?.intent });
      lastToastKeyRef.current = currentKey;
      return;
    }

    if (actionData?.error) {
      toast.error(actionData.error);
      onFeedback?.({ severity: "error", message: actionData.error, intent: actionData.intent });
      lastToastKeyRef.current = currentKey;
      return;
    }

    if (actionData?.warning) {
      toast.warning(actionData.warning, { duration: 8000 });
      onFeedback?.({ severity: "warning", message: actionData.warning, intent: actionData.intent });
      lastToastKeyRef.current = currentKey;
      return;
    }

    if (actionData?.success) {
      const successMessage = getSuccessMessage(actionData);
      toast.success(successMessage);
      onFeedback?.({ severity: "success", message: successMessage, intent: actionData.intent });
      lastToastKeyRef.current = currentKey;
    }
  }, [isSubmitting, actionData, actionError, onFeedback]);
}
