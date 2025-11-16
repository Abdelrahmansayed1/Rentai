import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { PropertyTypeIcons } from "@/lib/constants";

interface PropertyTypeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function PropertyTypeSelect({
  value,
  onValueChange,
  className = "",
}: PropertyTypeSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`w-full rounded-xl border-primary-400 ${className}`}
      >
        <SelectValue placeholder="Home Type" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="any">Any Property Type</SelectItem>
        {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
          <SelectItem key={type} value={type}>
            <div className="flex items-center">
              <Icon className="w-4 h-4 mr-2" />
              <span>{type}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
