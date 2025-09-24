import React, { useState } from "react";

export default function CartItem({ item, onUpdateQty, onRemove }) {
  const [updating, setUpdating] = useState(false);

  const handleQtyChange = async (e) => {
    const newQty = parseInt(e.target.value, 10);
    if (newQty < 1) return;
    setUpdating(true);
    await onUpdateQty(item.id, newQty);
    setUpdating(false);
  };

  const handleRemove = async () => {
    setUpdating(true);
    await onRemove(item.id);
    setUpdating(false);
  };

  return (
    <div className="flex items-center justify-between border rounded-xl p-4 shadow-sm bg-white">
      {/* Product Info */}
      <div className="flex items-center gap-4">
        {/* Image */}
        <img
          src={item.product?.image_url || "/placeholder.png"}
          alt={item.product?.name || "Product"}
          className="w-16 h-16 object-cover rounded-md"
        />
        <div>
          <h3 className="font-medium">{item.product?.name}</h3>
          {item.product?.size && (
            <p className="text-sm text-gray-500">Size: {item.product.size}</p>
          )}
          <p className="text-sm text-gray-500">
            Price: KES {item.product?.price}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Quantity Selector */}
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQtyChange}
          disabled={updating}
          className="w-16 border rounded-lg text-center p-1"
        />

        {/* Total */}
        <span className="font-semibold">
          KES {Number(item.total_amount).toFixed(2)}
        </span>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          disabled={updating}
          className="text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
