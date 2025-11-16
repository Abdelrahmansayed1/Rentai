import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface PriceRangeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  type: "min" | "max";
  className?: string;
}

export function PriceRangeSelect({
  value,
  onValueChange,
  type,
  className = "",
}: PriceRangeSelectProps) {
  const isMin = type === "min";

  const priceOptions = isMin
    ? [500, 1000, 1500, 2000, 3000, 5000, 10000]
    : [1000, 2000, 3000, 5000, 10000];

  const placeholder = isMin ? "Any Min Price" : "Any Max Price";

  const formatPrice = (price: number) => {
    if (isMin) {
      return `$${price / 1000}k+`;
    } else {
      return `<$${price / 1000}k`;
    }
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`w-full rounded-xl border-primary-400 ${className}`}
      >
        <SelectValue>
          {value === "any"
            ? placeholder
            : `$${parseInt(value) / 1000}k${isMin ? "+" : ""}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="any">{placeholder}</SelectItem>
        {priceOptions.map((price) => (
          <SelectItem key={price} value={price.toString()}>
            {formatPrice(price)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
