"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  {
    title: "Trending Now",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600",
  },
  {
    title: "Budget Buys",
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600",
  },
  {
    title: "Top Rated Picks",
    image:
      "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600",
  },
  {
    title: "Daily Essentials",
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600",
  },
];

const OfferBannerGrid = () => {
  return (
    <section className="max-w-[1600px] mx-auto px-4 py-14">

      {/* SECTION HEADER */}
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Trending Fashion
        </h2>

        <p className="text-gray-500 mt-2 text-sm md:text-base max-w-lg">
          Discover the latest styles, top rated picks and everyday essentials
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">

        {/* LEFT DOWNLOAD BANNER */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="lg:col-span-2 relative rounded-2xl overflow-hidden"
        >
          <Image
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=800"
            alt="Download App"
            width={600}
            height={500}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
              Download Now
            </h2>

            <p className="text-sm text-gray-200">
              Get exclusive offers and faster checkout on our app.
            </p>

            <button className="mt-5 bg-white text-black px-5 py-2 rounded-full w-fit text-sm font-medium hover:bg-gray-200">
              Get App
            </button>
          </div>
        </motion.div>

        {/* CATEGORY CARDS */}
        <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
          {categories.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={300}
                className="w-full h-[180px] object-cover group-hover:scale-110 transition duration-500"
              />

              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-white text-lg font-semibold">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
};

export default OfferBannerGrid;