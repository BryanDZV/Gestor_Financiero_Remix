import { Form, useSubmit } from "react-router";
import { DashboardLayout } from "~/components/layout/dashboard-layout";
import { PageHeader } from "~/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { SelectNative } from "~/components/ui/select-native";
import { Input } from "~/components/ui/input";
import { ComposedChart, Bar, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { formatMoney } from "~/lib/utils";
import type { AnalyticsViewProps } from "~/types/components";

export function AnalyticsView({ userEmail, monthlyData, categoryData, dailyData, selectedMonthsCount = 6, selectedTargetMonth }: AnalyticsViewProps) {
  const submit = useSubmit();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-border bg-popover text-popover-foreground p-4 shadow-lg">
          <p className="mb-2 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color === '#3b82f6' ? '#2563eb' : entry.color }}>
              {entry.name === 'income' ? 'Ingresos' : 
               entry.name === 'expense' ? 'Gastos' : 
               entry.name === 'netBalance' ? 'Ahorro Neto' : 
               entry.name === 'amount' ? 'Gasto del día' : entry.name}: 
              {' '}{formatMoney(entry.value, "EUR")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generar opciones para los últimos 12 meses dinámicamente
  const monthOptions = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(d);
    return { value: val, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });

  return (
    <DashboardLayout userEmail={userEmail}>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="border-b border-slate-200 pb-6">
          <PageHeader supertitle="Reportes" title="Análisis Visual" description="Interpreta tus datos, descubre tendencias y evalúa tu salud financiera." />
        </header>

        {/* Controles de Filtros */}
        <Form method="get" className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm text-card-foreground" onChange={(e) => submit(e.currentTarget)}>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="monthsCount" className="text-sm font-medium text-muted-foreground shrink-0">Ver historial de:</label>
            <div className="flex items-center gap-2">
              <Input 
                id="monthsCount"
                type="number" 
                name="monthsCount" 
                min="1" 
                defaultValue={selectedMonthsCount} 
                className="bg-background border-input text-sm py-2 w-24 tabular-nums" 
              />
              <span className="text-sm text-muted-foreground">meses</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto sm:ml-auto">
            <label htmlFor="targetMonth" className="text-sm font-medium text-muted-foreground shrink-0">Ritmo diario de:</label>
            <SelectNative id="targetMonth" name="targetMonth" defaultValue={selectedTargetMonth} className="bg-background border-input text-sm py-2 sm:w-48">
              {monthOptions.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </SelectNative>
          </div>
        </Form>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Gráfico de Barras: Flujo de Caja */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Flujo de Caja (Últimos {selectedMonthsCount} meses)</CardTitle><CardDescription>Comparativa de ingresos vs gastos.</CardDescription></CardHeader>
            <CardContent className="h-87.5 min-h-87.5 w-full pt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" formatter={(value) => <span className="text-slate-600 font-medium ml-1">{value === 'income' ? 'Ingresos' : value === 'expense' ? 'Gastos' : 'Ahorro Neto'}</span>} />
                  <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="netBalance" name="netBalance" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Pastel: Gastos por Categoría */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Top Gastos por Categoría</CardTitle><CardDescription>Distribución de tus gastos clasificados en los últimos {selectedMonthsCount} meses.</CardDescription></CardHeader>
            <CardContent className="h-75 min-h-75 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="amount">{categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie>
                  <Tooltip  content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Área: Ritmo de Gasto Diario */}
          <Card className="lg:col-span-1">
            <CardHeader><CardTitle>Ritmo de Gasto Mensual</CardTitle><CardDescription>Evolución de tus gastos en el mes seleccionado.</CardDescription></CardHeader>
            <CardContent className="h-75 min-h-75 w-full pt-4 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} minTickGap={20} />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" name="amount" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div></div></DashboardLayout>);
}