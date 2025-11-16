"use client";

import { useGetPropertyQuery } from "@/state/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const handleNextImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex + 1) % property.photoUrls.length
    );
  };
  const handlePreviousImage = () => {
    setCurrentImageIndex(
      (prevIndex) =>
        (prevIndex - 1 + property.photoUrls.length) % property.photoUrls.length
    );
  };
  const { data: property } = useGetPropertyQuery(id);
  if (!property) {
    return <div>Property not found</div>;
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[450px] w-full">
        {property.photoUrls.map((url: string, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={url}
              alt={`Property Image ${index + 1}`}
              fill
              priority={index == 0}
              className="object-cover cursor-pointer transition-transform duration-500 ease-in-out"
            />
            {property.photoUrls.length > 1 &&
              index !== property.photoUrls.length - 1 && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <ChevronRightIcon
                    className="text-white hover:text-gray-300 w-10 h-10 cursor-pointer bg-black/50 rounded-full p-2"
                    onClick={handleNextImage}
                  />
                </div>
              )}
            {property.photoUrls.length > 1 && index !== 0 && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <ChevronLeftIcon
                  className="text-white hover:text-gray-300 w-10 h-10 cursor-pointer bg-black/50 rounded-full p-2"
                  onClick={handlePreviousImage}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
