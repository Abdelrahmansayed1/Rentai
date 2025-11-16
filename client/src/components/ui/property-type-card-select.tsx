import { PropertyTypeEnum, PropertyTypeIcons } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PropertyTypeCardSelectProps {
  onValueChange: (value: PropertyTypeEnum) => void;
  value: PropertyTypeEnum;
}

export function PropertyTypeCardSelect(props: PropertyTypeCardSelectProps) {
  const [localValue, setLocalValue] = useState(props.value);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 py-4">
      {Object.values(PropertyTypeEnum).map((propertyType) => {
        const Icon = PropertyTypeIcons[propertyType];
        return (
          <div
            key={propertyType}
            className={cn(
              "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
              localValue === propertyType ? "border-black" : "border-gray-200"
            )}
            onClick={() => {
              setLocalValue(propertyType);
              props.onValueChange(propertyType);
            }}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span>{propertyType}</span>
          </div>
        );
      })}
    </div>
  );
}
