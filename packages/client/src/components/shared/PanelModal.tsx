import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

export interface PanelModalProps {
  title?: string;
  headerContent?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  testId?: string;
}

export const PanelModal = ({
  title,
  headerContent,
  footer,
  onClose,
  children,
  className = '',
  testId,
}: PanelModalProps) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-white dark:bg-black ${className}`}
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Header / Top Bar */}
      <div className="flex-shrink-0 flex items-center px-4 py-1 h-10 border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50/50 dark:bg-[#1a1a1a]/50">
        {/* Left Section: Title or Header Content */}
        <div className="flex-1 flex flex-row items-center gap-4 min-w-0">
          {headerContent ? (
            <div className="w-full">{headerContent}</div>
          ) : (
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h2>
          )}
        </div>

        {/* Center Section: Alle */}
        <div className="flex justify-center">
          <h1 className="hidden md:block font-[Courier_New,Courier,monospace] font-bold text-lg">
            Alle
          </h1>
        </div>

        {/* Right Section: Close Button */}
        <div className="flex-1 flex flex-row gap-1 items-center justify-end">
          <IconButton icon="close" onClick={onClose} label="Close (Esc)" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 dark:border-[#2a2a2a]">
          {footer}
        </div>
      )}
    </div>
  );
};
