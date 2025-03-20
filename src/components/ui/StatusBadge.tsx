
import React from "react";
import { cn } from "@/lib/utils";
import { ApprovalStatus } from "@/types/esg";

interface StatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "draft":
        return "bg-esg-gray-100 text-esg-gray-600 border-esg-gray-200";
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "approved":
        return "bg-green-50 text-esg-green border-green-200";
      case "rejected":
        return "bg-red-50 text-esg-red border-red-200";
      default:
        return "bg-esg-gray-100 text-esg-gray-600 border-esg-gray-200";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "draft":
        return "Draft";
      case "pending":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <span 
      className={cn(
        "px-3 py-1 text-xs font-medium rounded-full border",
        "transition-all duration-300 ease-in-out",
        getStatusStyles(),
        className
      )}
    >
      {getStatusText()}
    </span>
  );
};

export default StatusBadge;
