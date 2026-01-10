import { useState, useEffect, useRef } from 'react';

export interface DrawerHandleProps {
  onDrag: (deltaY: number) => void;
  onToggle: () => void;
  isOpen: boolean;
}

export const DrawerHandle = ({
  onDrag,
  onToggle,
  isOpen,
}: DrawerHandleProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [didDrag, setDidDrag] = useState(false);
  const startYRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDidDrag(false);
    startYRef.current = e.clientY;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only toggle if user didn't drag
    if (!didDrag) {
      e.preventDefault();
      onToggle();
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      if (Math.abs(deltaY) > 2) {
        setDidDrag(true);
      }
      onDrag(deltaY);
      startYRef.current = e.clientY;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onDrag]);

  return (
    <div
      className="h-8 bg-gray-200 border-b border-gray-300 flex items-center justify-center cursor-ns-resize hover:bg-gray-300 transition-colors"
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-xl text-gray-600">
          {isOpen ? 'expand_more' : 'expand_less'}
        </span>
        <div className="w-12 h-1 bg-gray-400 rounded-full"></div>
        <span className="text-sm font-medium text-gray-600">Someday</span>
      </div>
    </div>
  );
};
