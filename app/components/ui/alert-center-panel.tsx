import { Bell, CheckCircle2, AlertTriangle, CircleX, Info, X, Trash2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { AlertCenterPanelProps } from "~/types/components";

function formatAlertDate(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function SeverityIcon({ severity }: { severity: "success" | "warning" | "error" | "info" }) {
  if (severity === "success") return <CheckCircle2 className="size-4 text-emerald-600" />;
  if (severity === "warning") return <AlertTriangle className="size-4 text-amber-600" />;
  if (severity === "error") return <CircleX className="size-4 text-red-600" />;
  return <Info className="size-4 text-sky-600" />;
}

export function AlertCenterPanel({ alerts, unreadCount, isOpen, onToggle, onClearAll, onDismissAlert }: AlertCenterPanelProps) {
  return (
    <div className="relative">
      <Button type="button" variant="outline" onClick={onToggle} className="relative rounded-xl border-slate-200 bg-white">
        <Bell className="mr-2 size-4" />
        Alertas
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-semibold text-white tabular-nums">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-40 mt-2 w-88 max-w-[92vw]">
          <Card className="border-slate-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base">Centro de alertas</CardTitle>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onClearAll} title="Borrar historial">
                  <Trash2 className="size-4 text-slate-500" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={onToggle} title="Cerrar panel">
                  <X className="size-4 text-slate-500" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="max-h-96 space-y-2 overflow-auto">
              {alerts.length === 0 ? (
                <p className="text-sm text-slate-500">No hay alertas recientes.</p>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <SeverityIcon severity={alert.severity} />
                          <span className="text-xs font-medium text-slate-500">{formatAlertDate(alert.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700">{alert.message}</p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => onDismissAlert(alert.id)}
                        title="Descartar alerta"
                      >
                        <X className="size-3.5 text-slate-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
