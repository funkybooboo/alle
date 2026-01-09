export interface ColumnControlsProps {
  numDays: number;
  isAutoMode: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onToggleAuto: () => void;
  onOpenSettings: () => void;
}
