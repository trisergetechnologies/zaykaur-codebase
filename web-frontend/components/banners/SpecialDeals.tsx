import Image from "next/image";
import Link from "next/link";
import React from "react";

const deals = [
  {
    title: "Audio essentials",
    subtitle: "Save on headphones & more",
    href: "/shop?category=Headphones",
    image: "/images/products/senheiser-removebg-preview.png",
  },
  {
    title: "Wearables",
    subtitle: "Track smarter this season",
    href: "/shop",
    image: "/images/products/apple-watch-9-removebg-preview.png",
  },
  {
    title: "Style picks",
    subtitle: "Fresh looks under budget",
    href: "/shop",
    image: "/images/products/shirt.png",
  },
];

const SpecialDeals = ({ textCenter }: { textCenter: boolean }) => {
  return (
    <section className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900/40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {!textCenter ? (
          <div className="flex flex-wrap items-center justify-center md:justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white border-l-4 border-l-rose-500 p-2">
              Special deals
            </h2>
          </div>
        ) : (
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-10 border-l-4 border-l-rose-500 w-fit mx-auto p-2 text-start md:text-center">
            Special deals
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {deals.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex flex-col rounded-2xl bg-white dark:bg-gray-800 shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full bg-gradient-to-b from-gray-100 to-white dark:from-gray-700 dark:to-gray-800">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {item.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialDeals;
