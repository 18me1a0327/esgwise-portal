
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  bordered?: boolean;
}

const GlassCard = ({ 
  children, 
  className, 
  hoverable = false,
  bordered = true,
  ...props 
}: GlassCardProps) => {
  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden backdrop-blur-md bg-white/80 dark:bg-esg-gray-800/80",
        bordered && "border border-gray-100 dark:border-esg-gray-700/30",
        "shadow-sm dark:shadow-esg-gray-900/20",
        hoverable && "transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
