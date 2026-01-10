import { useEffect, useState } from 'react';

export interface KeyboardShortcutHintProps {
  show: boolean;
  text: string;
  duration?: number;
}

export const KeyboardShortcutHint = ({
  show,
  text,
  duration = 1000,
}: KeyboardShortcutHintProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_200ms_ease-in-out]">
      <div className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
        {text}
      </div>
    </div>
  );
};
