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
      { label: "Returns & Refunds", href: "/returns-refunds" },
      { label: "Shipping Info", href: "/shipping" },
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

      {/* FINAL COPYRIGHT */}
      <div className="bg-[#0F1111] border-t border-gray-800 py-6 text-center text-xs text-gray-500">
        <div className="max-w-screen-xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <span>
            &copy; {new Date().getFullYear()} ZAYKAUR. All Rights Reserved.
          </span>
          <span className="hidden sm:inline text-gray-600" aria-hidden>
            |
          </span>
          <Link href="/terms" className="hover:text-gray-300 hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-300 hover:underline">
            Privacy
          </Link>
          <Link
            href="/returns-refunds"
            className="hover:text-gray-300 hover:underline"
          >
            Returns
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
