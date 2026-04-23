export type TimeSeriesPoint = { _id: string; [key: string]: string | number | undefined };

export type AdminAnalyticsSummary = {
  totalGMV?: number;
  totalOrders?: number;
  avgOrderValue?: number;
  totalCustomers?: number;
  totalSellers?: number;
  totalProducts?: number;
};

export type GmvOverTimeRow = {
  _id: string;
  gmv?: number;
  orderCount?: number;
};

export type UserGrowthRow = {
  _id: string;
  newUsers?: number;
};

export type TopSellerRow = {
  sellerId?: string;
  name?: string;
  revenue?: number;
  orderCount?: number;
};

export type AdminAnalyticsPayload = {
  period?: { days: number; since: string };
  summary?: AdminAnalyticsSummary;
  gmvOverTime?: GmvOverTimeRow[];
  userGrowth?: UserGrowthRow[];
  topSellers?: TopSellerRow[];
};

export type SellerAnalyticsSummary = {
  totalRevenue?: number;
  totalOrders?: number;
  totalUnits?: number;
  avgOrderValue?: number;
};

export type SalesOverTimeRow = {
  _id: string;
  revenue?: number;
  orderCount?: number;
  unitsSold?: number;
};

export type TopProductRow = {
  _id?: string;
  name?: string;
  totalRevenue?: number;
  totalQuantity?: number;
};

export type SellerAnalyticsPayload = {
  period?: { days: number; since: string };
  summary?: SellerAnalyticsSummary;
  salesOverTime?: SalesOverTimeRow[];
  topProducts?: TopProductRow[];
};
