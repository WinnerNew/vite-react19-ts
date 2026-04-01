import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: number | string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 32,
  className = "text-sky-500",
}) => {
  return (
    <Loader2
      className={`animate-spin ${className}`}
      size={typeof size === "number" ? size : undefined}
    />
  );
};

interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = "加载中...",
}) => {
  return (
    <div className="flex flex-col h-full items-center justify-center bg-black">
      <LoadingSpinner size={32} />
      {message && <p className="mt-4 text-zinc-400">{message}</p>}
    </div>
  );
};
