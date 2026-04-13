"use client";

import React from "react";
import RatingReview from "../others/RatingReview";
import Link from "next/link";
import Image from "next/image";
import AddToWishlistBtn from "../buttons/AddToWishlistBtn";
import AddToCartBtn from "../buttons/AddToCartBtn";
import { Product } from "@/types";
import { calculateDiscount } from "@/lib/calculateDiscount";

const SingleProductListView = ({ product }: { product: Product }) => {
  const { category, discount, id, images, name, price, rating, reviews, reviewCount } =
    product;

  const discountPrice = calculateDiscount(price, discount);

  return (
    <Link
      href={`/shop/product/${id}`}
      className="group flex flex-col sm:flex-row gap-4 p-3 border border-gray-100 rounded-lg bg-white hover:shadow-md transition-all duration-300"
    >
      {/* IMAGE (Reduced Height) */}
      <div className="relative w-full sm:w-[180px] aspect-[4/5] bg-gray-50 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={images[0]}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-grow gap-1">
        <span className="text-[9px] uppercase tracking-widest text-blue-600 font-semibold">
          {category}
        </span>

        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
          {name}
        </h3>

        <RatingReview rating={rating} review={reviewCount ?? reviews.length} />

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">
            ₹{discountPrice.toLocaleString()}
          </span>

          {discount > 0 && (
            <>
              <span className="text-xs text-gray-400 line-through">
                ₹{price.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-green-600">
                {discount}% OFF
              </span>
            </>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-snug">
          Premium quality {category}.
        </p>

        <div
          className="flex items-center gap-2 mt-2"
          onClick={(e) => e.preventDefault()}
        >
          <AddToCartBtn product={{ ...product, quantity: 1, selectedColor: "" }} />
          <AddToWishlistBtn product={product} />
        </div>
      </div>
    </Link>
  );
};

export default SingleProductListView;
