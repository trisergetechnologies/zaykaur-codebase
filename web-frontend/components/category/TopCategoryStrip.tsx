"use client"

import Image from "next/image"
import Link from "next/link"
import { topCategoryStrip } from "@/data/category/topCategoryStrip"
import { useHomepageMerchandising } from "@/context/HomepageMerchandisingContext"

const TopCategoryStrip = () => {
  const { payload } = useHomepageMerchandising()
  const cats =
    payload?.topCategoryStrip?.length &&
    payload.topCategoryStrip.every(
      (c) => c.name?.trim() && c.slug?.trim() && c.image?.trim()
    )
      ? payload.topCategoryStrip
      : topCategoryStrip

  return (
    <section className="bg-white border-b">

      {/* remove side margin */}
      <div className="max-w-screen-xl mx-auto px-0 py-8 sm:py-11">

        {/* balanced gap */}
        <div className="flex items-start gap-4 sm:gap-6 md:gap-10 overflow-x-auto scrollbar-hide pl-3 pr-3 sm:pl-4 sm:pr-4">

          {cats.map((cat, idx) => (

            <Link
              key={`${cat.slug}-${idx}`}
              href={`/shop?category=${encodeURIComponent(cat.slug)}`}
              className="flex flex-col items-center min-w-[96px] sm:min-w-[120px] group"
            >

              {/* BIGGER IMAGE */}
              <div className="relative w-[88px] h-[88px] sm:w-[104px] sm:h-[104px] md:w-[124px] md:h-[124px] rounded-full overflow-hidden bg-gray-100 border group-hover:shadow-md transition">

                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 88px, (max-width: 768px) 104px, 124px"
                  className="object-cover group-hover:scale-105 transition"
                />

              </div>

              {/* TEXT */}
              <span className="text-xs font-medium text-gray-700 mt-3 text-center group-hover:text-pink-600 whitespace-nowrap">
                {cat.name}
              </span>

            </Link>

          ))}

        </div>

      </div>

    </section>
  )
}

export default TopCategoryStrip