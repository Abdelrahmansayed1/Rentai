import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export interface FiltersState {
  location: string;
  beds: string;
  baths: string;
  propertyType: string;
  amenities: string[];
  availableFrom: string;
  priceRange: [number, number] | [null, null];
  squareFeet: [number, number] | [null, null];
  coordinates: [number, number];
}

export interface InitialStateType {
  filters: FiltersState;
  isFiltersFullOfOpened: boolean;
  viewMode: "grid" | "list";
}

export const initialState: InitialStateType = {
  filters: {
    location: "Los Angeles",
    beds: "any",
    baths: "any",
    propertyType: "any",
    amenities: [],
    availableFrom: "any",
    priceRange: [null, null],
    squareFeet: [null, null],
    coordinates: [-118.2437, 34.0522],
  },
  isFiltersFullOfOpened: false,
  viewMode: "grid",
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setIsFiltersFullOfOpened: (state) => {
      state.isFiltersFullOfOpened = !state.isFiltersFullOfOpened;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setFilters, setIsFiltersFullOfOpened, setViewMode } =
  globalSlice.actions;

export default globalSlice.reducer;
