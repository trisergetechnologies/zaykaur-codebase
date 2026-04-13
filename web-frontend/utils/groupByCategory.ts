// utils/groupByCategory.ts
export const groupByCategory = (products: any[]) => {
  return products.reduce((acc: any, product) => {
    const category = product.category.toLowerCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});
};
