import React, { useState, useEffect } from "react";
import { AmenityIcons } from "@/lib/constants";
import { PropertyTypeCardSelect } from "@/components/ui/property-type-card-select";
import { FiltersState, initialState, setFilters } from "@/state";
import { Slider } from "@/components/ui/slider";
import { cleanParams, cn, formatEnumString } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { Search } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { PropertyTypeEnum } from "@/lib/constants";

const FiltersDrawer = () => {
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOfOpened
  );
  const [localFilters, setLocalFilters] = useState(filters);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();

  // Sync localFilters with Redux filters when drawer opens
  useEffect(() => {
    if (isFiltersFullOpen) {
      setLocalFilters(filters);
    }
  }, [isFiltersFullOpen, filters]);
  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  const handleSubmit = () => {
    dispatch(setFilters(localFilters));
    updateURL(localFilters);
  };

  const handleReset = () => {
    setLocalFilters(initialState.filters);
    dispatch(setFilters(initialState.filters));
    updateURL(initialState.filters);
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          localFilters.location
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setLocalFilters((prev) => ({
          ...prev,
          coordinates: [lng, lat],
        }));
      }
    } catch (err) {
      console.error("Error search location:", err);
    }
  };

  if (!isFiltersFullOpen) return null;

  return (
    <div className="bg-white rounded-lg h-full flex flex-col">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col space-y-6">
          <div>
            <h4 className="font-bold mb-2">Location</h4>
            <div className="flex items-center">
              <Input
                placeholder="Enter location"
                value={localFilters.location}
                onChange={(e) =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="rounded-l-xl rounded-r-none border-r-0"
              />
              <Button
                onClick={handleLocationSearch}
                className="rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none border hover:bg-primary-700 hover:text-primary-50"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-2">Property Type</h4>
            <PropertyTypeCardSelect
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  propertyType: value,
                }))
              }
              value={localFilters.propertyType as PropertyTypeEnum}
            />
          </div>
          <div>
            <h4 className="font-bold mb-2">Price Range (Monthly)</h4>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={[
                localFilters.priceRange[0] ?? 0,
                localFilters.priceRange[1] ?? 10000,
              ]}
              onValueChange={(value: [number, number]) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  priceRange: value as [number, number],
                }))
              }
              className="[&_[data-slot=slider-thumb]]:bg-primary-700 [&_[data-slot=slider-thumb]]:border-primary-700 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:hover:scale-110 [&_[data-slot=slider-thumb]]:transition-transform"
            />
            <div className="flex justify-between mt-2">
              <span>${localFilters.priceRange[0] ?? 0}</span>
              <span>${localFilters.priceRange[1] ?? 10000}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <h4 className="font-bold mb-2">Beds</h4>
              <Select
                value={localFilters.beds || "any"}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, beds: value }))
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Beds" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any beds</SelectItem>
                  <SelectItem value="1">1+ bed</SelectItem>
                  <SelectItem value="2">2+ beds</SelectItem>
                  <SelectItem value="3">3+ beds</SelectItem>
                  <SelectItem value="4">4+ beds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-2">Baths</h4>
              <Select
                value={localFilters.baths || "any"}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, baths: value }))
                }
              >
                <SelectTrigger className="w-full rounded-xl">
                  <SelectValue placeholder="Baths" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any baths</SelectItem>
                  <SelectItem value="1">1+ bath</SelectItem>
                  <SelectItem value="2">2+ baths</SelectItem>
                  <SelectItem value="3">3+ baths</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Square Feet */}
          <div>
            <h4 className="font-bold mb-2">Square Feet</h4>
            <Slider
              min={0}
              max={5000}
              step={100}
              value={[
                localFilters.squareFeet[0] ?? 0,
                localFilters.squareFeet[1] ?? 5000,
              ]}
              onValueChange={(value) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  squareFeet: value as [number, number],
                }))
              }
              className="[&_[data-slot=slider-thumb]]:bg-primary-700 [&_[data-slot=slider-thumb]]:border-primary-700 [&_[data-slot=slider-thumb]]:shadow-lg [&_[data-slot=slider-thumb]]:hover:scale-110 [&_[data-slot=slider-thumb]]:transition-transform"
            />
            <div className="flex justify-between mt-2">
              <span>{localFilters.squareFeet[0] ?? 0} sq ft</span>
              <span>{localFilters.squareFeet[1] ?? 5000} sq ft</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(AmenityIcons).map(([amenity, Icon]) => (
                <div
                  key={amenity}
                  className={cn(
                    "flex items-center space-x-2 p-2 border rounded-lg hover:cursor-pointer",
                    localFilters.amenities.includes(amenity as AmenityEnum)
                      ? "border-black"
                      : "border-gray-200"
                  )}
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      amenities: localFilters.amenities.includes(
                        amenity as AmenityEnum
                      )
                        ? localFilters.amenities.filter((a) => a !== amenity)
                        : [...localFilters.amenities, amenity as AmenityEnum],
                    }))
                  }
                >
                  <Icon className="w-5 h-5 hover:cursor-pointer" />
                  <Label className="hover:cursor-pointer">
                    {formatEnumString(amenity)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2">Available From</h4>
            <Input
              type="date"
              value={
                localFilters.availableFrom !== "any"
                  ? localFilters.availableFrom
                  : ""
              }
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  availableFrom: e.target.value ? e.target.value : "any",
                }))
              }
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Fixed buttons at bottom */}
      <div className="px-4 py-4 border-t bg-white">
        <div className="flex gap-4">
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-primary-700 text-white rounded-xl"
          >
            APPLY
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 rounded-xl"
          >
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersDrawer;
