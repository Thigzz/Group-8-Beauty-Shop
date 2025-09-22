export default function CartItem() {
  return (
    <div className="flex items-center justify-between border rounded-xl p-4 shadow-sm">
      {/* Product Info */}
      <div className="flex items-center gap-4">
        {/* Image Placeholder */}
        <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
        <div>
          <h3 className="font-medium">Product Name</h3>
          <p className="text-sm text-gray-500">Product Size</p>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <button className="px-2 py-1 border rounded-lg">-</button>
        <span>1</span>
        <button className="px-2 py-1 border rounded-lg">+</button>
      </div>

      {/* Price */}
      <p className="font-semibold">Ksh 0.00</p>
    </div>
  );
}
