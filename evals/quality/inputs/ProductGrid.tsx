import { useEffect, useState } from "react";

type Product = { id: string; name: string; price: number; image: string; rating: number; inStock: boolean };

export function ProductGrid({ category }: { category: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`/api/products?category=${category}`).then((r) => r.json()).then(setProducts);
  }, [category]);

  return (
    <div className="grid grid-cols-4 gap-[18px] p-[22px]">
      {products.map((p) => (
        <div key={p.id} className="bg-white rounded-2xl shadow-xl hover:shadow-2xl p-3" onClick={() => (window.location.href = `/p/${p.id}`)}>
          <img src={p.image} className="w-full h-48 object-cover rounded-lg" />
          <div className="mt-2 text-[15px] font-semibold text-[#222]">{p.name}</div>
          <div className="text-[#888] text-xs">{"★".repeat(p.rating)}</div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-lg font-bold text-emerald-600">${p.price}</span>
            {p.inStock ? (
              <span className="text-[10px] text-green-500">In stock</span>
            ) : (
              <span className="text-[10px] text-red-400">Sold out</span>
            )}
          </div>
          <div className="flex gap-1 mt-3">
            <button className="flex-1 bg-emerald-600 text-white text-xs py-1 rounded-md">Add to cart</button>
            <button className="flex-1 bg-emerald-600 text-white text-xs py-1 rounded-md">Buy now</button>
            <button className="w-7 h-7 bg-gray-100 rounded-full">♡</button>
          </div>
        </div>
      ))}
    </div>
  );
}
