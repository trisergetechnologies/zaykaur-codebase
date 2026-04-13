import React from "react";
import Link from "next/link";

const footerSections = [
  {
    title: "Get to Know Us",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Our Blog", href: "/blog" },
      { label: "Contact Us", href: "/contact" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Electronics", href: "/shop?category=electronics" },
      { label: "Fashion", href: "/shop?category=fashion" },
      { label: "Furniture", href: "/shop?category=furniture" },
      { label: "Kids", href: "/shop?category=kids" },
      { label: "All Categories", href: "/category" },
    ],
  },
  {
    title: "Your Account",
    links: [
      { label: "My Account", href: "/my-account" },
      { label: "Your Orders", href: "/orders" },
      { label: "Your Wishlist", href: "/wishlist" },
      { label: "Your Cart", href: "/cart" },
    ],
  },
  {
    title: "Policies",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Returns & Refunds", href: "/help" },
      { label: "Shipping Info", href: "/help" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#131A22] text-gray-300">
      {/* TOP GRID SECTION */}
      <div className="max-w-screen-xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
        {footerSections.map((section, index) => (
          <div key={index}>
            <h3 className="text-white text-sm font-semibold mb-4">
              {section.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {section.links.map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="hover:underline hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* MIDDLE BRAND BAR */}
      <div className="border-t border-gray-700 py-8">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-center items-center gap-6">
          <Link href="/" className="text-white text-2xl font-bold tracking-wide">
            ZAYKAUR
          </Link>
          <div className="flex gap-4 text-sm">
            <span className="border border-gray-600 px-4 py-2 rounded-sm">
              English
            </span>
            <span className="border border-gray-600 px-4 py-2 rounded-sm">
              India
            </span>
            <span className="border border-gray-600 px-4 py-2 rounded-sm">
              INR
            </span>
          </div>
        </div>
      </div>

      {/* LARGE LINK SECTION */}
      <div className="bg-[#0F1111] text-gray-400 py-12">
        <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 px-6 text-xs">
          <div>
            <p className="text-white font-semibold mb-2">Zaykaur Fashion</p>
            <p>Premium ethnic collections for modern India.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Sell with Us</p>
            <p>Start selling your fashion products on Zaykaur.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Zaykaur Pay</p>
            <p>Secure and fast checkout payments.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Fashion Deals</p>
            <p>Exclusive seasonal discounts and deals.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Designer Hub</p>
            <p>For independent designers and brands.</p>
          </div>
          <div>
            <p className="text-white font-semibold mb-2">Mobile App</p>
            <p>Shop faster with our upcoming mobile app.</p>
          </div>
        </div>
      </div>

      {/* FINAL COPYRIGHT */}
      <div className="bg-[#0F1111] border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} ZAYKAUR. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
