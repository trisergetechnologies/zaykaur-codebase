import { Product, SearchParams } from "@/types";

export const filterProducts = (
  data: Product[],
  filters: SearchParams
): Product[] => {
  let filtered = [...data];

  if (filters.category) {
    filtered = filtered.filter(
      (item) => item.category === filters.category
    );
  }

  if (filters.brand) {
    filtered = filtered.filter(
      (item) => item.brand === filters.brand
    );
  }

  if (filters.color) {
    filtered = filtered.filter(
      (item) => item.color?.includes(filters.color!)
    );
  }

  if (filters.min) {
    filtered = filtered.filter(
      (item) => item.price >= Number(filters.min)
    );
  }

  if (filters.max) {
    filtered = filtered.filter(
      (item) => item.price <= Number(filters.max)
    );
  }

  return filtered;
};
