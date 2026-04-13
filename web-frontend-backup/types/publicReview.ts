/** Review row from GET /api/v1/public/products/:productId/reviews */
export type PublicReviewItem = {
  _id: string;
  rating: number;
  title?: string;
  body?: string;
  images?: { url?: string; alt?: string }[];
  userId?: { name?: string };
};

export type PublicReviewStats = {
  averageRating: number;
  totalReviews: number;
};
