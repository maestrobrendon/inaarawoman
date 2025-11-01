import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Ruler } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import Button from '../ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
          <div className="pointer-events-auto w-screen max-w-md">
            <div className="flex h-full flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                <h2 className="text-lg font-serif font-semibold text-neutral-900">
                  Shopping Cart ({items.length})
                </h2>
                <button
                  onClick={onClose}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                  <ShoppingBag size={64} className="text-neutral-300 mb-4" />
                  <p className="text-lg font-medium text-neutral-900 mb-2">Your cart is empty</p>
                  <p className="text-sm text-neutral-600 text-center mb-6">
                    Add some beautiful pieces to get started
                  </p>
                  <Button
                    onClick={() => {
                      navigate('/shop');
                      onClose();
                    }}
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-6">
                      {items.map((item, index) => {
                        const itemPrice = item.product.sale_price || item.product.price;
                        
                        return (
                          <div
                            key={`${item.product.id}-${item.size}-${item.color.name}-${index}`}
                            className="flex gap-4"
                          >
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-sm border border-neutral-200">
                              <img
                                src={item.image}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>

                            <div className="flex flex-1 flex-col">
                              <div className="flex justify-between">
                                <div className="flex-1">
                                  <h3 className="text-sm font-medium text-neutral-900">
                                    {item.product.name}
                                  </h3>
                                  
                                  {/* Size and Color */}
                                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                                    <p className="text-sm text-neutral-600">
                                      Size: {item.size}
                                    </p>
                                    {item.size === 'Custom' && item.customMeasurements && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-semibold rounded-full uppercase tracking-wider">
                                        <Ruler size={10} />
                                        Custom
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-sm text-neutral-600">
                                    Color: {item.color.name}
                                  </p>

                                  {/* Custom Measurements Display */}
                                  {item.customMeasurements && (
                                    <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-sm p-2">
                                      <p className="text-[10px] font-semibold text-neutral-900 uppercase tracking-wider mb-1">
                                        Custom Measurements
                                      </p>
                                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-neutral-600">
                                        <div>Bust: {item.customMeasurements.bust}"</div>
                                        <div>Waist: {item.customMeasurements.waist}"</div>
                                        <div>Hips: {item.customMeasurements.hips}"</div>
                                        <div>Length: {item.customMeasurements.length}"</div>
                                        {item.customMeasurements.height && (
                                          <div className="col-span-2">Height: {item.customMeasurements.height}"</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() =>
                                    removeItem(item.product.id, item.size, item.color.name)
                                  }
                                  className="text-neutral-400 hover:text-neutral-600 transition-colors ml-2"
                                >
                                  <X size={16} />
                                </button>
                              </div>

                              <div className="flex items-center justify-between mt-3">
                                {/* Quantity Controls - Disabled for Custom Sizes */}
                                {item.size === 'Custom' ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-neutral-100 text-sm text-neutral-600 rounded">
                                      Qty: {item.quantity}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.size,
                                          item.color.name,
                                          item.quantity - 1
                                        )
                                      }
                                      className="p-1 border border-neutral-300 rounded hover:bg-neutral-100 transition-colors"
                                    >
                                      <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product.id,
                                          item.size,
                                          item.color.name,
                                          item.quantity + 1
                                        )
                                      }
                                      className="p-1 border border-neutral-300 rounded hover:bg-neutral-100 transition-colors"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                )}
                                
                                <div className="text-right">
                                  {item.product.sale_price && (
                                    <p className="text-[10px] text-neutral-400 line-through">
                                      {formatPrice(item.product.price * item.quantity)}
                                    </p>
                                  )}
                                  <p className={`text-sm font-medium ${item.product.sale_price ? 'text-red-600' : 'text-neutral-900'}`}>
                                    {formatPrice(itemPrice * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="border-t border-neutral-200 px-6 py-6">
                    <div className="flex justify-between text-base font-medium text-neutral-900 mb-4">
                      <p>Subtotal</p>
                      <p>{formatPrice(subtotal)}</p>
                    </div>
                    <p className="text-sm text-neutral-600 mb-6">
                      Shipping and taxes calculated at checkout.
                    </p>
                    <Button
                      fullWidth
                      onClick={() => {
                        navigate('/checkout');
                        onClose();
                      }}
                    >
                      Proceed to Checkout
                    </Button>
                    <Button
                      fullWidth
                      variant="ghost"
                      className="mt-3"
                      onClick={() => {
                        navigate('/shop');
                        onClose();
                      }}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}