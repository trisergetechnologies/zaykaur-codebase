// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { ArrowRight } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { productsData } from "@/data/products/productsData";
// import { Button } from "@/components/ui/button";
// import { groupByCategory } from "../../utils/groupByCategory";

// const ProductCategoryCollection = () => {
//   const router = useRouter();

//   const categoriesMap = groupByCategory(productsData);

//   const handleCategoryClick = (category: string) => {
//     router.push(`/shop?category=${category}`);
//   };

//   return (
//     <section className="py-16 bg-slate-200 dark:bg-slate-800">
//       <div className="max-w-screen-xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {Object.entries(categoriesMap).map(([category, products]: any) => (
//           <div
//             key={category}
//             onClick={() => handleCategoryClick(category)}
//             className="flex flex-col justify-between gap-4 p-6 rounded-xl bg-white dark:bg-slate-900 shadow-md cursor-pointer"
//           >
//             <h2 className="text-xl md:text-2xl font-semibold text-center">
//               Best Deals On{" "}
//               <span className="font-bold capitalize">{category}</span>
//             </h2>

//             <div className="grid grid-cols-2 gap-4">
//               {products.slice(0, 4).map((product: any) => (
//                 <div
//                   key={product.id}
//                   className="flex flex-col items-center text-center gap-2"
//                 >
//                   <Image
//                     src={product.images[0]}
//                     alt={product.name}
//                     width={100}
//                     height={100}
//                     className="object-contain"
//                   />

//                   <p className="bg-rose-600 px-2 py-1 text-xs text-white">
//                     {product.discount}% OFF
//                   </p>

//                   <Link
//                     href={`/shop/${product.id}`}
//                     onClick={(e) => e.stopPropagation()}
//                     className="font-semibold hover:text-green-500"
//                   >
//                     {product.name.slice(0, 15)}...
//                   </Link>
//                 </div>
//               ))}
//             </div>

//             <Button variant="outline" size="lg" className="flex gap-2">
//               <ArrowRight />
//               View {category}
//             </Button>
//           </div>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ProductCategoryCollection;
