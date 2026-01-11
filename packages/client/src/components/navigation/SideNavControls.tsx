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
      <div className="fixed left-2 top-[15%] z-30 flex items-center">
        <div className="flex flex-col items-center p-0.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded shadow-sm gap-0">
          <IconButton
            icon="keyboard_arrow_left"
            onClick={onNavigatePrevDay}
            label="Previous day (←)"
            size="xsmall"
          />
          <IconButton
            icon="keyboard_double_arrow_left"
            onClick={onNavigatePrevWeek}
            label="Previous week (Shift+←)"
            size="xsmall"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="fixed right-2 top-[15%] z-30 flex flex-col items-end justify-center">
        <div className="flex flex-col items-center p-0.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded shadow-sm gap-0">
          <IconButton
            icon="keyboard_arrow_right"
            onClick={onNavigateNextDay}
            label="Next day (→)"
            size="xsmall"
          />
          <IconButton
            icon="keyboard_double_arrow_right"
            onClick={onNavigateNextWeek}
            label="Next week (Shift+→)"
            size="xsmall"
          />
        </div>
      </div>
    </>
  );
};
