import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Address } from '../types';
import { formatPrice, generateOrderNumber, calculateShipping, calculateTax } from '../lib/utils';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
}

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: ''
  });

  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  const shipping = calculateShipping(subtotal, shippingAddress.country);
  const tax = calculateTax(subtotal, shippingAddress.country);
  const total = subtotal + shipping + tax;

  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'EU', label: 'European Union' }
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderNum = generateOrderNumber();

      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        name: item.product.name,
        image_url: item.image,
        price: item.product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color.name,
        sku: item.product.sku || ''
      }));

      const { error } = await supabase.from('orders').insert({
        order_number: orderNum,
        customer_email: shippingAddress.phone,
        customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        shipping_address: shippingAddress,
        billing_address: sameAsShipping ? shippingAddress : billingAddress,
        items: orderItems,
        subtotal,
        shipping_cost: shipping,
        tax,
        total,
        currency: 'USD',
        payment_method: paymentMethod,
        payment_status: 'paid',
        shipping_method: shippingMethod,
        order_status: 'processing'
      });

      if (error) throw error;

      setOrderNumber(orderNum);
      clearCart();
      setStep('success');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Your cart is empty</p>
          <Button onClick={() => onNavigate('shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h1 className="font-serif text-3xl font-bold text-neutral-900 mb-4">
            Order Confirmed!
          </h1>
          <p className="text-neutral-700 mb-2">
            Thank you for your purchase. Your order number is:
          </p>
          <p className="text-2xl font-mono font-semibold text-neutral-900 mb-6">
            {orderNumber}
          </p>
          <p className="text-sm text-neutral-600 mb-8">
            We've sent a confirmation email with your order details and tracking information.
          </p>
          <div className="space-y-3">
            <Button fullWidth onClick={() => onNavigate('shop')}>
              Continue Shopping
            </Button>
            <Button fullWidth variant="outline" onClick={() => onNavigate('home')}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>

        <div className="flex items-center mb-8">
          <div className={`flex items-center ${step === 'shipping' ? 'text-neutral-900' : 'text-green-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'shipping' ? 'bg-neutral-900 text-white' : 'bg-green-600 text-white'
            }`}>
              {step === 'shipping' ? '1' : '✓'}
            </div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${step === 'payment' ? 'bg-neutral-900' : 'bg-neutral-300'}`} />
          <div className={`flex items-center ${step === 'payment' ? 'text-neutral-900' : 'text-neutral-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'payment' ? 'bg-neutral-900 text-white' : 'bg-neutral-300'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Shipping Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={shippingAddress.first_name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
                      required
                    />
                    <Input
                      label="Last Name"
                      value={shippingAddress.last_name}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Address Line 1"
                    value={shippingAddress.address_line1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line1: e.target.value })}
                    required
                    className="mt-4"
                  />
                  <Input
                    label="Address Line 2 (Optional)"
                    value={shippingAddress.address_line2}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line2: e.target.value })}
                    className="mt-4"
                  />
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input
                      label="City"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      required
                    />
                    <Input
                      label="State/Province"
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input
                      label="Postal Code"
                      value={shippingAddress.postal_code}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postal_code: e.target.value })}
                      required
                    />
                    <Select
                      label="Country"
                      options={countries}
                      value={shippingAddress.country}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Phone"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    required
                    className="mt-4"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">Shipping Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-4 border rounded-sm cursor-pointer hover:bg-neutral-50">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value as any)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">Standard Shipping</p>
                        <p className="text-sm text-neutral-600">5-7 business days</p>
                      </div>
                      <p className="font-semibold text-neutral-900">
                        {subtotal >= 150 ? 'FREE' : formatPrice(10)}
                      </p>
                    </label>
                    <label className="flex items-center p-4 border rounded-sm cursor-pointer hover:bg-neutral-50">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        checked={shippingMethod === 'express'}
                        onChange={(e) => setShippingMethod(e.target.value as any)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">Express Shipping</p>
                        <p className="text-sm text-neutral-600">2-3 business days</p>
                      </div>
                      <p className="font-semibold text-neutral-900">{formatPrice(25)}</p>
                    </label>
                  </div>
                </div>

                <Button type="submit" fullWidth>
                  Continue to Payment
                </Button>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Payment Method</h2>
                  <div className="space-y-2">
                    {['credit_card', 'paypal', 'apple_pay', 'google_pay'].map((method) => (
                      <label
                        key={method}
                        className="flex items-center p-4 border rounded-sm cursor-pointer hover:bg-neutral-50"
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-3"
                        />
                        <p className="font-medium text-neutral-900 capitalize">
                          {method.replace('_', ' ')}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'credit_card' && (
                  <div>
                    <Input label="Card Number" type="text" placeholder="1234 5678 9012 3456" required />
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input label="Expiry Date" type="text" placeholder="MM/YY" required />
                      <Input label="CVV" type="text" placeholder="123" required />
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep('shipping')} fullWidth>
                    Back
                  </Button>
                  <Button type="submit" fullWidth disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-neutral-50 rounded-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color.name}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-sm"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900">{item.product.name}</p>
                      <p className="text-xs text-neutral-600">
                        {item.size} | {item.color.name} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-neutral-900 mt-1">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 py-4 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900">
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span className="text-neutral-900">{formatPrice(tax)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold pt-4 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
