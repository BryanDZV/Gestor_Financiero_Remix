// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("dashboard", "routes/dashboard.tsx"), 
  route("dashboard/cuentas", "routes/accounts.tsx"), 
  route("dashboard/cuentas/:id", "routes/account-detail.tsx"), // El segmento dinámico ':id'
  route("dashboard/presupuestos", "routes/budgets.tsx"),
  route("dashboard/monedas", "routes/currency.tsx"),
  route("dashboard/suscripciones", "routes/subscriptions.tsx"),
  route("dashboard/planificador", "routes/debt-planner.tsx"),
] satisfies RouteConfig;