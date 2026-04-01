import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && (
        <Icon className="w-16 h-16 text-zinc-600 mb-4" />
      )}
      <h3 className="text-xl font-bold text-zinc-300 mb-2">{title}</h3>
      {description && (
        <p className="text-zinc-500 text-center max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-sky-500 text-white rounded-full font-bold hover:bg-sky-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
