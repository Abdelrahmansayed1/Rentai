"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [search, setSearch] = useState("");
  return (
    <div className="relative h-screen w-full">
      <Image
        src="/landing-splash.jpg"
        alt="Rentiful landing splash"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-60">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-1/3 transform -translate-y-1/2 -translate-x-1/2 text-center w-full"
        >
          <div className="max-w-4xl mx-auto px-16 sm:px-12">
            <h1 className="text-5xl font-bold text-white mb-4">
              Find Your Perfect Rental
            </h1>
            <p className="text-xl text-white mb-8">
              Explore a wide range of rentals, from cozy apartments to luxurious
              homes, all in one place.
            </p>

            <div className="flex justify-center">
              <Input
                type="text"
                placeholder="Search for a rental"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12"
              />
              <Button className="rounded-none rounded-r-xl bg-secondary-500 text-white h-12 border-none hover:bg-secondary-600">
                Search
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
