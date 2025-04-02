
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
  const isMonetary = parameter.unit === "INR/year" || parameter.unit === "INR" || 
                     parameter.name.toLowerCase().includes("salary") ||
                     parameter.name.toLowerCase().includes("wages") ||
                     parameter.name.toLowerCase().includes("fines");
  
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
    // Map of units to descriptions
    const unitDescriptions: Record<string, string> = {
      "kWh": "Kilowatt-hour: Unit of energy consumption",
      "MT": "Metric Tons: Unit of mass/weight measurement",
      "KL": "Kiloliters: Unit of volume for liquids (1000 liters)",
      "kg": "Kilograms: Unit of mass/weight measurement",
      "%": "Percentage (0-100)",
      "INR/year": "Indian Rupees per year",
      "INR": "Indian Rupees",
      "Man-Hours": "Total hours worked by all employees/workers"
    };
    
    // Return description from map if available
    if (parameter.unit && unitDescriptions[parameter.unit]) {
      return unitDescriptions[parameter.unit];
    }
    
    // Default cases
    if (parameter.name.includes("complaints")) return "Number of reported incidents or complaints";
    if (parameter.name.includes("employees") || parameter.name.includes("workers")) return "Count of individuals";
    if (parameter.name.includes("incidents")) return "Number of reported cases";
    
    return parameter.unit || "No unit specified";
  };

  // Determine if this is an integer field
  const isInteger = parameter.name.toLowerCase().includes("number") || 
                    parameter.name.toLowerCase().includes("count") ||
                    parameter.name.toLowerCase().includes("incidents") ||
                    parameter.name.toLowerCase().includes("employees") ||
                    parameter.name.toLowerCase().includes("workers") ||
                    parameter.name.toLowerCase().includes("fatalities") ||
                    parameter.name.toLowerCase().includes("injuries") ||
                    parameter.name.toLowerCase().includes("board members") ||
                    parameter.name.toLowerCase().includes("hires") ||
                    parameter.name.toLowerCase().includes("attrition");

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-1">
        <Label htmlFor={parameter.id} className="text-sm font-medium">
          {label}
        </Label>
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
        step={isInteger ? "1" : isPercentage ? "0.1" : "0.01"}
        debounceMs={300}
      />
      
      {isPercentage && (
        <p className="text-xs text-muted-foreground mt-1">
          Value must be between 0-100%
        </p>
      )}
      
      {isInteger && (
        <p className="text-xs text-muted-foreground mt-1">
          Enter whole numbers only
        </p>
      )}
    </div>
  );
};

export default ParameterInput;
