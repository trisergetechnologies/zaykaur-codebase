// "use client";

// import React, { useMemo } from "react";
// import { productsData } from "@/data/products/productsData";
// import SingleProductCartView from "../product/SingleProductCartView";
// import { SearchParams } from "@/types";
// import { filterProducts } from "@/lib/filterProducts";

// interface ShopPageContainerProps {
//   searchParams: SearchParams;
//   gridColumn?: number;
// }

// const ShopPageContainer = ({
//   searchParams,
//   gridColumn,
// }: ShopPageContainerProps) => {

//   const filteredProducts = useMemo(() => {
//     return filterProducts(productsData, searchParams);
//   }, [
//     searchParams.category,
//     searchParams.brand,
//     searchParams.color,
//     searchParams.min,
//     searchParams.max,
//   ]);

//   if (filteredProducts.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-screen text-xl font-semibold">
//         No products found
//       </div>
//     );
//   }

//   const gridClass =
//     gridColumn === 4
//       ? "lg:grid-cols-4"
//       : gridColumn === 2
//       ? "lg:grid-cols-2"
//       : "lg:grid-cols-3";

//   return (
//     <div
//       className={`max-w-screen-xl mx-auto py-6 grid grid-cols-1 md:grid-cols-2 ${gridClass} gap-6`}
//     >
//       {filteredProducts.map((product) => (
//         <SingleProductCartView
//           key={product.id}
//           product={product}
//         />
//       ))}
//     </div>
//   );
// };

// export default ShopPageContainer;
