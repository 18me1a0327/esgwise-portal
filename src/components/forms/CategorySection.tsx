
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Parameter } from "@/services/parameterService";
import ParameterInput from "./ParameterInput";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategorySectionProps {
  categoryName: string;
  parameters: Parameter[];
  values: Record<string, any>;
  onChange: (parameterId: string, value: string) => void;
  disabled?: boolean;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryName,
  parameters,
  values,
  onChange,
  disabled = false
}) => {
  const isMobile = useIsMobile();

  if (parameters.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="py-4">
        <CardTitle className={isMobile ? "text-lg" : "text-xl"}>
          {categoryName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'} gap-4`}>
          {parameters.map((parameter) => (
            <ParameterInput
              key={parameter.id}
              parameter={parameter}
              value={values[parameter.id] || ""}
              onChange={(value) => onChange(parameter.id, value)}
              disabled={disabled}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySection;
