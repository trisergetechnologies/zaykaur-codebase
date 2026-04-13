"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

const FALLBACK = "https://picsum.photos/seed/zk-fallback/400/500";

type ProductImageProps = Omit<ImageProps, "onError"> & {
  fallbackSrc?: string;
};

export default function ProductImage({
  fallbackSrc = FALLBACK,
  src,
  alt,
  ...props
}: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      {...props}
      src={imgSrc || fallbackSrc}
      alt={alt}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}
