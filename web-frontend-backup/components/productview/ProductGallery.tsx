"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const ProductGallery = ({ images }: { images: string[] }) => {
  const safeImages =
    Array.isArray(images) && images.length > 0
      ? images
      : ["/images/product/product-01.jpg"];

  const [active, setActive] = useState(0);
  const galleryKey = safeImages.join("|");
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setActive(0); }, [galleryKey]);

  const go = (dir: 1 | -1) =>
    setActive((p) => (p + dir + safeImages.length) % safeImages.length);

  const scrollThumbs = (dir: 1 | -1) => {
    thumbRef.current?.scrollBy({ top: dir * 72, behavior: "smooth" });
  };

  return (
    <div className="flex gap-2.5">
      {/* vertical thumbnails -- desktop */}
      <div className="relative hidden w-[60px] flex-col md:flex">
        {safeImages.length > 5 && (
          <button
            type="button"
            onClick={() => scrollThumbs(-1)}
            className="absolute -top-0.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white p-0.5 shadow"
            aria-label="Scroll up"
          >
            <ChevronUp size={12} className="text-gray-500" />
          </button>
        )}
        <div
          ref={thumbRef}
          className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: 360 }}
        >
          {safeImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded border transition-all ${
                active === i
                  ? "border-pink-500 shadow-sm"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image src={src} alt="" fill sizes="58px" className="object-cover" />
            </button>
          ))}
        </div>
        {safeImages.length > 5 && (
          <button
            type="button"
            onClick={() => scrollThumbs(1)}
            className="absolute -bottom-0.5 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white p-0.5 shadow"
            aria-label="Scroll down"
          >
            <ChevronDown size={12} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* main image */}
      <div className="relative flex-1">
        <div className="relative aspect-square w-full overflow-hidden rounded bg-gray-50">
          <Image
            src={safeImages[active]}
            alt="Product"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            priority
            className="object-contain object-center"
          />

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1 shadow-sm transition hover:shadow"
                aria-label="Previous"
              >
                <ChevronLeft size={16} className="text-gray-600" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-1 shadow-sm transition hover:shadow"
                aria-label="Next"
              >
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            </>
          )}
        </div>

        {/* horizontal thumbnails -- mobile */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 md:hidden">
          {safeImages.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-12 w-12 shrink-0 overflow-hidden rounded border transition-all ${
                active === i
                  ? "border-pink-500"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <Image src={src} alt="" fill sizes="48px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
