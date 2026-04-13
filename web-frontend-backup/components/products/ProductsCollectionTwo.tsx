import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { productsData } from "@/data/products/productsData";

import React from "react";
import SingleProductCartView from "../product/SingleProductCartView";

const ProductsCollectionTwo = () => {
  //get products data from server here based on the category or tab value
  const data = productsData;

  return (
    <section className="max-w-screen-xl mx-auto py-16 px-4 md:px-8 w-full">
      <div className="zk-premium-surface rounded-3xl border border-slate-100/80 p-5 md:p-8">
      <Tabs defaultValue="new-arrivals" className="w-full space-y-8 mx-0">
        <TabsList className="font-semibold bg-transparent w-full text-center gap-2 md:gap-3">
          <TabsTrigger value="new-arrivals" className="md:text-xl rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            New Arrivals
          </TabsTrigger>
          <TabsTrigger value="best-sellers" className="md:text-xl rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Best Sellers
          </TabsTrigger>
          <TabsTrigger value="feauted" className="md:text-xl rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Featured
          </TabsTrigger>
        </TabsList>
        <TabsContent value="new-arrivals" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 w-full">
            {data?.slice(0, 8)?.map((product) => {
              return (
                <SingleProductCartView key={product.id} product={product} />
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="best-sellers">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {data?.slice(0, 8)?.map((product) => {
              return (
                <SingleProductCartView key={product.id} product={product} />
              );
            })}
          </div>
        </TabsContent>
        <TabsContent value="feauted">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {data?.slice(0, 8)?.map((product) => {
              return (
                <SingleProductCartView key={product.id} product={product} />
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </section>
  );
};

export default ProductsCollectionTwo;
