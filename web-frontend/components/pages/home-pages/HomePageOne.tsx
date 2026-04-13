import React, { Suspense } from "react";
import HeroBannerOne from "@/components/hero/HeroBannerOne";
import ProductsCollectionOne from "@/components/products/ProductsCollectionOne";
import CategoriesCollection from "@/components/category/CategoriesCollection"; //Ui rendder for Home page 


import Loader from "@/components/others/Loader";
import TopCategoryStrip from "@/components/category/TopCategoryStrip";

import OfferBannerGrid from "@/components/banners/OfferBannerGrid";



const HomePageOne = () => {
  return (
    <section className="overflow-hidden">
      <HeroBannerOne />
       <TopCategoryStrip />
       <Suspense fallback={<Loader />}>
        <CategoriesCollection />
      </Suspense>
      <OfferBannerGrid/>
      <ProductsCollectionOne />
    </section>
  );
};

export default HomePageOne;
