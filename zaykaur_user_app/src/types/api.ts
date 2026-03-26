/**
 * API response shapes (Server/Gateway). Keep in sync with backend.
 */

export interface ApiUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  addresses?: ApiAddress[];
}

export interface ApiAddress {
  fullName?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

export interface ApiProductVariant {
  _id: string;
  sku: string;
  attributes?: Record<string, string>;
  price: number;
  mrp?: number;
  stock: number;
  images?: { url?: string; alt?: string }[];
  isActive?: boolean;
}

export interface ApiVariantSelector {
  key: string;
  label: string;
  options: { value: string; inStock: boolean }[];
}

export interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  seller: string | { _id: string; name?: string };
  category: { _id: string; name?: string; slug?: string } | string;
  categories?: { _id: string; name?: string; slug?: string }[];
  brand?: string;
  status: string;
  attributes?: Record<string, string>;
  variants: ApiProductVariant[];
  variantSelectors?: ApiVariantSelector[];
}

export interface ApiCartItem {
  productId: { _id: string; name?: string; slug?: string };
  variantId?: string;
  quantity: number;
  sellerId: { _id: string; name?: string };
  addedAt?: string;
  unitPrice?: number;
  name?: string;
  image?: string;
}

export interface ApiCart {
  _id?: string;
  userId?: string;
  items: ApiCartItem[];
  itemsTotal: number;
  taxTotal: number;
  shippingEstimate: number;
  grandTotal: number;
  currency: string;
}

export interface ApiOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  items: unknown[];
  shippingAddress: ApiAddress;
  grandTotal: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
