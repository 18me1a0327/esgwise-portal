
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Parameter } from "@/services/parameterService";
import { FormHelperText } from "@/components/ui/form";

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

  return (
    <div className="space-y-2 mb-4">
      <Label htmlFor={parameter.id}>
        {label}
      </Label>
      <Input
        id={parameter.id}
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${parameter.name}`}
        disabled={disabled}
        className="w-full"
      />
      {parameter.unit && (
        <FormHelperText className="text-xs text-muted-foreground">
          Unit: {parameter.unit}
        </FormHelperText>
      )}
    </div>
  );
};

export default ParameterInput;
