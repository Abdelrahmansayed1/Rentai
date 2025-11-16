import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface FilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  filterType: "beds" | "baths" | string;
  placeholder?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onValueChange,
  filterType,
  placeholder,
  className = "",
}: FilterSelectProps) {
  // Generate options based on filter type
  const getOptions = () => {
    if (filterType === "beds") {
      return [
        { value: "any", label: "Any Beds" },
        { value: "1", label: "1+ bed" },
        { value: "2", label: "2+ beds" },
        { value: "3", label: "3+ beds" },
        { value: "4", label: "4+ beds" },
      ];
    }

    if (filterType === "baths") {
      return [
        { value: "any", label: "Any Baths" },
        { value: "1", label: "1+ bath" },
        { value: "2", label: "2+ baths" },
        { value: "3", label: "3+ baths" },
      ];
    }

    // Default fallback
    return [
      { value: "any", label: `Any ${filterType}` },
      { value: "1", label: `1+ ${filterType}` },
      { value: "2", label: `2+ ${filterType}s` },
      { value: "3", label: `3+ ${filterType}s` },
    ];
  };

  const options = getOptions();
  const defaultPlaceholder =
    placeholder || filterType.charAt(0).toUpperCase() + filterType.slice(1);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`w-full rounded-xl border-primary-400 ${className}`}
      >
        <SelectValue placeholder={defaultPlaceholder} />
      </SelectTrigger>
      <SelectContent className="bg-white">
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
