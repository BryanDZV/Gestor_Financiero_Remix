export interface SortToggleProps {
  label: string;
  icon: string;
  sortOrder: "desc" | "asc";
  onToggle: () => void;
  descText?: string;
  ascText?: string;
}