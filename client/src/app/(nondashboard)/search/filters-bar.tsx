import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriceRangeSelect } from "@/components/ui/price-range-select";
import { FilterSelect } from "@/components/ui/filter-select";
import { PropertyTypeSelect } from "@/components/ui/property-type-select";
import { cleanParams, cn } from "@/lib/utils";
import {
  FiltersState,
  setFilters,
  setIsFiltersFullOfOpened,
  setViewMode,
} from "@/state";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { Filter, List, Grid, Search } from "lucide-react";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { debounce } from "lodash";

const FiltersBar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOfOpened
  );
  const [search, setSearch] = useState(filters.location);

  // Sync search with Redux filters.location when it changes
  useEffect(() => {
    setSearch(filters.location);
  }, [filters.location]);

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

  const handleFilterChange = (
    key: string,
    value: unknown,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const currentArrayRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : (value as number[]).map(Number);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          search
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: search,
            coordinates: [lng, lat],
          })
        );
      }
    } catch (err) {
      console.error("Error search location:", err);
    }
  };

  return (
    <div className="flex justify-between items-center w-full py-5">
      <div className="flex justify-between items-center w-full gap-4 p-2">
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100",
            isFiltersFullOpen && "bg-primary-700 text-primary-100"
          )}
          onClick={() => dispatch(setIsFiltersFullOfOpened())}
        >
          <Filter className="w-4 h-4" />
          <span>All Filters</span>
        </Button>
        <div className="flex items-center">
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-l-xl rounded-r-none border-primary-400 border-r-0"
          />
          <Button
            onClick={handleLocationSearch}
            className={`rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none 
              border hover:bg-primary-700 hover:text-primary-50`}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex gap-2 filter-select-equal-width">
          <PriceRangeSelect
            value={filters.priceRange[0]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, true)
            }
            type="min"
          />

          <PriceRangeSelect
            value={filters.priceRange[1]?.toString() || "any"}
            onValueChange={(value) =>
              handleFilterChange("priceRange", value, false)
            }
            type="max"
          />

          <FilterSelect
            value={filters.beds || "any"}
            onValueChange={(value) => handleFilterChange("beds", value, null)}
            filterType="beds"
          />

          <FilterSelect
            value={filters.baths || "any"}
            onValueChange={(value) => handleFilterChange("baths", value, null)}
            filterType="baths"
          />

          <PropertyTypeSelect
            value={filters.propertyType || "any"}
            onValueChange={(value) =>
              handleFilterChange("propertyType", value, null)
            }
          />
        </div>
        <div className="flex justify-between items-center gap-4 p-2">
          <div className="flex border rounded-xl">
            <Button
              variant="ghost"
              className={cn(
                "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
                viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
              )}
              onClick={() => dispatch(setViewMode("list"))}
            >
              <List className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
                viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
              )}
              onClick={() => dispatch(setViewMode("grid"))}
            >
              <Grid className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
