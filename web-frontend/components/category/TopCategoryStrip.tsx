"use client"

import Image from "next/image"
import Link from "next/link"
import { topCategoryStrip } from "@/data/category/topCategoryStrip"

const TopCategoryStrip = () => {
  return (
    <section className="bg-white border-b">

      {/* remove side margin */}
      <div className="max-w-screen-xl mx-auto px-0 py-11">

        {/* balanced gap */}
        <div className="flex items-start gap-10 overflow-x-auto scrollbar-hide pl-2 pr-2">

          {topCategoryStrip.map((cat) => (

            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center min-w-[120px] group"
            >

              {/* BIGGER IMAGE */}
              <div className="w-[124px] h-[124px] rounded-full overflow-hidden bg-gray-100 border group-hover:shadow-md transition">

                <Image
                  src={cat.image}
                  alt={cat.name}
                  width={124}
                  height={124}
                  className="object-cover w-full h-full group-hover:scale-105 transition"
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