/** Review row from GET /api/v1/public/products/:productId/reviews */
export type PublicReviewItem = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  images?: { url?: string; alt?: string }[];
  userId?: { name?: string; avatar?: string };
  createdAt?: string;
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
};

export type PublicReviewDistribution = {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
};

export type PublicReviewStats = {
  averageRating: number;
  totalReviews: number;
  distribution?: PublicReviewDistribution;
};
