export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      {icon && (
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">
          {icon}
        </span>
      )}
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 dark:bg-gray-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-gray-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
