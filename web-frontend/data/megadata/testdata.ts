// ================= TYPES =================

export interface MenuColumn {
  columnTitle: string;
  items: string[];
}

// ================= MEN =================

export const menData: MenuColumn[] = [
  {
    columnTitle: "Topwear",
    items: ["Shirts", "T-Shirts", "Sweatshirts", "Jackets"],
  },
  {
    columnTitle: "Bottomwear",
    items: ["Jeans", "Trousers", "Shorts"],
  },
  {
    columnTitle: "Footwear",
    items: ["Sneakers", "Boots", "Sandals"],
  },
  {
    columnTitle: "Accessories",
    items: ["Watches", "Belts", "Caps"],
  },
];

// ================= WOMEN =================

export const womenData: MenuColumn[] = [
  {
    columnTitle: "Clothing",
    items: ["Dresses", "Tops", "Ethnic Wear", "Skirts"],
  },
  {
    columnTitle: "Footwear",
    items: ["Heels", "Flats", "Sneakers"],
  },
  {
    columnTitle: "Accessories",
    items: ["Bags", "Jewellery", "Sunglasses"],
  },
  {
    columnTitle: "Beauty",
    items: ["Makeup", "Skincare", "Fragrance"],
  },
];

// ================= BEAUTY =================

export const beautyData: MenuColumn[] = [
  {
    columnTitle: "Makeup",
    items: ["Lipstick", "Foundation", "Mascara", "Blush"],
  },
  {
    columnTitle: "Skincare",
    items: ["Moisturizer", "Serum", "Face Wash", "Sunscreen"],
  },
  {
    columnTitle: "Haircare",
    items: ["Shampoo", "Conditioner", "Hair Oil"],
  },
  {
    columnTitle: "Fragrance",
    items: ["Perfume", "Deodorant", "Body Mist"],
  },
];

// ================= KIDS =================

export const kidsData: MenuColumn[] = [
  {
    columnTitle: "Boys",
    items: ["T-Shirts", "Jeans", "Shorts", "Jackets"],
  },
  {
    columnTitle: "Girls",
    items: ["Dresses", "Tops", "Leggings", "Skirts"],
  },
  {
    columnTitle: "Infants",
    items: ["Rompers", "Onesies", "Sets"],
  },
  {
    columnTitle: "Footwear",
    items: ["Sneakers", "Sandals", "School Shoes"],
  },
];

// ================= GIRLS =================

export const girlsData: MenuColumn[] = [
  {
    columnTitle: "Clothing",
    items: ["Tops", "Jeans", "Dresses", "Skirts"],
  },
  {
    columnTitle: "Footwear",
    items: ["Sneakers", "Flats", "Sandals"],
  },
  {
    columnTitle: "Accessories",
    items: ["Bags", "Hair Accessories", "Watches"],
  },
  {
    columnTitle: "Trending",
    items: ["New Arrivals", "Best Sellers", "Sale"],
  },
];
