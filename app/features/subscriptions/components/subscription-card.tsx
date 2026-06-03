import { Form } from "react-router";
import { Icon } from "@iconify/react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { SelectionIndicator } from "~/components/ui/selection-indicator";
import { formatMoney, formatDate, cn } from "~/lib/utils";
import type { SubscriptionCardProps } from "~/types/components";

export function SubscriptionCard({ subscription, isDeleteMode, isSelected, onToggle }: SubscriptionCardProps) {
  return (
    <Card 
      onClick={() => { if (isDeleteMode) onToggle(); }} 
      className={cn(
        "relative transition-all",
        isDeleteMode && "cursor-pointer",
        isDeleteMode && isSelected && "ring-2 ring-red-500",
        !subscription.active && !isDeleteMode && "opacity-60 bg-muted/50"
      )}
    >
      {isDeleteMode && (
        <div className="absolute right-4 top-4 z-20">
          <SelectionIndicator isSelected={isSelected} />
        </div>
      )}
      
      <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
        <div className="flex justify-between items-start gap-4 pr-6">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1">{subscription.name}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              {subscription.billing_period === 'yearly' ? 'Facturación Anual' : 'Facturación Mensual'}
              {subscription.start_date && ` • Desde: ${formatDate(subscription.start_date)}`}
              {subscription.wallets?.name && (
                <span className="ml-2 inline-flex items-center text-indigo-600">
                  <Icon icon="ph:wallet" className="mr-1 size-3.5" /> {subscription.wallets.name}
                </span>
              )}
            </p>
          </div>
          <Badge variant={subscription.active ? "secondary" : "default"}>
            {subscription.active ? "Activa" : "Pausada"}
          </Badge>
        </div>
        
        <div className="flex items-end justify-between border-t border-border pt-4">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            {formatMoney(subscription.amount, subscription.wallets?.currency)}
          </p>
          {!isDeleteMode && (
            <Form method="post">
              <input type="hidden" name="_intent" value="toggle_subscription" />
              <input type="hidden" name="subscription_id" value={subscription.id} />
              <input type="hidden" name="active" value={subscription.active.toString()} />
              <button type="submit" className={cn("text-xs font-medium hover:underline", subscription.active ? 'text-amber-600' : 'text-emerald-600')}>
                {subscription.active ? 'Pausar cobro' : 'Reactivar'}
              </button>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}