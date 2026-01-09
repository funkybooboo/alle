import type { UserSettings } from '../../types/settings.types';

export interface SettingsPanelProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}
