import { data, redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { getSupabase } from "~/utils/supabase.server";
import { AnalyticsView } from "~/features/analytics/components/analytics-view";
import { getAnalyticsData } from "~/utils/analytics.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Análisis Visual | Finanzas Pro" },
    { name: "description", content: "Interpreta tus datos, descubre tendencias y evalúa tu salud financiera con gráficos interactivos." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const { supabase, headers } = getSupabase(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw redirect("/login", { headers });
  
  // Leer parámetros de filtro de la URL
  const url = new URL(request.url);
  const monthsCount = parseInt(url.searchParams.get("monthsCount") || "6", 10);
  
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const targetMonth = url.searchParams.get("targetMonth") || currentMonthStr;

  const { monthlyData, categoryData, dailyData } = await getAnalyticsData(user.id, supabase, monthsCount, targetMonth);
  
  return data({ user, monthlyData, categoryData, dailyData, selectedMonthsCount: monthsCount, selectedTargetMonth: targetMonth }, { headers });
}

export default function AnalyticsRoute() {
  const { user, monthlyData, categoryData, dailyData, selectedMonthsCount, selectedTargetMonth } = useLoaderData<typeof loader>();
  return <AnalyticsView userEmail={user.email || ""} monthlyData={monthlyData} categoryData={categoryData} dailyData={dailyData} selectedMonthsCount={selectedMonthsCount} selectedTargetMonth={selectedTargetMonth} />;
}