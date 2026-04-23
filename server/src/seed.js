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
    //    All 16 mega-menu top-level keys + every sub-item slug
    // =====================================================================
    const rootCats = await Category.insertMany([
      { name: "Electronics",        slug: "electronics",        level: 0, displayOrder: 0,  image: IMG(300, 300, "cat-elec") },
      { name: "Fashion",            slug: "fashion",            level: 0, displayOrder: 1,  image: IMG(300, 300, "cat-fash") },
      { name: "Kids",               slug: "kids",               level: 0, displayOrder: 2,  image: IMG(300, 300, "cat-kids") },
      { name: "TV & Appliances",    slug: "tv-appliances",      level: 0, displayOrder: 3,  image: IMG(300, 300, "cat-tva") },
      { name: "Furniture",          slug: "furniture",          level: 0, displayOrder: 4,  image: IMG(300, 300, "cat-furn") },
      { name: "Beauty",             slug: "beauty",             level: 0, displayOrder: 5,  image: IMG(300, 300, "cat-beau") },
      { name: "Mobiles",            slug: "mobiles",            level: 0, displayOrder: 6,  image: IMG(300, 300, "cat-mob") },
      { name: "Computers & Laptops",slug: "computers-laptops",  level: 0, displayOrder: 7,  image: IMG(300, 300, "cat-comp") },
      { name: "Audio & Headphones", slug: "audio-headphones",   level: 0, displayOrder: 8,  image: IMG(300, 300, "cat-aud") },
      { name: "Home & Kitchen",     slug: "home-kitchen",       level: 0, displayOrder: 9,  image: IMG(300, 300, "cat-homk") },
      { name: "Sports & Fitness",   slug: "sports-fitness",     level: 0, displayOrder: 10, image: IMG(300, 300, "cat-sprt") },
      { name: "Books",              slug: "books",              level: 0, displayOrder: 11, image: IMG(300, 300, "cat-book") },
      { name: "Toys & Games",       slug: "toys-games",         level: 0, displayOrder: 12, image: IMG(300, 300, "cat-toys") },
      { name: "Automotive",         slug: "automotive",         level: 0, displayOrder: 13, image: IMG(300, 300, "cat-auto") },
      { name: "Grocery",            slug: "grocery",            level: 0, displayOrder: 14, image: IMG(300, 300, "cat-groc") },
      { name: "Health Care",        slug: "health-care",        level: 0, displayOrder: 15, image: IMG(300, 300, "cat-hlth") },
    ]);
    const [
      catElec, catFash, catKids, catTVA, catFurn, catBeauty,
      catMob, catComp, catAud, catHome,
      catSport, catBooks, catToys, catAuto, catGroc, catHealth,
    ] = rootCats;

    const sub = (name, slug, parent, extra = {}) => ({
      name, slug, parent: parent._id, ancestors: [parent._id], level: 1, displayOrder: 0, image: IMG(300, 300, `sub-${slug.slice(0,6)}`), ...extra,
    });

    const subCats = await Category.insertMany([
      // ── Electronics (mega-menu columns: Mobiles & Tablets, Computers, Audio, Cameras) ──
      { ...sub("Smartphones",         "smartphones",          catElec), displayOrder: 0,
        variantAttributeTemplates: [
          { key: "ram", label: "RAM", suggestedOptions: ["4GB","6GB","8GB","12GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", suggestedOptions: ["64GB","128GB","256GB"], displayOrder: 1 },
          { key: "color", label: "Color", suggestedOptions: ["Black","Blue","Green","White"], displayOrder: 2 },
        ] },
      { ...sub("Tablets",             "tablets",              catElec), displayOrder: 1 },
      { ...sub("Feature Phones",      "feature-phones",       catElec), displayOrder: 2 },
      { ...sub("Mobile Accessories",  "mobile-accessories",   catElec), displayOrder: 3 },
      { ...sub("Power Banks",         "power-banks",          catElec), displayOrder: 4 },
      { ...sub("Laptops",             "laptops",              catElec), displayOrder: 5,
        variantAttributeTemplates: [
          { key: "ram", label: "RAM", suggestedOptions: ["8GB","16GB","32GB"], displayOrder: 0 },
          { key: "storage", label: "Storage", suggestedOptions: ["256GB SSD","512GB SSD","1TB SSD"], displayOrder: 1 },
        ] },
      { ...sub("Desktops",            "desktops",             catElec), displayOrder: 6 },
      { ...sub("Monitors",            "monitors",             catElec), displayOrder: 7 },
      { ...sub("Computer Accessories","computer-accessories",  catElec), displayOrder: 8 },
      { ...sub("Storage Devices",     "storage-devices",      catElec), displayOrder: 9 },
      { ...sub("Headphones",          "headphones",           catElec), displayOrder: 10 },
      { ...sub("Earbuds",             "earbuds",              catElec), displayOrder: 11 },
      { ...sub("Bluetooth Speakers",  "bluetooth-speakers",   catElec), displayOrder: 12 },
      { ...sub("Soundbars",           "soundbars",            catElec), displayOrder: 13 },
      { ...sub("Home Audio Systems",  "home-audio-systems",   catElec), displayOrder: 14 },
      { ...sub("DSLR Cameras",        "dslr-cameras",         catElec), displayOrder: 15 },
      { ...sub("Mirrorless Cameras",  "mirrorless-cameras",   catElec), displayOrder: 16 },
      { ...sub("Action Cameras",      "action-cameras",       catElec), displayOrder: 17 },
      { ...sub("Camera Lenses",       "camera-lenses",        catElec), displayOrder: 18 },

      // ── Fashion (Men, Women, Footwear, Accessories) ──
      { ...sub("T-Shirts",      "t-shirts",      catFash), displayOrder: 0,
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["Black","White","Blue","Grey"], displayOrder: 1 },
        ] },
      { ...sub("Casual Shirts", "casual-shirts", catFash), displayOrder: 1 },
      { ...sub("Jeans",         "jeans",         catFash), displayOrder: 2 },
      { ...sub("Formal Shirts", "formal-shirts", catFash), displayOrder: 3 },
      { ...sub("Jackets",       "jackets",       catFash), displayOrder: 4 },
      { ...sub("Sarees",        "sarees",        catFash), displayOrder: 5,
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["5.5m","6m","6.5m"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["Red","Blue","Green","Gold","Pink"], displayOrder: 1 },
        ] },
      { ...sub("Kurtis",        "kurtis",        catFash), displayOrder: 6,
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["Red","Blue","White","Maroon"], displayOrder: 1 },
        ] },
      { ...sub("Dresses",       "dresses",       catFash), displayOrder: 7 },
      { ...sub("Tops",          "tops",          catFash), displayOrder: 8 },
      { ...sub("Lehengas",      "lehengas",      catFash), displayOrder: 9 },
      { ...sub("Casual Shoes",  "casual-shoes",  catFash), displayOrder: 10 },
      { ...sub("Sneakers",      "sneakers",      catFash), displayOrder: 11 },
      { ...sub("Sports Shoes",  "sports-shoes",  catFash), displayOrder: 12 },
      { ...sub("Sandals",       "sandals",       catFash), displayOrder: 13 },
      { ...sub("Heels",         "heels",         catFash), displayOrder: 14 },
      { ...sub("Watches",       "watches",       catFash), displayOrder: 15 },
      { ...sub("Handbags",      "handbags",      catFash), displayOrder: 16 },
      { ...sub("Belts",         "belts",         catFash), displayOrder: 17 },
      { ...sub("Sunglasses",    "sunglasses",    catFash), displayOrder: 18 },
      { ...sub("Wallets",       "wallets",       catFash), displayOrder: 19 },
      { ...sub("Shirts",        "shirts",        catFash), displayOrder: 20 },
      { ...sub("Kurtas",        "kurtas",        catFash), displayOrder: 21,
        variantAttributeTemplates: [
          { key: "size", label: "Size", suggestedOptions: ["S","M","L","XL"], displayOrder: 0 },
          { key: "color", label: "Color", suggestedOptions: ["White","Beige","Navy","Black"], displayOrder: 1 },
        ] },
      { ...sub("Lehenga",       "lehenga",       catFash), displayOrder: 22 },

      // ── Kids (Boys Clothing, Girls Clothing, Baby Care) ──
      { ...sub("Kids T-Shirts",     "kids-t-shirts",     catKids), displayOrder: 0 },
      { ...sub("Kids Shirts",       "kids-shirts",       catKids), displayOrder: 1 },
      { ...sub("Kids Jeans",        "kids-jeans",        catKids), displayOrder: 2 },
      { ...sub("Kids Shorts",       "kids-shorts",       catKids), displayOrder: 3 },
      { ...sub("Kids Jackets",      "kids-jackets",      catKids), displayOrder: 4 },
      { ...sub("Kids Dresses",      "kids-dresses",      catKids), displayOrder: 5 },
      { ...sub("Kids Tops",         "kids-tops",         catKids), displayOrder: 6 },
      { ...sub("Kids Skirts",       "kids-skirts",       catKids), displayOrder: 7 },
      { ...sub("Leggings",          "leggings",          catKids), displayOrder: 8 },
      { ...sub("Baby Clothing",     "baby-clothing",     catKids), displayOrder: 9 },
      { ...sub("Diapers",           "diapers",           catKids), displayOrder: 10 },
      { ...sub("Baby Toys",         "baby-toys",         catKids), displayOrder: 11 },
      { ...sub("Feeding Products",  "feeding-products",  catKids), displayOrder: 12 },
      { ...sub("Kids Clothing",     "kids-clothing",     catKids), displayOrder: 13 },
      { ...sub("Kids Toys",         "kids-toys",         catKids), displayOrder: 14 },
      { ...sub("Kids Shoes",        "kids-shoes",        catKids), displayOrder: 15 },

      // ── TV & Appliances (Televisions, Home Appliances, Kitchen Appliances) ──
      { ...sub("Smart TVs",         "smart-tvs",         catTVA), displayOrder: 0 },
      { ...sub("LED TVs",           "led-tvs",           catTVA), displayOrder: 1 },
      { ...sub("Android TVs",       "android-tvs",       catTVA), displayOrder: 2 },
      { ...sub("4K TVs",            "4k-tvs",            catTVA), displayOrder: 3 },
      { ...sub("Refrigerators",     "refrigerators",     catTVA), displayOrder: 4 },
      { ...sub("Washing Machines",  "washing-machines",   catTVA), displayOrder: 5 },
      { ...sub("Air Conditioners",  "air-conditioners",   catTVA), displayOrder: 6 },
      { ...sub("Water Purifiers",   "water-purifiers",    catTVA), displayOrder: 7 },
      { ...sub("Microwave Ovens",   "microwave-ovens",    catTVA), displayOrder: 8 },
      { ...sub("Mixer Grinders",    "mixer-grinders",     catTVA), displayOrder: 9 },
      { ...sub("Electric Kettles",  "electric-kettles",   catTVA), displayOrder: 10 },
      { ...sub("Induction Cooktops","induction-cooktops", catTVA), displayOrder: 11 },
      { ...sub("Televisions",       "televisions",        catTVA), displayOrder: 12 },
      { ...sub("Home Appliances",   "home-appliances",    catTVA), displayOrder: 13 },

      // ── Furniture (Living Room, Bedroom, Office Furniture) ──
      { ...sub("Sofas",           "sofas",           catFurn), displayOrder: 0 },
      { ...sub("Coffee Tables",   "coffee-tables",   catFurn), displayOrder: 1 },
      { ...sub("TV Units",        "tv-units",        catFurn), displayOrder: 2 },
      { ...sub("Recliners",       "recliners",       catFurn), displayOrder: 3 },
      { ...sub("Beds",            "beds",            catFurn), displayOrder: 4 },
      { ...sub("Wardrobes",       "wardrobes",       catFurn), displayOrder: 5 },
      { ...sub("Mattresses",      "mattresses",      catFurn), displayOrder: 6 },
      { ...sub("Bedside Tables",  "bedside-tables",  catFurn), displayOrder: 7 },
      { ...sub("Office Chairs",   "office-chairs",   catFurn), displayOrder: 8 },
      { ...sub("Study Tables",    "study-tables",    catFurn), displayOrder: 9 },
      { ...sub("Book Shelves",    "book-shelves",    catFurn), displayOrder: 10 },
      { ...sub("Tables",          "tables",          catFurn), displayOrder: 11 },
      { ...sub("Chairs",          "chairs",          catFurn), displayOrder: 12 },

      // ── Beauty (Makeup, Skincare, Hair Care) ──
      { ...sub("Lipsticks",          "lipsticks",          catBeauty), displayOrder: 0 },
      { ...sub("Foundations",         "foundations",         catBeauty), displayOrder: 1 },
      { ...sub("Compact Powder",     "compact-powder",      catBeauty), displayOrder: 2 },
      { ...sub("Eyeshadow",          "eyeshadow",           catBeauty), displayOrder: 3 },
      { ...sub("Face Wash",          "face-wash",           catBeauty), displayOrder: 4 },
      { ...sub("Moisturizers",       "moisturizers",        catBeauty), displayOrder: 5 },
      { ...sub("Serums",             "serums",              catBeauty), displayOrder: 6 },
      { ...sub("Sunscreens",         "sunscreens",          catBeauty), displayOrder: 7 },
      { ...sub("Shampoo",            "shampoo",             catBeauty), displayOrder: 8 },
      { ...sub("Hair Oil",           "hair-oil",            catBeauty), displayOrder: 9 },
      { ...sub("Conditioners",       "conditioners",        catBeauty), displayOrder: 10 },
      { ...sub("Hair Styling Tools", "hair-styling-tools",  catBeauty), displayOrder: 11 },
      { ...sub("Skincare",           "skincare",            catBeauty), displayOrder: 12 },
      { ...sub("Makeup",             "makeup",              catBeauty), displayOrder: 13 },

      // ── Mobiles (Smartphones, Accessories) ──
      { ...sub("Android Phones",     "android-phones",      catMob), displayOrder: 0 },
      { ...sub("5G Phones",          "5g-phones",           catMob), displayOrder: 1 },
      { ...sub("Gaming Phones",      "gaming-phones",       catMob), displayOrder: 2 },
      { ...sub("Mobile Cases",       "mobile-cases",        catMob), displayOrder: 3 },
      { ...sub("Screen Protectors",  "screen-protectors",   catMob), displayOrder: 4 },
      { ...sub("Chargers",           "chargers",            catMob), displayOrder: 5 },
      { ...sub("Mobile Power Banks", "mobile-power-banks",  catMob), displayOrder: 6 },

      // ── Computers & Laptops (Laptops, Components, Accessories) ──
      { ...sub("Gaming Laptops",     "gaming-laptops",      catComp), displayOrder: 0 },
      { ...sub("Business Laptops",   "business-laptops",    catComp), displayOrder: 1 },
      { ...sub("Student Laptops",    "student-laptops",     catComp), displayOrder: 2 },
      { ...sub("Processors",         "processors",          catComp), displayOrder: 3 },
      { ...sub("Graphics Cards",     "graphics-cards",      catComp), displayOrder: 4 },
      { ...sub("RAM",                "ram",                 catComp), displayOrder: 5 },
      { ...sub("SSDs",               "ssds",                catComp), displayOrder: 6 },
      { ...sub("Keyboards",          "keyboards",           catComp), displayOrder: 7 },
      { ...sub("Mouse",              "mouse",               catComp), displayOrder: 8 },
      { ...sub("Laptop Bags",        "laptop-bags",         catComp), displayOrder: 9 },

      // ── Audio & Headphones (Headphones, Earbuds, Speakers)
      //    Items like "Bluetooth Speakers" / "Soundbars" share slugs with Electronics subs
      { ...sub("Over-Ear Headphones",       "over-ear-headphones",       catAud), displayOrder: 0 },
      { ...sub("On-Ear Headphones",         "on-ear-headphones",         catAud), displayOrder: 1 },
      { ...sub("Noise Cancelling Headphones","noise-cancelling-headphones",catAud), displayOrder: 2 },
      { ...sub("True Wireless Earbuds",     "true-wireless-earbuds",     catAud), displayOrder: 3 },
      { ...sub("Sports Earbuds",            "sports-earbuds",            catAud), displayOrder: 4 },
      { ...sub("Party Speakers",            "party-speakers",            catAud), displayOrder: 5 },

      // ── Home & Kitchen (Kitchen Appliances, Cookware & Dining, Home Decor, Home Furnishing)
      //    Shared slug items (mixer-grinders, microwave-ovens, etc.) already exist under TV & Appliances
      { ...sub("Cookware Sets",         "cookware-sets",          catHome), displayOrder: 4 },
      { ...sub("Pressure Cookers",      "pressure-cookers",       catHome), displayOrder: 5 },
      { ...sub("Dinner Sets",           "dinner-sets",            catHome), displayOrder: 6 },
      { ...sub("Kitchen Tools",         "kitchen-tools",          catHome), displayOrder: 7 },
      { ...sub("Wall Decor",            "wall-decor",             catHome), displayOrder: 8 },
      { ...sub("Clocks",                "clocks",                 catHome), displayOrder: 9 },
      { ...sub("Photo Frames",          "photo-frames",           catHome), displayOrder: 10 },
      { ...sub("Artificial Plants",     "artificial-plants",      catHome), displayOrder: 11 },
      { ...sub("Bedsheets",             "bedsheets",              catHome), displayOrder: 12 },
      { ...sub("Curtains",              "curtains",               catHome), displayOrder: 13 },
      { ...sub("Cushion Covers",        "cushion-covers",         catHome), displayOrder: 14 },
      { ...sub("Carpets",               "carpets",                catHome), displayOrder: 15 },
      { ...sub("Kitchen Appliances",    "kitchen-appliances",     catHome), displayOrder: 16 },

      // ── Sports & Fitness (Fitness Equipment, Sports Gear, Yoga) ──
      { ...sub("Dumbbells",             "dumbbells",              catSport), displayOrder: 0 },
      { ...sub("Treadmills",            "treadmills",             catSport), displayOrder: 1 },
      { ...sub("Exercise Bikes",        "exercise-bikes",         catSport), displayOrder: 2 },
      { ...sub("Resistance Bands",      "resistance-bands",       catSport), displayOrder: 3 },
      { ...sub("Cricket Bats",          "cricket-bats",           catSport), displayOrder: 4 },
      { ...sub("Football",              "football",               catSport), displayOrder: 5 },
      { ...sub("Badminton Rackets",     "badminton-rackets",      catSport), displayOrder: 6 },
      { ...sub("Basketballs",           "basketballs",            catSport), displayOrder: 7 },
      { ...sub("Yoga Mats",             "yoga-mats",              catSport), displayOrder: 8 },
      { ...sub("Yoga Blocks",           "yoga-blocks",            catSport), displayOrder: 9 },
      { ...sub("Yoga Accessories",      "yoga-accessories",       catSport), displayOrder: 10 },

      // ── Books (Popular Categories, Academic) ──
      { ...sub("Fiction",                "fiction",                catBooks), displayOrder: 0 },
      { ...sub("Non-Fiction",            "non-fiction",            catBooks), displayOrder: 1 },
      { ...sub("Educational Books",      "educational-books",      catBooks), displayOrder: 2 },
      { ...sub("Children Books",         "children-books",         catBooks), displayOrder: 3 },
      { ...sub("School Books",           "school-books",           catBooks), displayOrder: 4 },
      { ...sub("Competitive Exam Books", "competitive-exam-books", catBooks), displayOrder: 5 },
      { ...sub("Engineering Books",      "engineering-books",      catBooks), displayOrder: 6 },
      { ...sub("Medical Books",          "medical-books",          catBooks), displayOrder: 7 },

      // ── Toys & Games (Kids Toys, Board Games) ──
      { ...sub("Educational Toys",       "educational-toys",       catToys), displayOrder: 0 },
      { ...sub("Soft Toys",              "soft-toys",              catToys), displayOrder: 1 },
      { ...sub("Remote Control Toys",    "remote-control-toys",    catToys), displayOrder: 2 },
      { ...sub("Building Blocks",        "building-blocks",        catToys), displayOrder: 3 },
      { ...sub("Chess",                  "chess",                  catToys), displayOrder: 4 },
      { ...sub("Ludo",                   "ludo",                   catToys), displayOrder: 5 },
      { ...sub("Carrom",                 "carrom",                 catToys), displayOrder: 6 },
      { ...sub("Puzzle Games",           "puzzle-games",           catToys), displayOrder: 7 },

      // ── Automotive (Car Accessories, Bike Accessories) ──
      { ...sub("Car Covers",             "car-covers",             catAuto), displayOrder: 0 },
      { ...sub("Seat Covers",            "seat-covers",            catAuto), displayOrder: 1 },
      { ...sub("Car Chargers",           "car-chargers",           catAuto), displayOrder: 2 },
      { ...sub("Car Perfumes",           "car-perfumes",           catAuto), displayOrder: 3 },
      { ...sub("Helmets",                "helmets",                catAuto), displayOrder: 4 },
      { ...sub("Bike Covers",            "bike-covers",            catAuto), displayOrder: 5 },
      { ...sub("Gloves",                 "gloves",                 catAuto), displayOrder: 6 },
      { ...sub("Riding Gear",            "riding-gear",            catAuto), displayOrder: 7 },

      // ── Grocery (Food Staples, Packaged Foods, Beverages) ──
      { ...sub("Rice",                   "rice",                   catGroc), displayOrder: 0 },
      { ...sub("Flour",                  "flour",                  catGroc), displayOrder: 1 },
      { ...sub("Pulses",                 "pulses",                 catGroc), displayOrder: 2 },
      { ...sub("Cooking Oil",            "cooking-oil",            catGroc), displayOrder: 3 },
      { ...sub("Snacks",                 "snacks",                 catGroc), displayOrder: 4 },
      { ...sub("Biscuits",               "biscuits",               catGroc), displayOrder: 5 },
      { ...sub("Instant Foods",          "instant-foods",          catGroc), displayOrder: 6 },
      { ...sub("Breakfast Cereals",      "breakfast-cereals",      catGroc), displayOrder: 7 },
      { ...sub("Tea",                    "tea",                    catGroc), displayOrder: 8 },
      { ...sub("Coffee",                 "coffee",                 catGroc), displayOrder: 9 },
      { ...sub("Soft Drinks",            "soft-drinks",            catGroc), displayOrder: 10 },
      { ...sub("Energy Drinks",          "energy-drinks",          catGroc), displayOrder: 11 },

      // ── Health Care (Health Essentials, Personal Care) ──
      { ...sub("Vitamins & Supplements", "vitamins-and-supplements",catHealth), displayOrder: 0 },
      { ...sub("First Aid Kits",         "first-aid-kits",         catHealth), displayOrder: 1 },
      { ...sub("Health Devices",         "health-devices",         catHealth), displayOrder: 2 },
      { ...sub("Sanitizers",             "sanitizers",             catHealth), displayOrder: 3 },
      { ...sub("Masks",                  "masks",                  catHealth), displayOrder: 4 },
      { ...sub("Thermometers",           "thermometers",           catHealth), displayOrder: 5 },
      { ...sub("Blood Pressure Monitors","blood-pressure-monitors",catHealth), displayOrder: 6 },
    ]);

    // Build a quick look-up by slug
    const SC = {};
    subCats.forEach((c) => { SC[c.slug] = c; });

    // Convenient aliases for product seeding
    const laptops       = SC["laptops"];
    const smartphones   = SC["smartphones"];
    const headphones    = SC["headphones"];
    const sarees        = SC["sarees"];
    const kurtis        = SC["kurtis"];
    const lehengas      = SC["lehengas"];
    const kurtas        = SC["kurtas"];
    const tshirts       = SC["t-shirts"];
    const jeans         = SC["jeans"];
    const shirts        = SC["shirts"];
    const kidClothing   = SC["kids-clothing"];
    const kidToys       = SC["kids-toys"];
    const smartTvs      = SC["smart-tvs"];
    const homeAppl      = SC["home-appliances"];
    const mixerGrinders = SC["mixer-grinders"];
    const sofas         = SC["sofas"];
    const beds          = SC["beds"];
    const tables        = SC["tables"] || SC["study-tables"];
    const chairs        = SC["chairs"] || SC["office-chairs"];
    const skincare      = SC["skincare"] || SC["serums"];
    const kitchenAppl   = SC["kitchen-appliances"];
    const dumbbells     = SC["dumbbells"];
    const yogaMats      = SC["yoga-mats"];
    const cricketBats   = SC["cricket-bats"];
    const fiction       = SC["fiction"];
    const childrenBooks = SC["children-books"];
    const eduToys       = SC["educational-toys"];
    const chess         = SC["chess"];
    const carCovers     = SC["car-covers"];
    const helmets       = SC["helmets"];
    const rice          = SC["rice"];
    const tea           = SC["tea"];
    const vitamins      = SC["vitamins-and-supplements"];
    const sanitizers    = SC["sanitizers"];
    const gamingLaptops = SC["gaming-laptops"];
    const overEarHP     = SC["over-ear-headphones"];
    const trueWireless  = SC["true-wireless-earbuds"];
    const partySpeakers = SC["party-speakers"];
    const cookwareSets  = SC["cookware-sets"];
    const bedsheets     = SC["bedsheets"];

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
    // 6. PRODUCTS  (50+ products across all categories)
    // =====================================================================
    const productData = [
      // ---------- ELECTRONICS: Laptops ----------
      {
        name: "ProBook 15 Laptop",
        slug: "probook-15-laptop",
        description: "15.6 inch laptop with Intel i5, ideal for work and study. Multiple RAM and storage options.",
        category: laptops._id, categories: [laptops._id, catElec._id, catComp._id],
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
        category: laptops._id, categories: [laptops._id, catElec._id, gamingLaptops._id],
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

      // ---------- ELECTRONICS: Smartphones ----------
      {
        name: "SmartPhone X Pro",
        slug: "smartphone-x-pro",
        description: "6.5 inch AMOLED display, 5000mAh battery, 108MP camera.",
        category: smartphones._id, categories: [smartphones._id, catElec._id, catMob._id],
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
        category: smartphones._id, categories: [smartphones._id, catElec._id, catMob._id],
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
        category: headphones._id, categories: [headphones._id, catElec._id, catAud._id, overEarHP._id],
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
      {
        name: "boAt Airdopes 141 TWS Earbuds",
        slug: "boat-airdopes-141",
        description: "True wireless earbuds with 42H playback, ENx noise cancellation, and low-latency mode.",
        category: trueWireless._id, categories: [trueWireless._id, catAud._id, catElec._id],
        seller: seller3._id, status: "active", brand: "boAt",
        attributes: { type: "TWS Earbuds", connectivity: "Bluetooth 5.1" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Black","Blue","White"], displayOrder: 0 }],
        variants: [
          { sku: "BA141-BK", attributes: { color: "Black" }, price: 1299, mrp: 2999, stock: 50, images: [{ url: IMG(600,600,"ba1"), alt: "Earbuds Black" }], isActive: true },
          { sku: "BA141-BL", attributes: { color: "Blue" },  price: 1299, mrp: 2999, stock: 40, images: [{ url: IMG(600,600,"ba2"), alt: "Earbuds Blue" }], isActive: true },
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
        category: lehengas._id, categories: [lehengas._id, catFash._id],
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
        category: smartTvs._id, categories: [smartTvs._id, catTVA._id],
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
        category: mixerGrinders._id, categories: [mixerGrinders._id, homeAppl._id, catTVA._id],
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
      {
        name: "Premium Stainless Steel Cookware Set",
        slug: "premium-stainless-steel-cookware-set",
        description: "5-piece stainless steel cookware set with induction base. Dishwasher safe.",
        category: cookwareSets._id, categories: [cookwareSets._id, catHome._id],
        seller: seller2._id, status: "active", brand: "Prestige",
        attributes: { material: "Stainless Steel", pieces: "5" }, taxCode: "GST_18",
        variantAttributeDefs: [],
        variants: [
          { sku: "PSSC-5", attributes: {}, price: 3499, mrp: 4999, stock: 20, images: [{ url: IMG(600,600,"pssc1"), alt: "Cookware Set" }], isActive: true },
        ],
      },
      {
        name: "Cotton Bedsheet Set (King Size)",
        slug: "cotton-bedsheet-set-king",
        description: "144 TC cotton bedsheet with 2 pillow covers. Fade-resistant prints.",
        category: bedsheets._id, categories: [bedsheets._id, catHome._id],
        seller: seller2._id, status: "active", brand: "Bombay Dyeing",
        attributes: { material: "Cotton", size: "King" }, taxCode: "GST_5",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Blue Floral","Red Ethnic","Green Leaf"], displayOrder: 0 }],
        variants: [
          { sku: "CBS-BF", attributes: { color: "Blue Floral" },  price: 799, mrp: 1199, stock: 40, images: [{ url: IMG(600,600,"cbs1"), alt: "Bedsheet Blue" }], isActive: true },
          { sku: "CBS-RE", attributes: { color: "Red Ethnic" },   price: 799, mrp: 1199, stock: 35, images: [{ url: IMG(600,600,"cbs2"), alt: "Bedsheet Red" }], isActive: true },
          { sku: "CBS-GL", attributes: { color: "Green Leaf" },   price: 849, mrp: 1249, stock: 30, images: [{ url: IMG(600,600,"cbs3"), alt: "Bedsheet Green" }], isActive: true },
        ],
      },

      // ---------- SPORTS & FITNESS ----------
      {
        name: "Hex Dumbbell Set 5kg Pair",
        slug: "hex-dumbbell-set-5kg",
        description: "Rubber-coated hex dumbbells, anti-roll design. Ideal for home workouts.",
        category: dumbbells._id, categories: [dumbbells._id, catSport._id],
        seller: seller2._id, status: "active", brand: "Boldfit",
        attributes: { weight: "5kg pair" }, taxCode: "GST_18",
        variantAttributeDefs: [],
        variants: [
          { sku: "HDS-5KG", attributes: {}, price: 1499, mrp: 1999, stock: 30, images: [{ url: IMG(600,600,"hds1"), alt: "Dumbbell Set" }], isActive: true },
        ],
      },
      {
        name: "Premium Yoga Mat 6mm",
        slug: "premium-yoga-mat-6mm",
        description: "Anti-slip TPE yoga mat with carry strap. Eco-friendly material.",
        category: yogaMats._id, categories: [yogaMats._id, catSport._id],
        seller: seller2._id, status: "active", brand: "Boldfit",
        attributes: { material: "TPE", thickness: "6mm" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Purple","Blue","Black"], displayOrder: 0 }],
        variants: [
          { sku: "PYM-PUR", attributes: { color: "Purple" }, price: 699, mrp: 999, stock: 50, images: [{ url: IMG(600,600,"pym1"), alt: "Yoga Mat Purple" }], isActive: true },
          { sku: "PYM-BLU", attributes: { color: "Blue" },   price: 699, mrp: 999, stock: 40, images: [{ url: IMG(600,600,"pym2"), alt: "Yoga Mat Blue" }], isActive: true },
        ],
      },
      {
        name: "SG Kashmir Willow Cricket Bat",
        slug: "sg-kashmir-willow-cricket-bat",
        description: "Full-size Kashmir willow cricket bat with premium quality grip.",
        category: cricketBats._id, categories: [cricketBats._id, catSport._id],
        seller: seller2._id, status: "active", brand: "SG",
        attributes: { material: "Kashmir Willow" }, taxCode: "GST_18",
        variantAttributeDefs: [],
        variants: [
          { sku: "SGCB-KW", attributes: {}, price: 1999, mrp: 2999, stock: 15, images: [{ url: IMG(600,600,"sgcb1"), alt: "Cricket Bat" }], isActive: true },
        ],
      },

      // ---------- BOOKS ----------
      {
        name: "The Alchemist - Paulo Coelho",
        slug: "the-alchemist-paulo-coelho",
        description: "A magical story of Santiago, a shepherd boy on a journey to find treasure.",
        category: fiction._id, categories: [fiction._id, catBooks._id],
        seller: seller1._id, status: "active", brand: "HarperCollins",
        attributes: { author: "Paulo Coelho", pages: "208" }, taxCode: "GST_5",
        variantAttributeDefs: [],
        variants: [
          { sku: "TAL-PB", attributes: {}, price: 249, mrp: 350, stock: 100, images: [{ url: IMG(400,600,"tal1"), alt: "The Alchemist" }], isActive: true },
        ],
      },
      {
        name: "Wonder: Illustrated Treasury",
        slug: "wonder-illustrated-treasury",
        description: "A beautifully illustrated children's book about kindness and acceptance.",
        category: childrenBooks._id, categories: [childrenBooks._id, catBooks._id],
        seller: seller1._id, status: "active", brand: "Penguin Random House",
        attributes: { author: "R.J. Palacio", pages: "320" }, taxCode: "GST_5",
        variantAttributeDefs: [],
        variants: [
          { sku: "WIT-HB", attributes: {}, price: 499, mrp: 699, stock: 40, images: [{ url: IMG(400,600,"wit1"), alt: "Wonder Book" }], isActive: true },
        ],
      },

      // ---------- TOYS & GAMES ----------
      {
        name: "LEGO Classic Building Blocks 500pc",
        slug: "lego-classic-building-blocks-500",
        description: "500 colorful building blocks for creative play. Ages 4+.",
        category: eduToys._id, categories: [eduToys._id, catToys._id],
        seller: seller2._id, status: "active", brand: "LEGO",
        attributes: { pieces: "500", ageGroup: "4+" }, taxCode: "GST_12",
        variantAttributeDefs: [],
        variants: [
          { sku: "LCBB-500", attributes: {}, price: 2499, mrp: 3499, stock: 25, images: [{ url: IMG(600,600,"lcbb1"), alt: "LEGO Blocks" }], isActive: true },
        ],
      },
      {
        name: "Wooden Chess Board Set",
        slug: "wooden-chess-board-set",
        description: "Handcrafted wooden chess set with magnetic pieces. Foldable board.",
        category: chess._id, categories: [chess._id, catToys._id],
        seller: seller2._id, status: "active", brand: "Stonkraft",
        attributes: { material: "Wood", size: "12 inch" }, taxCode: "GST_12",
        variantAttributeDefs: [],
        variants: [
          { sku: "WCBS-12", attributes: {}, price: 899, mrp: 1299, stock: 30, images: [{ url: IMG(600,600,"wcbs1"), alt: "Chess Board" }], isActive: true },
        ],
      },

      // ---------- AUTOMOTIVE ----------
      {
        name: "Universal Car Seat Cover Set",
        slug: "universal-car-seat-cover-set",
        description: "Breathable faux leather car seat covers. Fits most sedan and SUV models.",
        category: carCovers._id, categories: [carCovers._id, catAuto._id],
        seller: seller2._id, status: "active", brand: "AutoFurnish",
        attributes: { material: "Faux Leather" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Black","Beige","Grey"], displayOrder: 0 }],
        variants: [
          { sku: "UCSC-BK", attributes: { color: "Black" }, price: 2999, mrp: 4499, stock: 20, images: [{ url: IMG(600,600,"ucsc1"), alt: "Seat Cover Black" }], isActive: true },
          { sku: "UCSC-BG", attributes: { color: "Beige" }, price: 2999, mrp: 4499, stock: 15, images: [{ url: IMG(600,600,"ucsc2"), alt: "Seat Cover Beige" }], isActive: true },
        ],
      },
      {
        name: "Studds Marshall Full Face Helmet",
        slug: "studds-marshall-full-face-helmet",
        description: "ISI certified full face helmet with anti-scratch visor.",
        category: helmets._id, categories: [helmets._id, catAuto._id],
        seller: seller2._id, status: "active", brand: "Studds",
        attributes: { certification: "ISI" }, taxCode: "GST_18",
        variantAttributeDefs: [{ key: "color", label: "Color", options: ["Black","White","Red"], displayOrder: 0 }],
        variants: [
          { sku: "SMH-BK", attributes: { color: "Black" }, price: 1199, mrp: 1599, stock: 25, images: [{ url: IMG(600,600,"smh1"), alt: "Helmet Black" }], isActive: true },
          { sku: "SMH-WH", attributes: { color: "White" }, price: 1199, mrp: 1599, stock: 20, images: [{ url: IMG(600,600,"smh2"), alt: "Helmet White" }], isActive: true },
        ],
      },

      // ---------- GROCERY ----------
      {
        name: "India Gate Basmati Rice 5kg",
        slug: "india-gate-basmati-rice-5kg",
        description: "Premium long grain basmati rice. Aged for extra flavor and length.",
        category: rice._id, categories: [rice._id, catGroc._id],
        seller: seller1._id, status: "active", brand: "India Gate",
        attributes: { weight: "5kg", grain: "Long" }, taxCode: "GST_5",
        variantAttributeDefs: [],
        variants: [
          { sku: "IGBR-5KG", attributes: {}, price: 649, mrp: 799, stock: 80, images: [{ url: IMG(600,600,"igbr1"), alt: "Basmati Rice" }], isActive: true },
        ],
      },
      {
        name: "Tata Gold Premium Tea 1kg",
        slug: "tata-gold-premium-tea-1kg",
        description: "Premium blend of long leaf tea for a rich and invigorating taste.",
        category: tea._id, categories: [tea._id, catGroc._id],
        seller: seller1._id, status: "active", brand: "Tata",
        attributes: { weight: "1kg" }, taxCode: "GST_5",
        variantAttributeDefs: [],
        variants: [
          { sku: "TGPT-1KG", attributes: {}, price: 399, mrp: 499, stock: 60, images: [{ url: IMG(600,600,"tgpt1"), alt: "Tata Tea" }], isActive: true },
        ],
      },

      // ---------- HEALTH CARE ----------
      {
        name: "HealthVit Multivitamin 60 Tablets",
        slug: "healthvit-multivitamin-60",
        description: "Daily multivitamin with 25+ essential vitamins and minerals.",
        category: vitamins._id, categories: [vitamins._id, catHealth._id],
        seller: seller1._id, status: "active", brand: "HealthVit",
        attributes: { quantity: "60 tablets" }, taxCode: "GST_12",
        variantAttributeDefs: [],
        variants: [
          { sku: "HVM-60", attributes: {}, price: 449, mrp: 599, stock: 50, images: [{ url: IMG(600,600,"hvm1"), alt: "Multivitamin" }], isActive: true },
        ],
      },
      {
        name: "Dettol Hand Sanitizer 500ml",
        slug: "dettol-hand-sanitizer-500ml",
        description: "Kills 99.9% germs instantly. Moisturizing formula with aloe vera.",
        category: sanitizers._id, categories: [sanitizers._id, catHealth._id],
        seller: seller1._id, status: "active", brand: "Dettol",
        attributes: { volume: "500ml" }, taxCode: "GST_18",
        variantAttributeDefs: [],
        variants: [
          { sku: "DHS-500", attributes: {}, price: 199, mrp: 299, stock: 100, images: [{ url: IMG(600,600,"dhs1"), alt: "Sanitizer" }], isActive: true },
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
        showOnCheckout: true, audience: "new_users",
      },
      {
        code: "FLAT200", description: "Flat Rs 200 off on orders above Rs 1500", type: "flat", value: 200,
        minOrderAmount: 1500, maxDiscount: null, usageLimit: 500, perUserLimit: 2,
        validFrom: now, validTo: in30Days, isActive: true, createdBy: admin._id,
        showOnCheckout: true, audience: "all",
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
