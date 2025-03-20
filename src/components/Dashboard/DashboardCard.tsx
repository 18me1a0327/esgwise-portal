
import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: {
    value: number;
    positive: boolean;
  };
  className?: string;
  valueClassName?: string;
  children?: React.ReactNode;
}

const DashboardCard = ({
  title,
  value,
  icon,
  change,
  className,
  valueClassName,
  children,
}: DashboardCardProps) => {
  return (
    <GlassCard className={cn("p-5", className)} hoverable>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-esg-gray-500">{title}</h3>
        {icon && <div className="text-esg-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <p className={cn("text-2xl font-semibold", valueClassName)}>{value}</p>
          
          {change && (
            <div className="flex items-center space-x-1">
              <span
                className={cn(
                  "text-xs",
                  change.positive ? "text-esg-green" : "text-esg-red"
                )}
              >
                {change.positive ? "↑" : "↓"} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-esg-gray-400">vs previous period</span>
            </div>
          )}
        </div>
        
        {children && <div>{children}</div>}
      </div>
    </GlassCard>
  );
};

export default DashboardCard;
