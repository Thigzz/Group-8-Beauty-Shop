export default function CartItem({ item, onQuantityChange, onRemove }) {
  const { id, product, quantity } = item;

  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(id, quantity + 1);
  };

  if (!product) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border rounded-xl p-4 shadow-sm">
      {/* Product Info */}
      <div className="flex items-center gap-4">
        {/* Image Placeholder */}
        <div className="w-16 h-16 bg-gray-200 rounded-md">
            {product.image_url && <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover rounded-md" />}
        </div>
        <div>
          <h3 className="font-medium">{product.product_name}</h3>
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-3">
        <button className="px-2 py-1 border rounded-lg" onClick={handleDecrease}>-</button>
        <span>{quantity}</span>
        <button className="px-2 py-1 border rounded-lg" onClick={handleIncrease}>+</button>
      </div>

      {/* Price */}
      <p className="font-semibold">Ksh {(product.price * quantity).toFixed(2)}</p>

      {/* Remove Button */}
      <button className="text-red-500 hover:text-red-700" onClick={() => onRemove(id)}>Remove</button>
    </div>
  );
}