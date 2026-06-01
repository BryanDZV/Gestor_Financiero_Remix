import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Icon } from "@iconify/react";
import { formatMoney } from "~/lib/utils";
import type { BudgetOverviewChartProps } from "~/types";

export function BudgetOverviewChart({ budgets, currency = "EUR", compact = false }: BudgetOverviewChartProps) {
  const data = budgets.filter(b => Number(b.monthly_limit || 0) > 0).map(b => {
    const limit = Number(b.monthly_limit || 0);
    const spent = Number(b.spent || 0);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    return {
      name: b.name,
      Gastado: spent,
      Límite: limit,
      percentage
    };
  });

  if (data.length === 0) return null;

  const containerClass = compact ? "h-36 sm:h-44" : "h-48 sm:h-56";
  const barSize = compact ? 20 : 32;
  const yAxisWidth = compact ? 64 : 85;

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 pb-4 border-b border-slate-100">
        <CardTitle className="text-base flex items-center gap-2 text-slate-800">
          <Icon icon="ph:chart-bar-duotone" className="size-5 text-indigo-500" />
          Análisis de Presupuestos (Gastado vs Límite)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className={`${containerClass} w-full mt-2 min-w-0`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 24, bottom: 0 }} barSize={barSize}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} angle={-25} textAnchor="end" height={50} />
              <YAxis width={yAxisWidth} tickFormatter={(val) => formatMoney(val, currency)} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any, name: any) => {
                  if (value == null) return ["N/A", String(name)];
                  return [formatMoney(Number(value), currency), String(name)];
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Gastado" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.percentage >= 100 ? '#ef4444' : entry.percentage >= 80 ? '#fbbf24' : '#10b981'} />
                ))}
              </Bar>
              <Bar dataKey="Límite" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}