// "use client";

// import { ArrowRight } from "lucide-react";
// import Image from "next/image";
// import { Button } from "../ui/button";
// import { useRouter, useSearchParams } from "next/navigation";
// import { productsData } from "@/data/products/productsData";
// import Link from "next/link";

// const CATEGORY_CONFIG = [
//   { title: "Electronics", slug: "electronics" },
//   { title: "Fashion", slug: "fashion" },
//   { title: "Home Appliances", slug: "home-appliances" },
// ];

// const CategoriesCollection = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   const handleCollectionClick = (category: string) => {
//     const params = new URLSearchParams(searchParams);
//     params.set("category", category);
//     router.push(`/shop?${params.toString()}`);
//   };

//   return (
//     <section className="py-16 bg-white border-t border-gray-200">
//       <div className="max-w-screen-xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {CATEGORY_CONFIG.map(({ title, slug }) => {
//           const products = productsData.filter(
//             (item) => item.category.toLowerCase() === slug
//           );

//           if (products.length === 0) return null;

//           return (
//             <div
//               key={slug}
//               onClick={() => handleCollectionClick(slug)}
//               className="
//                 group cursor-pointer
//                 bg-white
//                 border border-gray-200
//                 rounded-lg p-6
//                 flex flex-col justify-between gap-6
//                 hover:shadow-md transition
//               "
//             >
//               {/* HEADER */}
//               <h2 className="text-lg md:text-xl font-semibold text-gray-900 text-center">
//                 Best Deals on <span className="font-bold">{title}</span>
//               </h2>

//               {/* PRODUCT PREVIEW */}
//               <div className="grid grid-cols-2 gap-4">
//                 {products.slice(0, 4).map((product) => (
//                   <div
//                     key={product.id}
//                     className="flex flex-col items-center text-center gap-2"
//                   >
//                     <Image
//                       src={product.images[0]}
//                       alt={product.name}
//                       width={90}
//                       height={90}
//                       className="object-contain"
//                     />

//                     {product.discount > 0 && (
//                       <span className="text-xs font-medium text-blue-600">
//                         {product.discount}% OFF
//                       </span>
//                     )}

//                     <Link
//                       href={`/shop/${product.id}`}
//                       onClick={(e) => e.stopPropagation()}
//                       className="text-sm font-medium text-gray-800 hover:underline"
//                     >
//                       {product.name.slice(0, 18)}…
//                     </Link>
//                   </div>
//                 ))}
//               </div>

//               {/* CTA */}
//               <Button
//                 variant="outline"
//                 size="lg"
//                 className="w-full flex items-center justify-center gap-2 text-sm font-semibold"
//               >
//                 Browse Collection <ArrowRight size={18} />
//               </Button>
//             </div>
//           );
//         })}
//       </div>
//     </section>
//   );
// };

// export default CategoriesCollection;
