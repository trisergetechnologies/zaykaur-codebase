"use client";

import React, { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bannerData } from "@/data/banner/bannerData";
import Link from "next/link";

const HeroBannerOne = () => {
  const [api, setApi] = useState<CarouselApi | undefined>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);

    return () => {
      api.off("select", handleSelect);
    };
  }, [api]);

  return (
    <section className="relative w-full overflow-hidden">
      <Carousel
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {bannerData.map((data, index) => (
            <CarouselItem key={index}>
              <div className="relative h-[85vh] min-h-[600px] flex items-center">

                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={data.images[0]}
                    alt={data.title}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

                {/* Content Container */}
                <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-20 w-full">
                  <div className="max-w-2xl">
                    <AnimatePresence mode="wait">
                      {current === index && (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          className="space-y-8 text-white"
                        >
                          {/* Discount Badge */}
                          <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-block px-5 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold tracking-widest uppercase"
                          >
                            {data.discountText}
                          </motion.div>

                          {/* Title */}
                          <motion.h2
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight"
                          >
                            {data.title}
                          </motion.h2>

                          {/* Description */}
                          <motion.p
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/80 text-lg md:text-xl max-w-lg"
                          >
                            {data.description}
                          </motion.p>

                          {/* CTA Button */}
                          <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center gap-4 pt-4"
                          >
                            <Link href={data.link}>
                              <Button
                                size="lg"
                                className="bg-white text-black hover:bg-gray-200 px-10 py-6 text-lg font-bold rounded-none"
                              >
                                {data.button}
                                <ArrowRight className="ml-2" />
                              </Button>
                            </Link>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Pagination Bars */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {bannerData.map((_, i) => (
          <button
            key={i}
            onClick={() => api?.scrollTo(i)}
            className={`h-1 transition-all duration-300 ${
              current === i
                ? "w-14 bg-white"
                : "w-6 bg-white/40 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBannerOne;