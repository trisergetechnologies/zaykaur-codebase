"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  BoxIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  UserCircleIcon,
} from "../icons/index";
import {
  BarChart3,
  Box,
  Layers,
  Layout,
  Package,
  RotateCcw,
  ShoppingBasketIcon,
  Store,
  Ticket,
  Truck,
  Users,
} from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const adminNavSections: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { icon: <GridIcon />, name: "Dashboard", path: "/admin" },
      { icon: <Layout size={20} />, name: "Homepage", path: "/admin/homepage" },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        icon: <BoxIcon />,
        name: "Products",
        subItems: [
          { name: "All products", path: "/admin/product" },
          { name: "Pending approval", path: "/admin/products/pending" },
        ],
      },
      { icon: <Layers size={20} />, name: "Categories", path: "/admin/categories" },
    ],
  },
  {
    label: "Commerce",
    items: [
      {
        icon: <Store size={20} />,
        name: "Sellers",
        subItems: [
          { name: "All Sellers", path: "/admin/sellers" },
          { name: "Pending Approvals", path: "/admin/sellers/pending" },
        ],
      },
      { icon: <ShoppingBasketIcon />, name: "Orders", path: "/admin/orders" },
      { icon: <Ticket size={20} />, name: "Coupons", path: "/admin/coupons" },
      { icon: <RotateCcw size={20} />, name: "Returns", path: "/admin/returns" },
    ],
  },
  {
    label: "Insights",
    items: [
      { icon: <BarChart3 size={20} />, name: "Reports", path: "/admin/reports" },
      { icon: <Users size={20} />, name: "Customers", path: "/admin/customers" },
    ],
  },
];

const sellerNavSectionsApproved: NavSection[] = [
  {
    label: "Workspace",
    items: [
      { icon: <ShoppingBasketIcon />, name: "Orders", path: "/seller/orders" },
      { icon: <Store size={20} />, name: "Onboarding", path: "/seller/onboarding" },
      { icon: <Box size={20} />, name: "My Products", path: "/seller/product" },
      { icon: <Package size={20} />, name: "Inventory", path: "/seller/inventory" },
      { icon: <Truck size={20} />, name: "Shipments", path: "/seller/shipments" },
      { icon: <RotateCcw size={20} />, name: "Returns", path: "/seller/returns" },
    ],
  },
  {
    label: "Insights",
    items: [{ icon: <BarChart3 size={20} />, name: "Reports", path: "/seller/reports" }],
  },
];

const adminOthersItems: NavItem[] = [
  { icon: <UserCircleIcon />, name: "Profile", path: "/admin/profile" },
];

const sellerOthersItems: NavItem[] = [
  { icon: <UserCircleIcon />, name: "Profile", path: "/seller/profile" },
];

function submenuKey(menuType: "main" | "others", name: string) {
  return `${menuType}:${name}`;
}

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user, sellerAccess } = useAuth();
  const isSeller = user?.role === "seller";
  const isSellerApproved = sellerAccess?.isApproved ?? false;

  const mainSections: NavSection[] = useMemo(() => {
    if (!isSeller) return adminNavSections;
    if (isSellerApproved) return sellerNavSectionsApproved;
    const flat = sellerNavSectionsApproved.flatMap((s) => s.items);
    const gated = flat.filter(
      (item) =>
        item.path === "/seller/onboarding" || item.path === "/seller/profile"
    );
    return [{ label: "Workspace", items: gated }];
  }, [isSeller, isSellerApproved]);

  const othersItems = isSeller ? sellerOthersItems : adminOthersItems;

  const flatMainNav = useMemo(
    () => mainSections.flatMap((s) => s.items),
    [mainSections]
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    name: string;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const renderMenuItems = (navItems: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-1">
      {navItems.map((nav) => {
        const key = submenuKey(menuType, nav.name);
        const isOpen =
          openSubmenu?.type === menuType && openSubmenu?.name === nav.name;
        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                type="button"
                onClick={() => handleSubmenuToggle(nav.name, menuType)}
                className={`menu-item group ${
                  isOpen ? "menu-item-active" : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span
                  className={` ${
                    isOpen ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className={`menu-item-text`}>{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[key] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height: isOpen ? `${subMenuHeight[key] || 0}px` : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        href={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {subItem.name}
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`ml-auto ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-badge-active"
                                  : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  useEffect(() => {
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? flatMainNav : othersItems;
      items.forEach((nav) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({ type: menuType, name: nav.name });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive, flatMainNav, othersItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = submenuKey(openSubmenu.type, openSubmenu.name);
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (name: string, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.name === name) return null;
      return { type: menuType, name };
    });
  };

  const sectionHeadingClass =
    "sidebar-section-heading mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500";

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-4 left-0 bg-[var(--color-surface-sidebar)] backdrop-blur-xl text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-[var(--color-border-hairline)] dark:bg-gray-950/95 dark:border-white/[0.06]
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
              ? "w-[290px]"
              : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link
          href={
            isSeller
              ? isSellerApproved
                ? "/seller/orders"
                : "/seller/onboarding"
              : "/admin"
          }
          className="flex items-center"
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent tracking-wide">
              Zaykaur
            </span>
          ) : (
            <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
              Z
            </span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6 flex flex-col gap-6">
          {mainSections.map((section) => (
            <div key={section.label}>
              <h2
                className={`${sectionHeadingClass} ${
                  !isExpanded && !isHovered ? "lg:flex lg:justify-center lg:px-0" : ""
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  section.label
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(section.items, "main")}
            </div>
          ))}

          <div>
            <h2
              className={`${sectionHeadingClass} ${
                !isExpanded && !isHovered ? "lg:flex lg:justify-center lg:px-0" : ""
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? (
                "Account"
              ) : (
                <HorizontaLDots />
              )}
            </h2>
            {renderMenuItems(othersItems, "others")}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
