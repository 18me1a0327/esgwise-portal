
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormNumericInput } from "@/components/ui/form";
import { Parameter } from "@/services/parameterService";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParameterInputProps {
  parameter: Parameter;
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const ParameterInput: React.FC<ParameterInputProps> = ({
  parameter,
  value,
  onChange,
  disabled = false
}) => {
  // Format the label to include the unit if available
  const label = parameter.unit 
    ? `${parameter.name} (${parameter.unit})` 
    : parameter.name;

  // Convert value to a number or empty string for the input
  const inputValue = value !== undefined && value !== null ? value : "";
  
  // Determine if this is a percentage field based on the unit
  const isPercentage = parameter.unit === "%" || parameter.name.toLowerCase().includes("percentage");
  
  // Determine if this is a monetary field
  const isMonetary = parameter.unit === "INR/year" || parameter.name.toLowerCase().includes("salary");
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // For percentage fields, ensure the value is between 0 and 100
    if (isPercentage && newValue !== "") {
      const numValue = parseFloat(newValue);
      if (numValue < 0) return onChange("0");
      if (numValue > 100) return onChange("100");
    }
    
    onChange(newValue);
  };

  // Generate tooltip content based on parameter name and unit
  const getTooltipContent = () => {
    if (parameter.unit === "kWh") return "Kilowatt-hour: Unit of energy consumption";
    if (parameter.unit === "MT") return "Metric Tons";
    if (parameter.unit === "KL") return "Kiloliters: Unit of volume for liquids (1000 liters)";
    if (parameter.unit === "kg") return "Kilograms";
    if (parameter.unit === "%") return "Percentage (0-100)";
    if (parameter.unit === "INR/year") return "Indian Rupees per year";
    if (parameter.unit === "Man-Hours") return "Total hours worked by all employees";
    return parameter.unit || "No unit specified";
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-1">
        <Label htmlFor={parameter.id} className="text-sm font-medium">
          {label}
        </Label>
        {parameter.unit && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{getTooltipContent()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <FormNumericInput
        id={parameter.id}
        type="number"
        value={inputValue}
        onChange={handleChange}
        placeholder={`Enter ${parameter.name}`}
        disabled={disabled}
        className={`w-full ${isPercentage ? 'percent-input' : ''} ${isMonetary ? 'monetary-input' : ''}`}
        min={0}
        step={isPercentage ? "0.1" : "0.01"}
        debounceMs={300}
      />
      
      {isPercentage && (
        <p className="text-xs text-muted-foreground mt-1">
          Value must be between 0-100%
        </p>
      )}
    </div>
  );
};

export default ParameterInput;
