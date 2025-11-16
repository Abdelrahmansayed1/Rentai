import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import { Loader } from "lucide-react";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

export const MapSection = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOfOpened
  );
  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  useEffect(() => {
    if (isLoading || !properties || isError || !mapContainerRef.current) {
      return;
    }

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/abdelrahman-sayed/cmfa4bdzn003601sdg9wa65vq",
      center: filters.coordinates || [-74.5, 40],
      zoom: 9,
    });

    mapRef.current = map;

    properties.forEach((property) => {
      const marker = createPropertyMarker(property, map);
      const markerElement = marker.getElement();
      const path = markerElement.querySelector("path[fill='#3FB1CE']");
      if (path) path.setAttribute("fill", "#000000");
    });

    const resizeMap = () => setTimeout(() => map.resize(), 700);
    resizeMap();

    return () => {
      map?.remove();
      mapRef.current = null;
    };
  }, [isLoading, isError, properties, filters.coordinates]);

  useEffect(() => {
    if (mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.resize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isFiltersFullOpen]);

  if (isLoading || !properties) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div>Error loading properties</div>
      </div>
    );
  }

  const createPropertyMarker = (property: Property, map: mapboxgl.Map) => {
    const marker = new mapboxgl.Marker()
      .setLngLat([
        property.location.coordinates.longitude,
        property.location.coordinates.latitude,
      ])
      .addTo(map);

    const popup = new mapboxgl.Popup({
      closeOnClick: false,
      closeButton: false,
      offset: [0, -40],
    })
      .setLngLat([
        property.location.coordinates.longitude,
        property.location.coordinates.latitude,
      ])
      .setHTML(
        `
      <div class="marker-popup">
        <img src="${property.photoUrls[0]}" alt="${property.name}" class="marker-popup-image" />
        <div>
          <a href="/search/${property.id}" target="_blank" class="marker-popup-title">${property.name}</a>
          <p class="marker-popup-price">
            $${property.pricePerMonth}
            <span class="marker-popup-price-unit"> / month</span>
          </p>
        </div>
      </div>
      `
      );

    const markerElement = marker.getElement();
    markerElement.addEventListener("mouseenter", () => {
      popup.addTo(map);
    });
    markerElement.addEventListener("mouseleave", () => {
      popup.remove();
    });

    return marker;
  };

  return (
    <div className="basis-5/12 grow relative rounded-xl">
      <div
        ref={mapContainerRef}
        className="map-container rounded-xl"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
