import React, { Suspense } from "react";
import HeroBannerOne from "@/components/hero/HeroBannerOne";
import ProductsCollectionOne from "@/components/products/ProductsCollectionOne";
import CategoriesCollection from "@/components/category/CategoriesCollection";

import Loader from "@/components/others/Loader";
import LazySection from "@/components/others/LazySection";
import TopCategoryStrip from "@/components/category/TopCategoryStrip";

import OfferBannerGrid from "@/components/banners/OfferBannerGrid";
import { HomepageMerchandisingProvider } from "@/context/HomepageMerchandisingContext";
import ShopByCategoryGrid from "@/components/category/ShopByCategoryGrid";

const HomePageOne = () => {
  return (
    <HomepageMerchandisingProvider>
      <section className="overflow-hidden">
        <HeroBannerOne />
        <TopCategoryStrip />
        <Suspense fallback={<Loader />}>
          <CategoriesCollection />
        </Suspense>
        <LazySection height="300px" rootMargin="300px">
          <OfferBannerGrid />
        </LazySection>
        <LazySection height="600px" rootMargin="200px">
          <ProductsCollectionOne />
        </LazySection>
        <LazySection height="380px" rootMargin="240px">
          <ShopByCategoryGrid />
        </LazySection>
      </section>
    </HomepageMerchandisingProvider>
  );
};

export default HomePageOne;
