import { Icon } from "@iconify/react";
import { Card, CardContent } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { formatMoney } from "~/lib/utils";
import type { BudgetProgressCardProps } from "~/types";

export function BudgetProgressCard({ budget, currency = "EUR", onEdit }: BudgetProgressCardProps) {
  const limit = Number(budget.monthly_limit || 0);
  const spent = Number(budget.spent || 0);
  const hasLimit = limit > 0;
  const percentage = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
  const isOverBudget = hasLimit && spent > limit;
  const isWarning = hasLimit && percentage >= 80 && !isOverBudget;

  const progressColor = isOverBudget ? "bg-red-500" : isWarning ? "bg-amber-400" : "bg-emerald-500";
  const bgColor = isOverBudget ? "bg-red-50" : "bg-slate-50";

  return (
    <Card className={`overflow-hidden transition-all ${isOverBudget ? 'border-red-200 shadow-red-100/50' : 'border-border'}`}>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-foreground">{budget.name}</h2>
            <p className="text-xs font-medium mt-1">
              {!hasLimit 
                ? <span className="text-muted-foreground">Gastado este mes</span>
                : isOverBudget 
                  ? <span className="text-red-600">¡Te has pasado por {formatMoney(spent - limit, currency)}!</span>
                  : <span className="text-muted-foreground">Quedan {formatMoney(limit - spent, currency)} libres</span>
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit();
                }} 
                className="relative z-10 p-2 rounded-xl bg-secondary text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors" 
                title="Editar presupuesto"
              >
                <Icon icon="ph:pencil-simple-duotone" className="size-5" />
              </button>
            )}
            <div className={`p-2 rounded-xl ${isOverBudget ? "bg-red-50" : "bg-secondary"}`}>
              <Icon icon="ph:target-duotone" className={`size-5 ${isOverBudget ? 'text-red-500' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </div>
        
        {hasLimit ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span className={isOverBudget ? "text-red-600 font-bold" : "text-foreground"}>{formatMoney(spent, currency)}</span>
              <span className="text-muted-foreground">de {formatMoney(limit, currency)}</span>
            </div>
            <Progress value={percentage} indicatorClassName={progressColor} className="h-2.5 bg-secondary" />
          </div>
        ) : (
          <div className="mt-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">{formatMoney(spent, currency)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}