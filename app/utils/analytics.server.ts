import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsMonthlyData, AnalyticsCategoryData, AnalyticsDailyData } from "~/types/components";

export async function getAnalyticsData(userId: string, supabase: SupabaseClient, monthsCount: number = 6, targetMonthStr?: string): Promise<{ monthlyData: AnalyticsMonthlyData[], categoryData: AnalyticsCategoryData[], dailyData: AnalyticsDailyData[] }> {
  // Obtenemos los meses dinámicos solicitados (Flujo de Caja y Categorías)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - (monthsCount - 1));
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type, date, categories(name)')
    .eq('user_id', userId)
    .gte('date', startDate.toISOString());

  const txs = transactions || [];

  // 1. Agrupar por mes dinámicamente
  const monthlyMap: Record<string, AnalyticsMonthlyData> = {};
  
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toISOString().slice(0, 7);
    const monthName = new Intl.DateTimeFormat('es-ES', { month: 'short', year: 'numeric' }).format(d);
    monthlyMap[monthKey] = { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), income: 0, expense: 0, netBalance: 0 };
  }

  const categoryMap: Record<string, number> = {};

  txs.forEach(tx => {
    const monthKey = tx.date.slice(0, 7);
    if (monthlyMap[monthKey]) {
      if (tx.type === 'income') monthlyMap[monthKey].income += Number(tx.amount);
      if (tx.type === 'expense') monthlyMap[monthKey].expense += Number(tx.amount);
    }

    // 2. Agrupar por categoría (Solo gastos)
    if (tx.type === 'expense') {
      // @ts-ignore
      const catName = tx.categories?.name || 'Sin categoría';
      categoryMap[catName] = (categoryMap[catName] || 0) + Number(tx.amount);
    }
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
  const categoryData = Object.entries(categoryMap).map(([name, amount], index) => ({ name, amount, color: COLORS[index % COLORS.length] })).sort((a, b) => b.amount - a.amount).slice(0, 8); // Top 8 categorías

  const monthlyDataList = Object.values(monthlyMap).map(m => ({
    ...m,
    netBalance: m.income - m.expense
  }));

  // 3. Ritmo de gasto para el mes seleccionado
  let tYear = new Date().getFullYear();
  let tMonth = new Date().getMonth();
  
  if (targetMonthStr) {
    const [y, m] = targetMonthStr.split('-');
    tYear = parseInt(y, 10);
    tMonth = parseInt(m, 10) - 1;
  }

  const firstDay = new Date(Date.UTC(tYear, tMonth, 1)).toISOString();
  const lastDay = new Date(Date.UTC(tYear, tMonth + 1, 0, 23, 59, 59, 999)).toISOString();

  const { data: currentMonthTxs } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', firstDay)
    .lte('date', lastDay);

  const daysInMonth = new Date(tYear, tMonth + 1, 0).getDate();
  const dailyMap: Record<string, number> = {};
  for (let i = 1; i <= daysInMonth; i++) dailyMap[i.toString()] = 0;

  (currentMonthTxs || []).forEach(tx => {
    // Extracción segura del día en UTC asumiendo formato ISO YYYY-MM-DD
    const day = parseInt(tx.date.substring(8, 10), 10).toString();
    if (dailyMap[day] !== undefined) {
      dailyMap[day] += Number(tx.amount);
    }
  });

  const dailyData = Object.entries(dailyMap).map(([day, amount]) => ({ day, amount }));

  return { monthlyData: monthlyDataList, categoryData, dailyData };
}