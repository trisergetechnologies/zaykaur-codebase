/**
 * ZayKaur comprehensive seed script.
 * Run:     npm run seed       (or node src/seed.js)
 * Destroy: npm run seed:destroy
 *
 * Test credentials:
 *   Admin:      admin@zaykaur.com      / 123456
 *   Seller 1:   seller@zaykaur.com     / 123456  (Priya Textiles – ethnic wear)
 *   Seller 2:   seller2@zaykaur.com    / 123456  (Rajasthan Silks – silk/banarasi)
 *   Seller 3:   seller3@zaykaur.com    / 123456  (TechMart India – electronics)
 *   Customer 1: customer1@zaykaur.com  / 123456  (Anita Sharma – has orders, cart, wishlist)
 *   Customer 2: customer2@zaykaur.com  / 123456  (Rahul Verma)
 */

import "./loadEnv.js";
import mongoose from "mongoose";

import Cart from "./models/Cart.js";
import Category from "./models/Category.js";
import Coupon from "./models/Coupon.js";
import DeliveryProvider from "./models/DeliveryProvider.js";
import IdempotencyKey from "./models/IdempotencyKey.js";
import Notification from "./models/Notification.js";
import Order from "./models/Order.js";
import Payment from "./models/Payment.js";
import Product from "./models/Product.js";
import ProductRecommendation from "./models/ProductRecommendation.js";
import Review from "./models/Review.js";
import ReturnRequest from "./models/ReturnRequest.js";
import SellerProfile from "./models/SellerProfile.js";
import StockReservation from "./models/StockReservation.js";
import TaxRule from "./models/TaxRule.js";
import User from "./models/User.js";
import Wishlist from "./models/Wishlist.js";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

const PASSWORD = "123456";
const IMG = (w = 600, h = 600, id = "") =>
  `https://picsum.photos/seed/zk${id || Math.random().toString(36).slice(2, 8)}/${w}/${h}`;

const ALL_MODELS = [
  IdempotencyKey, StockReservation, ReturnRequest, Payment,
  Notification, Review, Coupon, ProductRecommendation, Wishlist,
  Cart, Order, DeliveryProvider, TaxRule, Product,
  SellerProfile, Category, User,
];

async function destroyAll() {
  await connectDB();
  await Promise.all(ALL_MODELS.map((M) => M.deleteMany()));
  console.log("All data destroyed");
  process.exit(0);
}

async function seedData() {
  try {
    await connectDB();
    await Promise.all(ALL_MODELS.map((M) => M.deleteMany()));
    console.log("Database cleaned\n");

    // =====================================================================
    // 1. USERS
    // =====================================================================
    const admin = await User.create({
      name: "Admin User",
      email: "admin@zaykaur.com",
      password: PASSWORD,
      role: "admin",
      isEmailVerified: true,
      phone: "9000000001",
    });

    const seller1 = await User.create({
      name: "Priya Textiles",
      email: "seller@zaykaur.com",
      password: PASSWORD,
      role: "seller",
      isEmailVerified: true,
      phone: "9000000002",
    });

    const seller2 = await User.create({
      name: "Rajasthan Silks",
      email: "seller2@zaykaur.com",
      password: PASSWORD,
      role: "seller",
      isEmailVerified: true,
      phone: "9000000003",
    });

    const seller3 = await User.create({
      name: "TechMart India",
      email: "seller3@zaykaur.com",
      password: PASSWORD,
      role: "seller",
      isEmailVerified: true,
      phone: "9000000004",
    });

    const customer1 = await User.create({
      name: "Anita Sharma",
      email: "customer1@zaykaur.com",
      password: PASSWORD,
      role: "customer",
      isEmailVerified: true,
      phone: "9876543210",
      addresses: [
        {
          fullName: "Anita Sharma",
          phone: "9876543210",
          street: "42 MG Road, Flat 3B",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560001",
          country: "India",
          isDefault: true,
        },
        {
          fullName: "Anita Sharma (Work)",
          phone: "9876543211",
          street: "Tech Park, Tower A, Whitefield",
          city: "Bangalore",
          state: "Karnataka",
          postalCode: "560066",
          country: "India",
          isDefault: false,
        },
      ],
    });

    const customer2 = await User.create({
      name: "Rahul Verma",
      email: "customer2@zaykaur.com",
      password: PASSWORD,
      role: "customer",
      isEmailVerified: true,
      phone: "9123456789",
      addresses: [
        {
          fullName: "Rahul Verma",
          phone: "9123456789",
          street: "15 Park Street, Flat 2A",
          city: "Kolkata",
          state: "West Bengal",
          postalCode: "700016",
          country: "India",
          isDefault: true,
        },
      ],
    });

    console.log("  Users seeded (6)");

    // =====================================================================
    // 2. CATEGORIES  (root → sub → sub-sub where needed)
    // =====================================================================
    const rootCats = await Category.insertMany([
      { name: "Electronics",   slug: "electronics",   level: 0, displayOrder: 0, image: IMG(300, 300, "cat-elec") },
      { name: "Fashion",       slug: "fashion",       level: 0, displayOrder: 1, image: IMG(300, 300, "cat-fash") },
      { name: "Kids",          slug: "kids",          level: 0, displayOrder: 2, image: IMG(300, 300, "cat-kids") },
      { name: "TV & Appliances", slug: "tv-appliances", level: 0, displayOrder: 3, image: IMG(300, 300, "cat-tva") },
      { name: "Furniture",     slug: "furniture",     level: 0, displayOrder: 4, image: IMG(300, 300, "cat-furn") },
      { name: "Beauty",        slug: "beauty",        level: 0, displayOrder: 5, image: IMG(300, 300, "cat-beau") },
      { name: "Home & Kitchen", slug: "home-kitchen", level: 0, displayOrder: 6, image: IMG(300, 300, "cat-homk") },
    ]);
    const [catElec, catFash, catKids, catTVA, catFurn, catBeauty, catHome] = rootCats;

    const subCats = await Category.insertMany([
      // Electronics subs
      { name: "Laptops",           slug: "laptops",           parent: catElec._id, ancestors: [catElec._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-lap"),
        variantAttributeTemplates: [
          { key: "ram", label: "RAM", suggestedOptions: ["8GB","16GB","32GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", suggestedOptions: ["256GB SSD","512GB SSD","1TB SSD"], displayOrder: 1 },
        ] },
      { name: "Mobiles",           slug: "mobiles",           parent: catElec._id, ancestors: [catElec._id], level: 1, displayOrder: 1, image: IMG(300, 300, "sub-mob"),
        variantAttributeTemplates: [
          { key: "ram", label: "RAM", suggestedOptions: ["4GB","6GB","8GB","12GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", suggestedOptions: ["64GB","128GB","256GB"], displayOrder: 1 },
          { key: "color", label: "Color", suggestedOptions: ["Black","Blue","Green","White"], displayOrder: 2 },
        ] },
      { name: "Audio & Headphones", slug: "audio-headphones", parent: catElec._id, ancestors: [catElec._id], level: 1, displayOrder: 2, image: IMG(300, 300, "sub-aud") },
      { name: "Computers & Laptops", slug: "computers-laptops", parent: catElec._id, ancestors: [catElec._id], level: 1, displayOrder: 3, image: IMG(300, 300, "sub-comp") },

      // Fashion subs
      { name: "Sarees",   slug: "sarees",   parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-sar"),
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["5.5m","6m","6.5m"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["Red","Blue","Green","Gold","Pink"], displayOrder: 1 },
        ] },
      { name: "Kurtis",   slug: "kurtis",   parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 1, image: IMG(300, 300, "sub-kur"),
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["Red","Blue","White","Maroon"], displayOrder: 1 },
        ] },
      { name: "Lehenga",  slug: "lehenga",  parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 2, image: IMG(300, 300, "sub-leh") },
      { name: "Kurtas",   slug: "kurtas",   parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 3, image: IMG(300, 300, "sub-kta"),
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["White","Beige","Navy","Black"], displayOrder: 1 },
        ] },
      { name: "T-Shirts", slug: "t-shirts", parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 4, image: IMG(300, 300, "sub-tsh"),
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["Black","White","Blue","Grey"], displayOrder: 1 },
        ] },
      { name: "Jeans",    slug: "jeans",     parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 5, image: IMG(300, 300, "sub-jns") },
      { name: "Shirts",   slug: "shirts",    parent: catFash._id, ancestors: [catFash._id], level: 1, displayOrder: 6, image: IMG(300, 300, "sub-shr") },

      // Kids subs
      { name: "Kids Clothing", slug: "kids-clothing", parent: catKids._id, ancestors: [catKids._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-kcl") },
      { name: "Kids Toys",     slug: "kids-toys",     parent: catKids._id, ancestors: [catKids._id], level: 1, displayOrder: 1, image: IMG(300, 300, "sub-kty") },
      { name: "Kids Shoes",    slug: "kids-shoes",    parent: catKids._id, ancestors: [catKids._id], level: 1, displayOrder: 2, image: IMG(300, 300, "sub-ksh") },

      // TV & Appliances subs
      { name: "Televisions",      slug: "televisions",      parent: catTVA._id, ancestors: [catTVA._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-tv") },
      { name: "Home Appliances",  slug: "home-appliances",  parent: catTVA._id, ancestors: [catTVA._id], level: 1, displayOrder: 1, image: IMG(300, 300, "sub-hap") },

      // Furniture subs
      { name: "Sofas",       slug: "sofas",       parent: catFurn._id, ancestors: [catFurn._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-sof") },
      { name: "Beds",        slug: "beds",        parent: catFurn._id, ancestors: [catFurn._id], level: 1, displayOrder: 1, image: IMG(300, 300, "sub-bed") },
      { name: "Tables",      slug: "tables",      parent: catFurn._id, ancestors: [catFurn._id], level: 1, displayOrder: 2, image: IMG(300, 300, "sub-tbl") },
      { name: "Chairs",      slug: "chairs",      parent: catFurn._id, ancestors: [catFurn._id], level: 1, displayOrder: 3, image: IMG(300, 300, "sub-chr") },

      // Beauty subs
      { name: "Skincare",    slug: "skincare",    parent: catBeauty._id, ancestors: [catBeauty._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-skn") },
      { name: "Makeup",      slug: "makeup",      parent: catBeauty._id, ancestors: [catBeauty._id], level: 1, displayOrder: 1, image: IMG(300, 300, "sub-mkp") },

      // Home & Kitchen subs
      { name: "Kitchen Appliances", slug: "kitchen-appliances", parent: catHome._id, ancestors: [catHome._id], level: 1, displayOrder: 0, image: IMG(300, 300, "sub-kap") },
    ]);

    // Convenient aliases
    const [
      laptops, mobiles, audio, compLaptops,
      sarees, kurtis, lehenga, kurtas, tshirts, jeans, shirts,
      kidClothing, kidToys, kidShoes,
      tvs, homeAppl,
      sofas, beds, tables, chairs,
      skincare, makeup,
      kitchenAppl,
    ] = subCats;

    console.log("  Categories seeded (" + (rootCats.length + subCats.length) + ")");

    // =====================================================================
    // 3. SELLER PROFILES
    // =====================================================================
    await SellerProfile.create([
      {
        userId: seller1._id, shopName: "Priya Textiles", slug: "priya-textiles",
        description: "Premium ethnic wear and traditional sarees from Varanasi.",
        isActive: true, isVerified: true, onboardingStatus: "approved",
        businessAddress: { street: "Chowk, Varanasi", city: "Varanasi", state: "Uttar Pradesh", postalCode: "221001", country: "India" },
      },
      {
        userId: seller2._id, shopName: "Rajasthan Silks", slug: "rajasthan-silks",
        description: "Authentic Rajasthani and Banarasi silk collection.",
        isActive: true, isVerified: true, onboardingStatus: "approved",
        businessAddress: { street: "Johari Bazaar", city: "Jaipur", state: "Rajasthan", postalCode: "302003", country: "India" },
      },
      {
        userId: seller3._id, shopName: "TechMart India", slug: "techmart-india",
        description: "Laptops, mobiles, headphones, and electronics at best prices.",
        isActive: true, isVerified: true, onboardingStatus: "approved",
        businessAddress: { street: "Nehru Place", city: "New Delhi", state: "Delhi", postalCode: "110019", country: "India" },
      },
    ]);
    console.log("  Seller profiles seeded (3)");

    // =====================================================================
    // 4. TAX RULES
    // =====================================================================
    await TaxRule.insertMany([
      { code: "GST_5",  name: "GST 5%",  rate: 5,  type: "gst", isActive: true },
      { code: "GST_12", name: "GST 12%", rate: 12, type: "gst", isActive: true },
      { code: "GST_18", name: "GST 18%", rate: 18, type: "gst", isActive: true },
      { code: "GST_28", name: "GST 28%", rate: 28, type: "gst", isActive: true },
    ]);
    console.log("  Tax rules seeded (4)");

    // =====================================================================
    // 5. DELIVERY PROVIDERS
    // =====================================================================
    await DeliveryProvider.insertMany([
      { code: "MANUAL",    name: "Manual / Self",  isIntegrated: false, isActive: true },
      { code: "BLUEDART",  name: "Blue Dart",      isIntegrated: false, isActive: true },
      { code: "DELHIVERY", name: "Delhivery",      isIntegrated: false, isActive: true },
    ]);
    console.log("  Delivery providers seeded (3)");

    // =====================================================================
    // 6. PRODUCTS  (30 products across all categories)
    // =====================================================================
    const productData = [
      // ---------- ELECTRONICS: Laptops ----------
      {
        name: "ProBook 15 Laptop",
        slug: "probook-15-laptop",
        description: "15.6 inch laptop with Intel i5, ideal for work and study. Multiple RAM and storage options.",
        category: laptops._id, categories: [laptops._id, catElec._id, compLaptops._id],
        seller: seller3._id, status: "active", brand: "TechMart",
        attributes: { type: "Laptop", processor: "Intel i5" }, taxCode: "GST_18",
        variantAttributeDefs: [
          { key: "ram", label: "RAM", options: ["8GB","16GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", options: ["256GB SSD","512GB SSD"], displayOrder: 1 },
        ],
        variants: [
          { sku: "PB15-8-256",  attributes: { ram: "8GB",  storage: "256GB SSD" }, price: 42999, mrp: 49999, stock: 10, images: [{ url: IMG(600,600,"pb1"), alt: "Laptop front" }], isActive: true },
          { sku: "PB15-8-512",  attributes: { ram: "8GB",  storage: "512GB SSD" }, price: 47999, mrp: 54999, stock: 8,  images: [{ url: IMG(600,600,"pb2"), alt: "Laptop side" }], isActive: true },
          { sku: "PB15-16-256", attributes: { ram: "16GB", storage: "256GB SSD" }, price: 49999, mrp: 57999, stock: 6,  images: [{ url: IMG(600,600,"pb3"), alt: "Laptop open" }], isActive: true },
          { sku: "PB15-16-512", attributes: { ram: "16GB", storage: "512GB SSD" }, price: 54999, mrp: 62999, stock: 4,  images: [{ url: IMG(600,600,"pb4"), alt: "Laptop top" }], isActive: true },
        ],
      },
      {
        name: "Dell Gaming Laptop G15",
        slug: "dell-gaming-laptop-g15",
        description: "High-performance gaming laptop with RTX 4060 and 144Hz display.",
        category: laptops._id, categories: [laptops._id, catElec._id],
        seller: seller3._id, status: "active", brand: "Dell",
        attributes: { type: "Laptop", processor: "Intel i7", gpu: "RTX 4060" }, taxCode: "GST_18",
        variantAttributeDefs: [
          { key: "ram", label: "RAM", options: ["16GB","32GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", options: ["512GB SSD","1TB SSD"], displayOrder: 1 },
        ],
        variants: [
          { sku: "DG15-16-512", attributes: { ram: "16GB", storage: "512GB SSD" }, price: 89999, mrp: 104999, stock: 5, images: [{ url: IMG(600,600,"dg1"), alt: "Dell Gaming" }], isActive: true },
          { sku: "DG15-32-1TB", attributes: { ram: "32GB", storage: "1TB SSD" },   price: 109999, mrp: 124999, stock: 3, images: [{ url: IMG(600,600,"dg2"), alt: "Dell Gaming" }], isActive: true },
        ],
      },

      // ---------- ELECTRONICS: Mobiles ----------
      {
        name: "SmartPhone X Pro",
        slug: "smartphone-x-pro",
        description: "6.5 inch AMOLED display, 5000mAh battery, 108MP camera.",
        category: mobiles._id, categories: [mobiles._id, catElec._id],
        seller: seller3._id, status: "active", brand: "TechMart",
        attributes: { type: "Smartphone", display: "6.5 inch AMOLED" }, taxCode: "GST_18",
        variantAttributeDefs: [
          { key: "ram", label: "RAM", options: ["6GB","8GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", options: ["128GB","256GB"], displayOrder: 1 },
          { key: "color", label: "Color", options: ["Black","Blue","Green"], displayOrder: 2 },
        ],
        variants: [
          { sku: "SXP-6-128-BK", attributes: { ram: "6GB", storage: "128GB", color: "Black" }, price: 14999, mrp: 17999, stock: 25, images: [{ url: IMG(600,600,"sx1"), alt: "Phone Black" }], isActive: true },
          { sku: "SXP-6-128-BL", attributes: { ram: "6GB", storage: "128GB", color: "Blue" },  price: 14999, mrp: 17999, stock: 20, images: [{ url: IMG(600,600,"sx2"), alt: "Phone Blue" }], isActive: true },
          { sku: "SXP-8-256-BK", attributes: { ram: "8GB", storage: "256GB", color: "Black" }, price: 17999, mrp: 20999, stock: 12, images: [{ url: IMG(600,600,"sx3"), alt: "Phone Black" }], isActive: true },
          { sku: "SXP-8-256-GR", attributes: { ram: "8GB", storage: "256GB", color: "Green" }, price: 17999, mrp: 20999, stock: 8,  images: [{ url: IMG(600,600,"sx4"), alt: "Phone Green" }], isActive: true },
        ],
      },
      {
        name: "Apple iPhone 16",
        slug: "apple-iphone-16",
        description: "Latest Apple iPhone with A18 chip, ProMotion display, and advanced camera system.",
        category: mobiles._id, categories: [mobiles._id, catElec._id],
        seller: seller3._id, status: "active", brand: "Apple",
        attributes: { type: "Smartphone", display: "6.7 inch Super Retina" }, taxCode: "GST_18",
        variantAttributeDefs: [
          { key: "storage", label: "Storage", options: ["128GB","256GB","512GB"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Black","White","Blue"], displayOrder: 1 },
        ],
        variants: [
          { sku: "IP16-128-BK", attributes: { storage: "128GB", color: "Black" }, price: 79999, mrp: 89999, stock: 15, images: [{ url: IMG(600,600,"ip1"), alt: "iPhone Black" }], isActive: true },
          { sku: "IP16-256-WH", attributes: { storage: "256GB", color: "White" }, price: 89999, mrp: 99999, stock: 10, images: [{ url: IMG(600,600,"ip2"), alt: "iPhone White" }], isActive: true },
          { sku: "IP16-512-BL", attributes: { storage: "512GB", color: "Blue" },  price: 109999, mrp: 119999, stock: 5, images: [{ url: IMG(600,600,"ip3"), alt: "iPhone Blue" }], isActive: true },
        ],
      },

      // ---------- ELECTRONICS: Audio ----------
      {
        name: "Sony WH-1000XM5 Headphones",
        slug: "sony-wh-1000xm5",
        description: "Industry-leading noise cancellation with exceptional sound quality.",
        category: audio._id, categories: [audio._id, catElec._id],
        seller: seller3._id, status: "active", brand: "Sony",
        attributes: { type: "Headphones", connectivity: "Bluetooth 5.3" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Black","Silver"], displayOrder: 0 }],
        variants: [
          { sku: "SWHX5-BK", attributes: { color: "Black" },  price: 24999, mrp: 29999, stock: 20, images: [{ url: IMG(600,600,"swh1"), alt: "Sony Black" }], isActive: true },
          { sku: "SWHX5-SL", attributes: { color: "Silver" }, price: 24999, mrp: 29999, stock: 15, images: [{ url: IMG(600,600,"swh2"), alt: "Sony Silver" }], isActive: true },
        ],
      },
      {
        name: "Apple Watch Series 9",
        slug: "apple-watch-series-9",
        description: "Advanced smartwatch with S9 chip, ECG, blood oxygen monitoring, and activity tracking.",
        category: catElec._id, categories: [catElec._id],
        seller: seller3._id, status: "active", brand: "Apple",
        attributes: { type: "Smartwatch", display: "Always-On Retina" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Silver","Black","Blue"], displayOrder: 0 }],
        variants: [
          { sku: "AW9-SL", attributes: { color: "Silver" }, price: 34999, mrp: 41999, stock: 12, images: [{ url: IMG(600,600,"aw1"), alt: "Watch Silver" }], isActive: true },
          { sku: "AW9-BK", attributes: { color: "Black" },  price: 34999, mrp: 41999, stock: 10, images: [{ url: IMG(600,600,"aw2"), alt: "Watch Black" }], isActive: true },
        ],
      },

      // ---------- FASHION: Sarees ----------
      {
        name: "Royal Banarasi Silk Saree",
        slug: "royal-banarasi-silk-saree",
        description: "Exquisite pure silk Banarasi saree with intricate zari work. Perfect for weddings.",
        category: sarees._id, categories: [sarees._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Priya Textiles",
        attributes: { fabric: "Silk", occasion: "Wedding" }, taxCode: "GST_12",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["5.5m","6m"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Red","Gold"], displayOrder: 1 },
        ],
        variants: [
          { sku: "RBSS-RED-55", attributes: { color: "Red", size: "5.5m" },  price: 4299, mrp: 5499, stock: 12, images: [{ url: IMG(600,800,"rb1"), alt: "Red Banarasi" }], isActive: true },
          { sku: "RBSS-RED-60", attributes: { color: "Red", size: "6m" },    price: 4699, mrp: 5999, stock: 8,  images: [{ url: IMG(600,800,"rb2"), alt: "Red Banarasi" }], isActive: true },
          { sku: "RBSS-GLD-55", attributes: { color: "Gold", size: "5.5m" }, price: 4999, mrp: 6499, stock: 5,  images: [{ url: IMG(600,800,"rb3"), alt: "Gold Banarasi" }], isActive: true },
        ],
      },
      {
        name: "Chiffon Printed Saree",
        slug: "chiffon-printed-saree",
        description: "Soft chiffon saree with floral print. Daily wear comfort.",
        category: sarees._id, categories: [sarees._id, catFash._id],
        seller: seller2._id, status: "active", brand: "Rajasthan Silks",
        attributes: { fabric: "Chiffon", occasion: "Casual" }, taxCode: "GST_5",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Yellow","Orange","Pink"], displayOrder: 0 }],
        variants: [
          { sku: "CPS-YLW", attributes: { color: "Yellow" }, price: 799, mrp: 999, stock: 35, images: [{ url: IMG(600,800,"cps1"), alt: "Yellow Chiffon" }], isActive: true },
          { sku: "CPS-ORG", attributes: { color: "Orange" }, price: 799, mrp: 999, stock: 30, images: [{ url: IMG(600,800,"cps2"), alt: "Orange Chiffon" }], isActive: true },
          { sku: "CPS-PNK", attributes: { color: "Pink" },   price: 849, mrp: 1049, stock: 25, images: [{ url: IMG(600,800,"cps3"), alt: "Pink Chiffon" }], isActive: true },
        ],
      },

      // ---------- FASHION: Kurtis ----------
      {
        name: "Cotton Printed Anarkali Kurti",
        slug: "cotton-printed-anarkali-kurti",
        description: "Comfortable cotton Anarkali kurti with vibrant prints for casual wear.",
        category: kurtis._id, categories: [kurtis._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Priya Textiles",
        attributes: { fabric: "Cotton", occasion: "Casual" }, taxCode: "GST_5",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Sky Blue","White"], displayOrder: 1 },
        ],
        variants: [
          { sku: "CPA-SB-S", attributes: { color: "Sky Blue", size: "S" }, price: 599, mrp: 799, stock: 50, images: [{ url: IMG(600,800,"cpa1"), alt: "Sky Blue Kurti" }], isActive: true },
          { sku: "CPA-SB-M", attributes: { color: "Sky Blue", size: "M" }, price: 599, mrp: 799, stock: 45, images: [{ url: IMG(600,800,"cpa1"), alt: "Sky Blue Kurti" }], isActive: true },
          { sku: "CPA-WH-L", attributes: { color: "White", size: "L" },    price: 649, mrp: 849, stock: 40, images: [{ url: IMG(600,800,"cpa2"), alt: "White Kurti" }], isActive: true },
          { sku: "CPA-WH-XL", attributes: { color: "White", size: "XL" },  price: 649, mrp: 849, stock: 35, images: [{ url: IMG(600,800,"cpa2"), alt: "White Kurti" }], isActive: true },
        ],
      },
      {
        name: "Women Floral Printed Kurti",
        slug: "women-floral-printed-kurti",
        description: "Elegant floral kurti in soft rayon fabric for casual and festive wear.",
        category: kurtis._id, categories: [kurtis._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Biba",
        attributes: { fabric: "Rayon", occasion: "Festive" }, taxCode: "GST_5",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["S","M","L"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Pink","Yellow"], displayOrder: 1 },
        ],
        variants: [
          { sku: "WFK-PNK-S", attributes: { color: "Pink", size: "S" },    price: 1099, mrp: 1499, stock: 40, images: [{ url: IMG(600,800,"wfk1"), alt: "Pink Kurti" }], isActive: true },
          { sku: "WFK-YLW-M", attributes: { color: "Yellow", size: "M" },  price: 1099, mrp: 1499, stock: 35, images: [{ url: IMG(600,800,"wfk2"), alt: "Yellow Kurti" }], isActive: true },
        ],
      },

      // ---------- FASHION: Lehenga ----------
      {
        name: "Designer Lehenga Choli Set",
        slug: "designer-lehenga-choli-set",
        description: "Beautiful lehenga choli with dupatta. Ready to wear for weddings.",
        category: lehenga._id, categories: [lehenga._id, catFash._id],
        seller: seller2._id, status: "active", brand: "Rajasthan Silks",
        attributes: { fabric: "Net", occasion: "Wedding" }, taxCode: "GST_12",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["M","L"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Pink","Red"], displayOrder: 1 },
        ],
        variants: [
          { sku: "DLC-PNK-M", attributes: { color: "Pink", size: "M" }, price: 5999, mrp: 7999, stock: 6, images: [{ url: IMG(600,800,"dlc1"), alt: "Pink Lehenga" }], isActive: true },
          { sku: "DLC-RED-L", attributes: { color: "Red", size: "L" },  price: 6499, mrp: 8499, stock: 4, images: [{ url: IMG(600,800,"dlc2"), alt: "Red Lehenga" }], isActive: true },
        ],
      },

      // ---------- FASHION: Men Kurtas ----------
      {
        name: "Men Cotton Kurta Pyjama",
        slug: "men-cotton-kurta-pyjama",
        description: "Comfortable cotton kurta pyjama set for men. Ethnic casual wear.",
        category: kurtas._id, categories: [kurtas._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Priya Textiles",
        attributes: { fabric: "Cotton", occasion: "Casual" }, taxCode: "GST_5",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["White","Beige"], displayOrder: 1 },
        ],
        variants: [
          { sku: "MCKP-WHT-M",  attributes: { color: "White", size: "M" },  price: 999,  mrp: 1299, stock: 30, images: [{ url: IMG(600,800,"mckp1"), alt: "White Kurta" }], isActive: true },
          { sku: "MCKP-BEG-L",  attributes: { color: "Beige", size: "L" },  price: 999,  mrp: 1299, stock: 25, images: [{ url: IMG(600,800,"mckp2"), alt: "Beige Kurta" }], isActive: true },
          { sku: "MCKP-WHT-XL", attributes: { color: "White", size: "XL" }, price: 1049, mrp: 1349, stock: 20, images: [{ url: IMG(600,800,"mckp1"), alt: "White Kurta" }], isActive: true },
        ],
      },

      // ---------- FASHION: T-Shirts ----------
      {
        name: "Men Solid Cotton T-Shirt",
        slug: "men-solid-cotton-tshirt",
        description: "Premium cotton t-shirt. Comfortable for daily wear.",
        category: tshirts._id, categories: [tshirts._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Priya Textiles",
        attributes: { fabric: "Cotton", occasion: "Casual" }, taxCode: "GST_5",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Black","White","Blue","Grey"], displayOrder: 1 },
        ],
        variants: [
          { sku: "MST-BLK-M",  attributes: { size: "M", color: "Black" }, price: 499, mrp: 699, stock: 60, images: [{ url: IMG(600,600,"mst1"), alt: "Black T-Shirt" }], isActive: true },
          { sku: "MST-WHT-L",  attributes: { size: "L", color: "White" }, price: 499, mrp: 699, stock: 55, images: [{ url: IMG(600,600,"mst2"), alt: "White T-Shirt" }], isActive: true },
          { sku: "MST-BLU-M",  attributes: { size: "M", color: "Blue" },  price: 499, mrp: 699, stock: 40, images: [{ url: IMG(600,600,"mst3"), alt: "Blue T-Shirt" }], isActive: true },
          { sku: "MST-GRY-XL", attributes: { size: "XL", color: "Grey" }, price: 549, mrp: 749, stock: 30, images: [{ url: IMG(600,600,"mst4"), alt: "Grey T-Shirt" }], isActive: true },
        ],
      },
      {
        name: "Men Slim Fit Cotton Shirt",
        slug: "men-slim-fit-cotton-shirt",
        description: "Comfortable slim-fit cotton shirt for daily and office wear.",
        category: shirts._id, categories: [shirts._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Peter England",
        attributes: { fabric: "Cotton", occasion: "Office" }, taxCode: "GST_5",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["White","Blue","Black"], displayOrder: 1 },
        ],
        variants: [
          { sku: "MSFC-WHT-M", attributes: { size: "M", color: "White" }, price: 899, mrp: 1199, stock: 30, images: [{ url: IMG(600,800,"msfc1"), alt: "White Shirt" }], isActive: true },
          { sku: "MSFC-BLU-L", attributes: { size: "L", color: "Blue" },  price: 899, mrp: 1199, stock: 25, images: [{ url: IMG(600,800,"msfc2"), alt: "Blue Shirt" }], isActive: true },
        ],
      },
      {
        name: "Men Regular Fit Denim Jeans",
        slug: "men-regular-fit-denim-jeans",
        description: "Classic denim jeans with durable stitching and stretchable fabric.",
        category: jeans._id, categories: [jeans._id, catFash._id],
        seller: seller1._id, status: "active", brand: "Levis",
        attributes: { fabric: "Denim", occasion: "Casual" }, taxCode: "GST_12",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["30","32","34","36"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Blue","Black"], displayOrder: 1 },
        ],
        variants: [
          { sku: "MRFJ-BLU-32", attributes: { size: "32", color: "Blue" },  price: 1499, mrp: 1999, stock: 35, images: [{ url: IMG(600,800,"mrfj1"), alt: "Blue Jeans" }], isActive: true },
          { sku: "MRFJ-BLK-34", attributes: { size: "34", color: "Black" }, price: 1499, mrp: 1999, stock: 30, images: [{ url: IMG(600,800,"mrfj2"), alt: "Black Jeans" }], isActive: true },
        ],
      },

      // ---------- KIDS ----------
      {
        name: "Kids Cotton T-Shirt & Shorts Set",
        slug: "kids-cotton-tshirt-shorts-set",
        description: "Soft cotton t-shirt and shorts set for kids daily wear.",
        category: kidClothing._id, categories: [kidClothing._id, catKids._id],
        seller: seller1._id, status: "active", brand: "Babyhug",
        attributes: { fabric: "Cotton", occasion: "Daily" }, taxCode: "GST_5",
        variantAttributeDefs: [
          { key: "size", label: "Size", options: ["2-3Y","4-5Y","6-7Y"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Blue","Yellow","Red"], displayOrder: 1 },
        ],
        variants: [
          { sku: "KCT-BLU-23", attributes: { size: "2-3Y", color: "Blue" },   price: 599, mrp: 799, stock: 30, images: [{ url: IMG(600,600,"kct1"), alt: "Kids Blue" }], isActive: true },
          { sku: "KCT-YLW-45", attributes: { size: "4-5Y", color: "Yellow" }, price: 649, mrp: 849, stock: 25, images: [{ url: IMG(600,600,"kct2"), alt: "Kids Yellow" }], isActive: true },
          { sku: "KCT-RED-67", attributes: { size: "6-7Y", color: "Red" },    price: 699, mrp: 899, stock: 20, images: [{ url: IMG(600,600,"kct3"), alt: "Kids Red" }], isActive: true },
        ],
      },
      {
        name: "Kids Educational Toy Set",
        slug: "kids-educational-toy-set",
        description: "Educational toy set to improve creativity and learning. Safe non-toxic materials.",
        category: kidToys._id, categories: [kidToys._id, catKids._id],
        seller: seller2._id, status: "active", brand: "FunSkool",
        attributes: { ageGroup: "3-8 years" }, taxCode: "GST_12",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Multicolor"], displayOrder: 0 }],
        variants: [
          { sku: "KET-MC", attributes: { color: "Multicolor" }, price: 999, mrp: 1299, stock: 40, images: [{ url: IMG(600,600,"ket1"), alt: "Toy Set" }], isActive: true },
        ],
      },

      // ---------- TV & APPLIANCES ----------
      {
        name: "Samsung 55\" 4K Smart TV",
        slug: "samsung-55-4k-smart-tv",
        description: "Crystal UHD 4K Smart TV with Tizen OS and HDR10+ support.",
        category: tvs._id, categories: [tvs._id, catTVA._id],
        seller: seller3._id, status: "active", brand: "Samsung",
        attributes: { type: "Smart TV", resolution: "4K UHD" }, taxCode: "GST_28",
        variantAttributeDefs: [],
        variants: [
          { sku: "SS55-4K", attributes: {}, price: 42999, mrp: 54999, stock: 8, images: [{ url: IMG(800,600,"ss55"), alt: "Samsung TV" }], isActive: true },
        ],
      },
      {
        name: "Philips 750W Mixer Grinder",
        slug: "philips-750w-mixer-grinder",
        description: "Powerful mixer grinder with 3 stainless steel jars for everyday kitchen needs.",
        category: homeAppl._id, categories: [homeAppl._id, catTVA._id],
        seller: seller2._id, status: "active", brand: "Philips",
        attributes: { type: "Mixer Grinder", power: "750W" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Black","White"], displayOrder: 0 }],
        variants: [
          { sku: "PMG-BK", attributes: { color: "Black" }, price: 3299, mrp: 3999, stock: 25, images: [{ url: IMG(600,600,"pmg1"), alt: "Mixer Black" }], isActive: true },
          { sku: "PMG-WH", attributes: { color: "White" }, price: 3299, mrp: 3999, stock: 20, images: [{ url: IMG(600,600,"pmg2"), alt: "Mixer White" }], isActive: true },
        ],
      },

      // ---------- FURNITURE ----------
      {
        name: "Wooden 3-Seater Sofa Set",
        slug: "wooden-3-seater-sofa-set",
        description: "Premium sheesham wood sofa set with high density foam cushions.",
        category: sofas._id, categories: [sofas._id, catFurn._id],
        seller: seller2._id, status: "active", brand: "Urban Ladder",
        attributes: { material: "Sheesham Wood" }, taxCode: "GST_12",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Brown","Walnut"], displayOrder: 0 }],
        variants: [
          { sku: "W3S-BRN", attributes: { color: "Brown" },  price: 35999, mrp: 42999, stock: 6, images: [{ url: IMG(800,600,"w3s1"), alt: "Sofa Brown" }], isActive: true },
          { sku: "W3S-WLN", attributes: { color: "Walnut" }, price: 37999, mrp: 44999, stock: 4, images: [{ url: IMG(800,600,"w3s2"), alt: "Sofa Walnut" }], isActive: true },
        ],
      },
      {
        name: "Queen Size Wooden Bed with Storage",
        slug: "queen-size-wooden-bed-storage",
        description: "Strong wooden bed with hydraulic storage drawers. Termite resistant.",
        category: beds._id, categories: [beds._id, catFurn._id],
        seller: seller2._id, status: "active", brand: "Wakefit",
        attributes: { material: "Engineered Wood" }, taxCode: "GST_12",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Walnut","White"], displayOrder: 0 }],
        variants: [
          { sku: "QSB-WLN", attributes: { color: "Walnut" }, price: 28999, mrp: 34999, stock: 4, images: [{ url: IMG(800,600,"qsb1"), alt: "Bed Walnut" }], isActive: true },
          { sku: "QSB-WHT", attributes: { color: "White" },  price: 29999, mrp: 35999, stock: 3, images: [{ url: IMG(800,600,"qsb2"), alt: "Bed White" }], isActive: true },
        ],
      },
      {
        name: "Study Table with Drawers",
        slug: "study-table-with-drawers",
        description: "Compact study table ideal for home office. Scratch resistant surface.",
        category: tables._id, categories: [tables._id, catFurn._id],
        seller: seller2._id, status: "active", brand: "IKEA",
        attributes: { material: "Engineered Wood" }, taxCode: "GST_12",
        variantAttributeDefs: [
          { key: "material", label: "Material", options: ["Wood","Metal"], displayOrder: 0 },
          { key: "color", label: "Color", options: ["Brown","Black","White"], displayOrder: 1 },
        ],
        variants: [
          { sku: "STD-W-BRN", attributes: { material: "Wood", color: "Brown" },  price: 4999, mrp: 6499, stock: 10, images: [{ url: IMG(600,600,"std1"), alt: "Table Brown" }], isActive: true },
          { sku: "STD-W-WHT", attributes: { material: "Wood", color: "White" },  price: 5499, mrp: 6999, stock: 8,  images: [{ url: IMG(600,600,"std2"), alt: "Table White" }], isActive: true },
          { sku: "STD-M-BLK", attributes: { material: "Metal", color: "Black" }, price: 3999, mrp: 5299, stock: 15, images: [{ url: IMG(600,600,"std3"), alt: "Table Black" }], isActive: true },
        ],
      },
      {
        name: "Office Ergonomic Chair",
        slug: "office-ergonomic-chair",
        description: "Comfortable ergonomic office chair with adjustable height and breathable mesh back.",
        category: chairs._id, categories: [chairs._id, catFurn._id],
        seller: seller2._id, status: "active", brand: "Green Soul",
        attributes: { material: "Mesh + Metal" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Black","Grey"], displayOrder: 0 }],
        variants: [
          { sku: "OEC-BLK", attributes: { color: "Black" }, price: 7999, mrp: 9999, stock: 15, images: [{ url: IMG(600,600,"oec1"), alt: "Chair Black" }], isActive: true },
          { sku: "OEC-GRY", attributes: { color: "Grey" },  price: 7999, mrp: 9999, stock: 12, images: [{ url: IMG(600,600,"oec2"), alt: "Chair Grey" }], isActive: true },
        ],
      },

      // ---------- BEAUTY ----------
      {
        name: "Vitamin C Face Serum",
        slug: "vitamin-c-face-serum",
        description: "Brightening face serum with 20% Vitamin C, hyaluronic acid, and niacinamide.",
        category: skincare._id, categories: [skincare._id, catBeauty._id],
        seller: seller1._id, status: "active", brand: "Minimalist",
        attributes: { type: "Serum", volume: "30ml" }, taxCode: "GST_18",
        variantAttributeDefs: [],
        variants: [
          { sku: "VCS-30", attributes: {}, price: 549, mrp: 699, stock: 100, images: [{ url: IMG(600,600,"vcs1"), alt: "Vitamin C Serum" }], isActive: true },
        ],
      },

      // ---------- HOME & KITCHEN ----------
      {
        name: "Havells Room Heater",
        slug: "havells-room-heater",
        description: "Fast heating room heater with overheat protection and silent operation.",
        category: kitchenAppl._id, categories: [kitchenAppl._id, catHome._id],
        seller: seller2._id, status: "active", brand: "Havells",
        attributes: { type: "Room Heater", power: "2000W" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["White","Grey"], displayOrder: 0 }],
        variants: [
          { sku: "HRH-WH", attributes: { color: "White" }, price: 2499, mrp: 2999, stock: 20, images: [{ url: IMG(600,600,"hrh1"), alt: "Heater White" }], isActive: true },
          { sku: "HRH-GR", attributes: { color: "Grey" },  price: 2499, mrp: 2999, stock: 15, images: [{ url: IMG(600,600,"hrh2"), alt: "Heater Grey" }], isActive: true },
        ],
      },
    ];

    const products = await Product.insertMany(productData);
    console.log(`  Products seeded (${products.length})`);

    // Product index by slug for easy reference
    const P = {};
    products.forEach((p) => { P[p.slug] = p; });

    // =====================================================================
    // 7. PRODUCT RECOMMENDATIONS  (cross-sell / up-sell)
    // =====================================================================
    const recPairs = [
      // Laptop → other laptop, phone
      ["probook-15-laptop",           "dell-gaming-laptop-g15",      "manual", 0],
      ["probook-15-laptop",           "smartphone-x-pro",            "ai",     1, 0.88],
      ["dell-gaming-laptop-g15",      "probook-15-laptop",           "manual", 0],
      ["dell-gaming-laptop-g15",      "sony-wh-1000xm5",            "ai",     1, 0.82],
      // Phone → phone, watch, headphones
      ["smartphone-x-pro",            "apple-iphone-16",             "manual", 0],
      ["smartphone-x-pro",            "apple-watch-series-9",        "ai",     1, 0.91],
      ["apple-iphone-16",             "apple-watch-series-9",        "manual", 0],
      ["apple-iphone-16",             "sony-wh-1000xm5",            "ai",     1, 0.85],
      // Saree → lehenga, kurti
      ["royal-banarasi-silk-saree",   "designer-lehenga-choli-set",  "manual", 0],
      ["royal-banarasi-silk-saree",   "cotton-printed-anarkali-kurti","ai",    1, 0.79],
      ["chiffon-printed-saree",       "women-floral-printed-kurti",  "manual", 0],
      // Kurti → saree, jeans
      ["cotton-printed-anarkali-kurti","chiffon-printed-saree",      "manual", 0],
      ["women-floral-printed-kurti",  "men-regular-fit-denim-jeans", "ai",     1, 0.72],
      // Furniture cross-sell
      ["wooden-3-seater-sofa-set",    "study-table-with-drawers",    "manual", 0],
      ["queen-size-wooden-bed-storage","office-ergonomic-chair",     "ai",     1, 0.80],
      // Kids cross-sell
      ["kids-cotton-tshirt-shorts-set","kids-educational-toy-set",   "manual", 0],
    ];
    await ProductRecommendation.insertMany(
      recPairs.map(([src, tgt, source, sortOrder, score]) => ({
        productId: P[src]._id,
        recommendedProductId: P[tgt]._id,
        source,
        sortOrder,
        ...(score != null ? { score } : {}),
      }))
    );
    console.log(`  Product recommendations seeded (${recPairs.length})`);

    // =====================================================================
    // 8. COUPONS
    // =====================================================================
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 86400000);
    const in90Days = new Date(now.getTime() + 90 * 86400000);

    await Coupon.insertMany([
      {
        code: "WELCOME10", description: "10% off on first order", type: "percent", value: 10,
        minOrderAmount: 500, maxDiscount: 500, usageLimit: 1000, perUserLimit: 1,
        validFrom: now, validTo: in90Days, isActive: true, createdBy: admin._id,
      },
      {
        code: "FLAT200", description: "Flat Rs 200 off on orders above Rs 1500", type: "flat", value: 200,
        minOrderAmount: 1500, maxDiscount: null, usageLimit: 500, perUserLimit: 2,
        validFrom: now, validTo: in30Days, isActive: true, createdBy: admin._id,
      },
      {
        code: "FASHION15", description: "15% off on fashion category", type: "percent", value: 15,
        minOrderAmount: 999, maxDiscount: 1000, usageLimit: 300, perUserLimit: 1,
        validFrom: now, validTo: in90Days, isActive: true, createdBy: admin._id,
        applicableCategories: [catFash._id],
      },
      {
        code: "ELECTRONICS500", description: "Flat Rs 500 off on electronics above Rs 5000", type: "flat", value: 500,
        minOrderAmount: 5000, maxDiscount: null, usageLimit: 200, perUserLimit: 1,
        validFrom: now, validTo: in90Days, isActive: true, createdBy: admin._id,
        applicableCategories: [catElec._id],
      },
      {
        code: "EXPIRED20", description: "Expired coupon for testing", type: "percent", value: 20,
        minOrderAmount: 0, maxDiscount: 1000, usageLimit: 100, perUserLimit: 1,
        validFrom: new Date("2024-01-01"), validTo: new Date("2024-12-31"), isActive: true, createdBy: admin._id,
      },
    ]);
    console.log("  Coupons seeded (5)");

    // =====================================================================
    // 9. CART  (customer1 has laptop + kurti in cart)
    // =====================================================================
    const cartLaptop = P["probook-15-laptop"];
    const cartKurti  = P["cotton-printed-anarkali-kurti"];
    const vLaptop = cartLaptop.variants[0];
    const vKurti  = cartKurti.variants[0];
    const cartItemsTotal = vLaptop.price + vKurti.price;
    const cartTax = Math.round(vLaptop.price * 0.18) + Math.round(vKurti.price * 0.05);
    const cartShipping = cartItemsTotal >= 999 ? 0 : 80;

    await Cart.create({
      userId: customer1._id,
      items: [
        {
          productId: cartLaptop._id, variantId: vLaptop._id, quantity: 1,
          sellerId: seller3._id, unitPrice: vLaptop.price,
          name: cartLaptop.name, image: vLaptop.images[0]?.url,
        },
        {
          productId: cartKurti._id, variantId: vKurti._id, quantity: 2,
          sellerId: seller1._id, unitPrice: vKurti.price,
          name: cartKurti.name, image: vKurti.images[0]?.url,
        },
      ],
      itemsTotal: vLaptop.price + vKurti.price * 2,
      taxTotal: Math.round(vLaptop.price * 0.18) + Math.round(vKurti.price * 2 * 0.05),
      shippingEstimate: 0,
      grandTotal: vLaptop.price + vKurti.price * 2 + Math.round(vLaptop.price * 0.18) + Math.round(vKurti.price * 2 * 0.05),
      currency: "INR",
    });
    console.log("  Cart seeded (customer1: 2 items)");

    // =====================================================================
    // 10. ORDERS  (5 orders across both customers, various statuses)
    // =====================================================================
    const addr1 = customer1.addresses[0];
    const addr2 = customer2.addresses[0];

    // Helper to build order items
    const mkItem = (prod, varIdx, qty, taxRate) => {
      const v = prod.variants[varIdx];
      const taxAmount = Math.round(v.price * qty * taxRate / 100);
      return {
        productId: prod._id, variantId: v._id,
        name: prod.name, sku: v.sku, quantity: qty,
        unitPrice: v.price, taxCode: prod.taxCode || "", taxType: "gst",
        taxRate, taxAmount, lineTotal: v.price * qty + taxAmount,
        sellerId: prod.seller,
        productSnapshot: { name: prod.name, slug: prod.slug, image: v.images[0]?.url },
      };
    };

    // Order 1: customer1 – Delivered (saree) – COD paid
    const o1Items = [mkItem(P["royal-banarasi-silk-saree"], 0, 1, 12)];
    const o1Sub = o1Items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const o1Tax = o1Items.reduce((s, i) => s + i.taxAmount, 0);
    const o1Ship = o1Sub >= 999 ? 0 : 80;
    const order1 = await Order.create({
      userId: customer1._id, orderNumber: "ZK-100001",
      shippingAddress: addr1, billingAddress: addr1,
      items: o1Items, subtotal: o1Sub, taxTotal: o1Tax,
      shippingAmount: o1Ship, discountTotal: 0, grandTotal: o1Sub + o1Tax + o1Ship,
      currency: "INR", paymentMethod: "cod", paymentStatus: "paid",
      orderStatus: "delivered", paidAt: new Date(now - 5 * 86400000),
      confirmedAt: new Date(now - 7 * 86400000),
      shippedAt: new Date(now - 6 * 86400000),
      deliveredAt: new Date(now - 5 * 86400000),
      shipments: [{
        sellerId: seller1._id, items: [0], status: "delivered",
        carrierCode: "BLUEDART", carrierName: "Blue Dart",
        awbNumber: "BD123456789", dispatchedAt: new Date(now - 6 * 86400000),
        deliveredAt: new Date(now - 5 * 86400000),
        events: [
          { at: new Date(now - 7 * 86400000), status: "placed", location: "Varanasi", description: "Order placed" },
          { at: new Date(now - 6 * 86400000), status: "shipped", location: "Varanasi", description: "Dispatched" },
          { at: new Date(now - 5 * 86400000), status: "delivered", location: "Bangalore", description: "Delivered" },
        ],
      }],
    });

    // Order 2: customer1 – Shipped (t-shirt + jeans) – Online paid
    const o2Items = [
      mkItem(P["men-solid-cotton-tshirt"], 0, 2, 5),
      mkItem(P["men-regular-fit-denim-jeans"], 0, 1, 12),
    ];
    const o2Sub = o2Items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const o2Tax = o2Items.reduce((s, i) => s + i.taxAmount, 0);
    const o2Ship = o2Sub >= 999 ? 0 : 80;
    const order2 = await Order.create({
      userId: customer1._id, orderNumber: "ZK-100002",
      shippingAddress: addr1, billingAddress: addr1,
      items: o2Items, subtotal: o2Sub, taxTotal: o2Tax,
      shippingAmount: o2Ship, discountTotal: 0, grandTotal: o2Sub + o2Tax + o2Ship,
      currency: "INR", paymentMethod: "online", paymentStatus: "paid",
      orderStatus: "shipped", paidAt: new Date(now - 2 * 86400000),
      confirmedAt: new Date(now - 2 * 86400000),
      shippedAt: new Date(now - 1 * 86400000),
      razorpayOrderId: "order_SEED_002", razorpayPaymentId: "pay_SEED_002",
      shipments: [{
        sellerId: seller1._id, items: [0, 1], status: "shipped",
        carrierCode: "DELHIVERY", carrierName: "Delhivery",
        awbNumber: "DL987654321", dispatchedAt: new Date(now - 1 * 86400000),
        events: [
          { at: new Date(now - 2 * 86400000), status: "placed", location: "Varanasi", description: "Order placed" },
          { at: new Date(now - 1 * 86400000), status: "shipped", location: "Varanasi", description: "Dispatched" },
        ],
      }],
    });

    // Order 3: customer1 – Placed (iPhone) – COD pending
    const o3Items = [mkItem(P["apple-iphone-16"], 0, 1, 18)];
    const o3Sub = o3Items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const o3Tax = o3Items.reduce((s, i) => s + i.taxAmount, 0);
    const o3Ship = 0;
    const order3 = await Order.create({
      userId: customer1._id, orderNumber: "ZK-100003",
      shippingAddress: addr1, billingAddress: addr1,
      items: o3Items, subtotal: o3Sub, taxTotal: o3Tax,
      shippingAmount: o3Ship, discountTotal: 0, grandTotal: o3Sub + o3Tax + o3Ship,
      currency: "INR", paymentMethod: "cod", paymentStatus: "pending",
      orderStatus: "placed",
    });

    // Order 4: customer2 – Delivered (kurti) – Online paid
    const o4Items = [mkItem(P["women-floral-printed-kurti"], 0, 1, 5)];
    const o4Sub = o4Items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const o4Tax = o4Items.reduce((s, i) => s + i.taxAmount, 0);
    const o4Ship = o4Sub >= 999 ? 0 : 80;
    const order4 = await Order.create({
      userId: customer2._id, orderNumber: "ZK-100004",
      shippingAddress: addr2, billingAddress: addr2,
      items: o4Items, subtotal: o4Sub, taxTotal: o4Tax,
      shippingAmount: o4Ship, discountTotal: 0, grandTotal: o4Sub + o4Tax + o4Ship,
      currency: "INR", paymentMethod: "online", paymentStatus: "paid",
      orderStatus: "delivered", paidAt: new Date(now - 10 * 86400000),
      confirmedAt: new Date(now - 12 * 86400000),
      shippedAt: new Date(now - 11 * 86400000),
      deliveredAt: new Date(now - 10 * 86400000),
      razorpayOrderId: "order_SEED_004", razorpayPaymentId: "pay_SEED_004",
    });

    // Order 5: customer2 – Confirmed (sofa) – COD pending
    const o5Items = [mkItem(P["wooden-3-seater-sofa-set"], 0, 1, 12)];
    const o5Sub = o5Items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const o5Tax = o5Items.reduce((s, i) => s + i.taxAmount, 0);
    const o5Ship = 0;
    await Order.create({
      userId: customer2._id, orderNumber: "ZK-100005",
      shippingAddress: addr2, billingAddress: addr2,
      items: o5Items, subtotal: o5Sub, taxTotal: o5Tax,
      shippingAmount: o5Ship, discountTotal: 0, grandTotal: o5Sub + o5Tax + o5Ship,
      currency: "INR", paymentMethod: "cod", paymentStatus: "pending",
      orderStatus: "confirmed", confirmedAt: new Date(now - 1 * 86400000),
    });

    console.log("  Orders seeded (5)");

    // =====================================================================
    // 11. PAYMENTS  (for online-paid orders)
    // =====================================================================
    await Payment.insertMany([
      {
        orderId: order2._id, userId: customer1._id,
        method: "online", provider: "razorpay", amount: order2.grandTotal, currency: "INR",
        razorpayOrderId: "order_SEED_002", razorpayPaymentId: "pay_SEED_002",
        razorpaySignature: "sig_seed_002",
        status: "captured", attempts: 1, capturedAt: new Date(now - 2 * 86400000),
      },
      {
        orderId: order4._id, userId: customer2._id,
        method: "online", provider: "razorpay", amount: order4.grandTotal, currency: "INR",
        razorpayOrderId: "order_SEED_004", razorpayPaymentId: "pay_SEED_004",
        razorpaySignature: "sig_seed_004",
        status: "captured", attempts: 1, capturedAt: new Date(now - 10 * 86400000),
      },
    ]);
    console.log("  Payments seeded (2)");

    // =====================================================================
    // 12. REVIEWS  (on delivered orders)
    // =====================================================================
    await Review.insertMany([
      {
        userId: customer1._id, productId: P["royal-banarasi-silk-saree"]._id, orderId: order1._id,
        rating: 5, title: "Absolutely gorgeous!", body: "The zari work is exquisite. Perfect for my sister's wedding. Fabric quality is top-notch.",
        isVerifiedPurchase: true, isApproved: true, helpfulCount: 12,
      },
      {
        userId: customer1._id, productId: P["men-solid-cotton-tshirt"]._id,
        rating: 4, title: "Good quality cotton", body: "Comfortable fit, good for daily wear. Color didn't fade after multiple washes.",
        isVerifiedPurchase: true, isApproved: true, helpfulCount: 5,
      },
      {
        userId: customer2._id, productId: P["women-floral-printed-kurti"]._id, orderId: order4._id,
        rating: 4, title: "Nice kurti for the price", body: "Good fabric quality and the print is beautiful. Slightly loose fit but overall happy.",
        isVerifiedPurchase: true, isApproved: true, helpfulCount: 3,
      },
      {
        userId: customer2._id, productId: P["probook-15-laptop"]._id,
        rating: 5, title: "Best laptop under 50K", body: "Fast performance, great display. Battery lasts 6-7 hours easily. Highly recommended for students.",
        isVerifiedPurchase: false, isApproved: true, helpfulCount: 20,
      },
      {
        userId: customer1._id, productId: P["apple-iphone-16"]._id,
        rating: 5, title: "Premium experience", body: "Camera is incredible, performance is buttery smooth. Worth every penny.",
        isVerifiedPurchase: false, isApproved: true, helpfulCount: 15,
      },
      {
        userId: customer2._id, productId: P["sony-wh-1000xm5"]._id,
        rating: 4, title: "Great noise cancellation", body: "ANC is top class. Sound quality is balanced. Comfortable for long sessions.",
        isVerifiedPurchase: false, isApproved: true, helpfulCount: 8,
      },
      {
        userId: customer1._id, productId: P["designer-lehenga-choli-set"]._id,
        rating: 5, title: "Stunning lehenga!", body: "The embroidery work is beautiful. Got so many compliments at the wedding.",
        isVerifiedPurchase: false, isApproved: true, helpfulCount: 7,
      },
      {
        userId: customer2._id, productId: P["study-table-with-drawers"]._id,
        rating: 4, title: "Sturdy and spacious", body: "Good quality wood. Assembly was easy. Drawers are spacious. Good value for money.",
        isVerifiedPurchase: false, isApproved: true, helpfulCount: 4,
      },
    ]);
    console.log("  Reviews seeded (8)");

    // =====================================================================
    // 13. RETURN REQUEST  (customer1 returning the delivered saree order)
    // =====================================================================
    await ReturnRequest.create({
      orderId: order1._id, userId: customer1._id, sellerId: seller1._id,
      items: [{
        productId: P["royal-banarasi-silk-saree"]._id,
        variantId: P["royal-banarasi-silk-saree"].variants[0]._id,
        name: "Royal Banarasi Silk Saree", sku: "RBSS-RED-55",
        quantity: 1, unitPrice: 4299,
      }],
      reason: "size_fit_issue",
      description: "The saree length is shorter than expected. Need 6m instead of 5.5m.",
      status: "requested", refundAmount: 0,
    });
    console.log("  Return requests seeded (1)");

    // =====================================================================
    // 14. WISHLIST
    // =====================================================================
    await Wishlist.insertMany([
      { userId: customer1._id, productId: P["designer-lehenga-choli-set"]._id },
      { userId: customer1._id, productId: P["apple-iphone-16"]._id },
      { userId: customer1._id, productId: P["sony-wh-1000xm5"]._id },
      { userId: customer1._id, productId: P["vitamin-c-face-serum"]._id },
      { userId: customer2._id, productId: P["probook-15-laptop"]._id },
      { userId: customer2._id, productId: P["men-cotton-kurta-pyjama"]._id },
      { userId: customer2._id, productId: P["samsung-55-4k-smart-tv"]._id },
    ]);
    // Also set the User.wishlist array for backward compat
    await User.findByIdAndUpdate(customer1._id, {
      wishlist: [
        P["designer-lehenga-choli-set"]._id,
        P["apple-iphone-16"]._id,
        P["sony-wh-1000xm5"]._id,
        P["vitamin-c-face-serum"]._id,
      ],
    });
    await User.findByIdAndUpdate(customer2._id, {
      wishlist: [
        P["probook-15-laptop"]._id,
        P["men-cotton-kurta-pyjama"]._id,
        P["samsung-55-4k-smart-tv"]._id,
      ],
    });
    console.log("  Wishlist seeded (7)");

    // =====================================================================
    // 15. NOTIFICATIONS
    // =====================================================================
    await Notification.insertMany([
      {
        userId: customer1._id, type: "order_delivered",
        title: "Order Delivered!", body: `Your order ZK-100001 has been delivered successfully.`,
        isRead: true, metadata: { orderId: order1._id.toString() }, link: "/orders/" + order1._id,
      },
      {
        userId: customer1._id, type: "order_shipped",
        title: "Order Shipped", body: `Your order ZK-100002 has been shipped via Delhivery. Track: DL987654321`,
        isRead: false, metadata: { orderId: order2._id.toString() }, link: "/orders/" + order2._id,
      },
      {
        userId: customer1._id, type: "order_placed",
        title: "Order Confirmed", body: `Your order ZK-100003 for Apple iPhone 16 has been placed.`,
        isRead: false, metadata: { orderId: order3._id.toString() }, link: "/orders/" + order3._id,
      },
      {
        userId: customer1._id, type: "coupon_available",
        title: "New Coupon Available!", body: "Use WELCOME10 to get 10% off on your next order.",
        isRead: false,
      },
      {
        userId: customer2._id, type: "order_delivered",
        title: "Order Delivered!", body: `Your order ZK-100004 has been delivered.`,
        isRead: true, metadata: { orderId: order4._id.toString() }, link: "/orders/" + order4._id,
      },
      {
        userId: customer2._id, type: "review_received",
        title: "Thanks for your review!", body: "Your review for Women Floral Printed Kurti has been published.",
        isRead: false,
      },
    ]);
    console.log("  Notifications seeded (6)");

    // =====================================================================
    // DONE
    // =====================================================================
    console.log("\n=== Seeding completed successfully ===\n");
    console.log("Test credentials:");
    console.log("  Admin:      admin@zaykaur.com      / 123456");
    console.log("  Seller 1:   seller@zaykaur.com     / 123456  (Priya Textiles)");
    console.log("  Seller 2:   seller2@zaykaur.com    / 123456  (Rajasthan Silks)");
    console.log("  Seller 3:   seller3@zaykaur.com    / 123456  (TechMart India)");
    console.log("  Customer 1: customer1@zaykaur.com  / 123456  (Anita Sharma)");
    console.log("  Customer 2: customer2@zaykaur.com  / 123456  (Rahul Verma)");
    console.log("\nCoupon codes: WELCOME10, FLAT200, FASHION15, ELECTRONICS500");
    console.log("Customer1 cart has: ProBook 15 Laptop + Cotton Anarkali Kurti");
    console.log("5 orders seeded (delivered, shipped, placed, delivered, confirmed)\n");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

if (process.argv[2] === "--destroy") {
  destroyAll().catch((err) => { console.error(err); process.exit(1); });
} else {
  seedData();
}
