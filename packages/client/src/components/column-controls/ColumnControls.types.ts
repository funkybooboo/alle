import type { Theme } from '../../types/settings.types';

export interface ColumnControlsProps {
  numDays: number;
  isAutoMode: boolean;
  theme: Theme;
  onDecrease: () => void;
  onIncrease: () => void;
  onToggleAuto: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenTrash: () => void;
}
