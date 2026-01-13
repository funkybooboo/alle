import { IconButton } from '../shared/IconButton';

export interface SideNavControlsProps {
  onNavigatePrevDay: () => void;
  onNavigateNextDay: () => void;
  onNavigatePrevWeek: () => void;
  onNavigateNextWeek: () => void;
}

export const SideNavControls = ({
  onNavigatePrevDay,
  onNavigateNextDay,
  onNavigatePrevWeek,
  onNavigateNextWeek,
}: SideNavControlsProps) => {
  return (
    <>
      {/* Left controls */}
      <div className="fixed left-1 top-[15%] z-30 flex items-center">
        <div className="flex flex-col items-center p-1 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded shadow-sm gap-1">
          <IconButton
            icon="keyboard_arrow_left"
            onClick={onNavigatePrevDay}
            label="Previous day (←)"
            size="tiny"
          />
          <IconButton
            icon="keyboard_double_arrow_left"
            onClick={onNavigatePrevWeek}
            label="Previous week (Shift+←)"
            size="tiny"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="fixed right-1 top-[15%] z-30 flex flex-col items-end justify-center">
        <div className="flex flex-col items-center p-1 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-sm rounded shadow-sm gap-1">
          <IconButton
            icon="keyboard_arrow_right"
            onClick={onNavigateNextDay}
            label="Next day (→)"
            size="tiny"
          />
          <IconButton
            icon="keyboard_double_arrow_right"
            onClick={onNavigateNextWeek}
            label="Next week (Shift+→)"
            size="tiny"
          />
        </div>
      </div>
    </>
  );
};
