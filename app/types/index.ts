import type { ReactNode } from "react";

// ==========================================
// MODELOS DE DOMINIO Y VISTAS
// ==========================================

export type WalletViewModel = {
  id?: string;
  name: string;
  type?: string;
  is_liability: boolean;
  target_amount?: number;
  initial_balance: number;
  currency?: string;
  share_divisor?: number;
  current_balance?: number;
};

export type TransactionViewModel = {
  id: string;
  concept: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
  category_id?: string | null;
  budget_id?: string | null;
};

export type CycleViewModel = {
  id: string;
  name: string;
  is_closed: boolean;
  start_date?: string;
  transactions?: TransactionViewModel[];
};

export type CycleHistoryItem = {
  id: string;
  name: string;
  is_closed: boolean;
  start_date?: string;
  transactions?: {
    id: string;
    concept: string;
    amount: number;
    type: "income" | "expense" | "transfer";
    date?: string;
    category_id?: string | null;
    budget_id?: string | null;
  }[];
};

export type AccountsWallet = {
  id: string;
  name: string;
  type: string;
  is_liability: boolean;
  initial_balance: number;
  current_balance: number;
  currency?: string;
  share_divisor?: number;
};

export type DashboardWallet = {
  id: string;
  name: string;
  type: string;
  initial_balance: number;
  current_balance: number;
  is_liability: boolean;
  currency?: string;
};

export type DashboardTransaction = {
  id: string;
  concept: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  date: string;
  wallets?: { name: string; currency?: string };
};

export type Budget = {
  id: string;
  name: string;
  monthly_limit: number;
  spent: number;
  currency?: string;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billing_period: "monthly" | "yearly";
  active: boolean;
  wallet_id?: string;
  wallets?: { name: string; currency?: string };
  start_date?: string;
};

export type AccountActionIntent =
  | "add_transaction"
  | "transfer_transaction"
  | "split_transaction"
  | "edit_transaction"
  | "delete_transactions"
  | "import_file"
  | "create_cycle"
  | "close_cycle"
  | "open_cycle"
  | "delete_cycle"
  | "delete_cycles";

export interface AccountActionData {
  success?: boolean;
  error?: string;
  warning?: string;
  intent?: AccountActionIntent;
  count?: number;
  message?: string;
}

export type AlertSeverity = "success" | "warning" | "error" | "info";

export interface AccountFeedbackEvent {
  severity: AlertSeverity;
  message: string;
  intent?: AccountActionIntent;
}

export interface AlertCenterItem {
  id: string;
  severity: AlertSeverity;
  message: string;
  intent?: AccountActionIntent;
  createdAt: string;
  read: boolean;
}

// ==========================================
// PROPS DE COMPONENTES DE FEATURES
// ==========================================

export interface AccountDetailViewProps {
  userEmail: string;
  wallet: WalletViewModel;
  cycles: CycleViewModel[];
  categories: { id: string; name: string }[];
  otherWallets: { id: string; name: string; currency?: string }[];
  rates?: Record<string, number>;
  actionData?: AccountActionData;
  actionError?: string;
  budgets?: { id: string; name: string }[];
  isSubmitting: boolean;
}

export interface CycleManagerProps {
  activeCycles: { id: string; name: string }[];
  isSubmitting: boolean;
  shareDivisor?: number;
  categories?: { id: string; name: string }[];
  otherWallets: { id: string; name: string; currency?: string }[];
  budgets?: { id: string; name: string }[];
  rates?: Record<string, number>;
  currentCurrency?: string;
}

export interface CycleHistoryProps {
  cycles: CycleViewModel[] | CycleHistoryItem[];
  categories?: { id: string; name: string }[];
  budgets?: { id: string; name: string }[];
  currency?: string;
}

export interface AccountsViewProps {
  userEmail: string;
  wallets: AccountsWallet[];
}

export interface BudgetsViewProps {
  userEmail: string;
  budgets: Budget[];
  currencyOptions?: string[];
}

export interface CategoriesViewProps {
  userEmail: string;
  categories: { id: string; name: string; icon?: string }[];
}

export interface SubscriptionsViewProps {
  userEmail: string;
  subscriptions: Subscription[];
  wallets: { id: string; name: string }[];
}

export interface DashboardViewProps {
  userEmail: string;
  wallets: DashboardWallet[];
  transactions: DashboardTransaction[];
}

export interface DebtPlannerViewProps {
  userEmail: string;
  currencyOptions?: string[];
}

export interface AccountHeaderProps {
  name: string;
  isLiability: boolean;
  targetAmount?: number;
  currentBalance: number;
  currency?: string;
}

export interface WalletCardProps {
  name: string;
  type: string;
  balance: number;
  initialBalance?: number;
  isLiability?: boolean;
  currency?: string;
}

export interface BudgetOverviewChartProps {
  budgets: Budget[];
  currency?: string;
  compact?: boolean;
}

export interface BudgetProgressCardProps {
  budget: Budget;
  currency?: string;
  onEdit?: () => void;
}

// ==========================================
// PROPS DE COMPONENTES DE UI COMPARTIDA
// ==========================================

export interface DeleteConfirmProps {
  text?: string;
  onConfirm?: () => void;
  trigger?: (onClick: () => void) => ReactNode;
  children?: ReactNode;
}

export interface MultiSelectActionsProps {
  isDeleteMode: boolean;
  selectedCount: number;
  totalCount: number;
  onToggleMode: (mode: boolean) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete: () => void;
  itemName?: string;
  children?: ReactNode;
}

export interface FormErrorProps {
  error?: string;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  supertitle?: string;
  className?: string;
}

export interface EmptyStateProps {
  message?: string;
  children?: ReactNode;
  className?: string;
}

export interface DashboardLayoutProps {
  userEmail: string;
  children: ReactNode;
}

export interface SelectionIndicatorProps {
  isSelected: boolean;
  className?: string;
  iconClassName?: string;
}

// ==========================================
// UI ATOMS
// ==========================================
export interface SegmentedControlOption<T> {
  label: string;
  value: T;
}
export interface SegmentedControlProps<T> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}