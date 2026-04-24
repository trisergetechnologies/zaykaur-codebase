/**
 * Default homepage merchandising content (matches web-frontend static data).
 * Returned when no HomepageContent document exists in DB.
 */
export function getDefaultHomepageContent() {
  return {
    featuredProductIds: [],
    heroSlides: [
      {
        title: "Dominate the Competition with the Legion X7",
        description:
          "Unleash ultimate gaming power with the Legion X7. Featuring a top-of-the-line processor, powerful graphics card, and a high-refresh-rate display.",
        images: [
          "https://rukminim1.flixcart.com/image/1536/1536/xif0q/sari/j/w/v/free-beautiful-sequence-and-embroidery-work-with-coding-work-original-imahfz7cfmg3qm4z.jpeg?q=90",
        ],
        button: "Shop Now",
        discountText: "Buy now Get 10% off",
        link: "shop?category=Computers",
      },
      {
        title: "Introducing the All-New NovaPhone 15",
        description:
          "Experience unparalleled performance with our most advanced phone yet. Blazing-fast processor, stunning camera system, and a revolutionary display.",
        images: [
          "https://rukminim1.flixcart.com/image/1536/1536/xif0q/watch/a/s/m/1-anlg-428-blue-blu-analogue-boys-original-imahkhpuvevbrj3v.jpeg?q=90",
        ],
        button: "Order Now",
        discountText: "Buy now Get 5% off",
        link: "shop?category=Smartphones",
      },
      {
        title: "High-resolution noise-canceling headphones.",
        description: "Immerse Yourself in Pure Sound with the SonicPro Max",
        images: [
          "https://rukminim1.flixcart.com/image/1536/1536/xif0q/lehenga-choli/i/d/z/free-na-ariya-d2-pavitraa-sarees-original-imah28mbh4quahcz.jpeg?q=90",
        ],
        button: "Shop Now",
        discountText: "Buy now Get 15% off",
        link: "shop?category=Headphones",
      },
    ],
    topCategoryStrip: [
      { name: "Ethnic Wear", slug: "ethnic-wear", image: "/strip/saree.png" },
      {
        name: "Western Dresses",
        slug: "western-dresses",
        image: "/images/products/apple-watch-9-removebg-preview.png",
      },
      { name: "Menswear", slug: "menswear", image: "/strip/dress.png" },
      { name: "Footwear", slug: "footwear", image: "/strip/foot.png" },
      { name: "Home Decor", slug: "home-decor", image: "/strip/homedecor.png" },
      { name: "Beauty", slug: "beauty", image: "/strip/beauty.png" },
      { name: "Accessories", slug: "accessories", image: "/strip/acce.png" },
      { name: "Grocery", slug: "grocery", image: "/strip/gy.png" },
    ],
    bestDeals: {
      sectionEyebrow: "Exclusive Offers",
      sectionTitle: "BEST DEALS",
      exploreAllLabel: "Explore All Deals",
      exploreAllHref: "/shop",
      tiles: [
        {
          title: "Trending Now",
          subtitle: "Latest Fashion Picks",
          image:
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900",
          link: "/shop?category=fashion",
          gridClass: "lg:col-span-2 lg:row-span-2",
          badge: "Hot",
        },
        {
          title: "Budget Buys",
          subtitle: "Under ₹999",
          image:
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=900",
          link: "/shop?max=999&sort=price_asc",
          gridClass: "lg:col-span-2 lg:row-span-1",
          badge: "Sale",
        },
        {
          title: "Top Rated",
          subtitle: "Customer Favorites",
          image:
            "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=900",
          link: "/shop?sort=latest",
          gridClass: "lg:col-span-1 lg:row-span-1",
        },
        {
          title: "Essentials",
          subtitle: "Daily Comfort",
          image:
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=900",
          link: "/shop?category=kids",
          gridClass: "lg:col-span-1 lg:row-span-1",
        },
      ],
    },
    trendingFashion: {
      title: "Trending Fashion",
      subtitle:
        "Discover the latest styles, top rated picks and everyday essentials",
      promo: {
        image:
          "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=800",
        title: "Download Now",
        body: "Get exclusive offers and faster checkout on our app.",
        ctaLabel: "Get App",
        ctaLink: "",
      },
      tiles: [
        {
          title: "Trending Now",
          image:
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=600",
          link: "/shop?category=fashion",
        },
        {
          title: "Budget Buys",
          image:
            "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=600",
          link: "/shop?max=999&sort=price_asc",
        },
        {
          title: "Top Rated Picks",
          image:
            "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600",
          link: "/shop?sort=latest",
        },
        {
          title: "Daily Essentials",
          image:
            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600",
          link: "/shop?category=kids",
        },
      ],
    },
  };
}
