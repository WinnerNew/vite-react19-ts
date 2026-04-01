import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const sizeClasses = {
  xs: "w-8 h-8 min-w-[2rem] min-h-[2rem]",
  sm: "w-10 h-10 min-w-[2.5rem] min-h-[2.5rem]",
  md: "w-12 h-12 min-w-[3rem] min-h-[3rem]",
  lg: "w-16 h-16 min-w-[4rem] min-h-[4rem]",
  xl: "w-20 h-20 min-w-[5rem] min-h-[5rem]",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  size = "sm",
  className = "",
  onClick,
}) => {
  const baseClasses = `rounded-full object-cover border border-zinc-800 flex-shrink-0 ${sizeClasses[size]}`;
  const combinedClasses = `${baseClasses} ${className} ${
    onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""
  }`;

  if (!src) {
    return (
      <div
        className={`${combinedClasses} bg-zinc-800 flex items-center justify-center`}
      >
        <User
          className="text-zinc-500"
          size={
            size === "xs"
              ? 16
              : size === "sm"
                ? 20
                : size === "md"
                  ? 24
                  : size === "lg"
                    ? 32
                    : 40
          }
        />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} className={combinedClasses} onClick={onClick} />
  );
};
