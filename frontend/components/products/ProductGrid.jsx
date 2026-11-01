import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [], emptyMessage = "No creations found." }) {
  if (products.length === 0) {
    return (
      <div className="py-16 text-center rounded-2xl bg-white border border-stone-200 p-8">
        <p className="text-sm font-semibold text-stone-800">{emptyMessage}</p>
        <p className="text-xs text-stone-500 mt-1">
          Try adjusting your search or category filters to find what you are looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
