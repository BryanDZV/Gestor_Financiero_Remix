import type { AlertCenterItem, CycleHistoryItem } from "~/types";

export interface CycleCategory {
  id: string;
  name: string;
  icon?: string;
  type?: 'expense' | 'income';
}

export interface CycleHistoryProps {
  cycles: CycleHistoryItem[];
  categories?: CycleCategory[];
  budgets?: { id: string; name: string }[];
  currency?: string;
}

export interface CurrencySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

export interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting?: boolean;
  loadingText?: string;
}

export interface SubscriptionItemData {
  id: string;
  name: string;
  active: boolean;
  amount: number;
  billing_period: string;
  start_date?: string;
  wallets?: {
    name?: string;
    currency?: string;
  } | null;
}

export interface SubscriptionCardProps {
  subscription: SubscriptionItemData;
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

export interface TransactionListItem {
  id: string;
  concept: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
}

export interface TransactionListProps {
  transactions: TransactionListItem[];
}

export interface TransactionItemProps {
  tx: NonNullable<CycleHistoryItem['transactions']>[0];
  isCycleClosed: boolean;
  categories: { id: string; name: string; icon?: string }[];
  budgets?: { id: string; name: string }[];
  isDeleteMode: boolean;
  isSelected: boolean;
  onToggle: () => void;
  currency?: string;
}

export interface AnalyticsMonthlyData {
  month: string;
  income: number;
  expense: number;
  netBalance: number;
}

export interface AnalyticsDailyData {
  day: string;
  amount: number;
}

export interface AnalyticsCategoryData {
  name: string;
  amount: number;
  color: string;
}

export interface AnalyticsViewProps {
  userEmail: string;
  monthlyData: AnalyticsMonthlyData[];
  categoryData: AnalyticsCategoryData[];
  dailyData: AnalyticsDailyData[];
  selectedMonthsCount?: number;
  selectedTargetMonth?: string;
}

export interface AlertCenterPanelProps {
  alerts: AlertCenterItem[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClearAll: () => void;
  onDismissAlert: (id: string) => void;
}