import { useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../ui/Button';
import { formatPrice } from '../../lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function CartDrawer({ isOpen, onClose, onNavigate }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal } = useCart();

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
                      onNavigate('shop');
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
                      {items.map((item) => (
                        <div
                          key={`${item.product.id}-${item.size}-${item.color.name}`}
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
                              <div>
                                <h3 className="text-sm font-medium text-neutral-900">
                                  {item.product.name}
                                </h3>
                                <p className="mt-1 text-sm text-neutral-600">
                                  Size: {item.size} | Color: {item.color.name}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  removeItem(item.product.id, item.size, item.color.name)
                                }
                                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-2">
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
                              <p className="text-sm font-medium text-neutral-900">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
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
                        onNavigate('checkout');
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
                        onNavigate('shop');
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
