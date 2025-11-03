import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Ruler } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import { Address } from '../types';
import { generateOrderNumber, calculateShipping, calculateTax } from '../lib/utils';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

/* ---------- Paystack type guard ---------- */
declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

/* ---------- Load Paystack script ---------- */
const loadPaystackScript = () =>
  new Promise<boolean>((resolve) => {
    if (document.getElementById('paystack-script')) return resolve(true);
    const s = document.createElement('script');
    s.id = 'paystack-script';
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();

  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [orderNumber, setOrderNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'NG',
    phone: '',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const shipping = calculateShipping(subtotal, shippingAddress.country);
  const tax = calculateTax(subtotal, shippingAddress.country);
  const total = subtotal + shipping + tax;

  const countries = [
    { value: 'NG', label: 'Nigeria' },
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'EU', label: 'European Union' },
  ];

  /* ---------- Load Paystack on mount ---------- */
  useEffect(() => {
    loadPaystackScript().then(setPaystackLoaded);
  }, []);

  /* ---------- Shipping form ---------- */
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  /* ---------- Paystack payment ---------- */
  const handlePayWithPaystack = async () => {
    if (!paystackLoaded || !window.PaystackPop) {
      alert('Paystack not loaded. Try again.');
      return;
    }

    setIsProcessing(true);
    const orderNum = generateOrderNumber();
    const email = shippingAddress.phone.includes('@')
      ? shippingAddress.phone
      : `${shippingAddress.phone}@temp.com`;
    const amountKobo = Math.round(total * 100);

    const handler = window.PaystackPop.setup({
      key: 'pk_live_6fb4375c586d035dfa541d01357199850e6773fb',
      email,
      amount: amountKobo,
      currency: currency.code,
      ref: orderNum,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          },
          { display_name: 'Phone', variable_name: 'phone', value: shippingAddress.phone },
        ],
      },
      callback: async (response: { reference: string }) => {
        try {
          const res = await fetch('/api/verify-paystack', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference: response.reference }),
          });
          const data = await res.json();

          if (data.success && data.data.status === 'success') {
            await saveOrderToSupabase(orderNum, data.data);
          } else {
            throw new Error('Verification failed');
          }
        } catch (err) {
          console.error(err);
          alert('Payment failed. Contact support.');
          setIsProcessing(false);
        }
      },
      onClose: () => {
        setIsProcessing(false);
        alert('Payment cancelled.');
      },
    });

    handler.openIframe();
  };

  /* ---------- Save order after successful payment ---------- */
  const saveOrderToSupabase = async (orderNum: string, paymentData: any) => {
    const orderItems = items.map((item) => ({
      product_id: item.product.id,
      name: item.product.name,
      image_url: item.image,
      price: item.product.sale_price || item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color.name,
      sku: item.product.sku || '',
      custom_measurements: item.customMeasurements || null,
    }));

    const { error } = await supabase.from('orders').insert({
      order_number: orderNum,
      customer_email: shippingAddress.phone.includes('@') ? shippingAddress.phone : null,
      customer_phone: shippingAddress.phone,
      customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      items: orderItems,
      subtotal,
      shipping_cost: shipping,
      tax,
      total,
      currency: currency.code,
      payment_method: 'paystack',
      payment_status: 'paid',
      payment_reference: paymentData.reference,
      shipping_method: shippingMethod,
      order_status: 'processing',
    });

    if (error) {
      console.error(error);
      alert('Failed to save order. Contact support.');
      return;
    }

    setOrderNumber(orderNum);
    clearCart();
    setStep('success');
    setIsProcessing(false);
  };

  /* ---------- Empty cart view ---------- */
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  /* ---------- Success view ---------- */
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="max-w-md mx-auto px-4 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h1 className="font-serif text-3xl font-bold text-neutral-900 mb-4">Order Confirmed!</h1>
          <p className="text-neutral-700 mb-2">Your order number is:</p>
          <p className="text-2xl font-mono font-semibold text-neutral-900 mb-6">{orderNumber}</p>
          <p className="text-sm text-neutral-600 mb-8">Confirmation sent to your phone/email.</p>
          <div className="space-y-3">
            <Button fullWidth onClick={() => navigate('/shop')}>
              Continue Shopping
            </Button>
            <Button fullWidth variant="outline" onClick={() => navigate('/')}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Main checkout UI ---------- */
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold text-neutral-900 mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center ${step === 'shipping' ? 'text-neutral-900' : 'text-green-600'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'shipping' ? 'bg-neutral-900 text-white' : 'bg-green-600 text-white'
              }`}
            >
              {step === 'shipping' ? '1' : 'Check'}
            </div>
            <span className="ml-2 font-medium">Shipping</span>
          </div>
          <div className={`flex-1 h-0.5 mx-4 ${step === 'payment' ? 'bg-neutral-900' : 'bg-neutral-300'}`} />
          <div className={`flex items-center ${step === 'payment' ? 'text-neutral-900' : 'text-neutral-400'}`}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'payment' ? 'bg-neutral-900 text-white' : 'bg-neutral-300'
              }`}
            >
              2
            </div>
            <span className="ml-2 font-medium">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <div className="lg:col-span-2">
            {/* ---------- Shipping Step ---------- */}
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
                    label="Phone Number"
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    required
                    className="mt-4"
                    placeholder="e.g. 08012345678"
                  />
                </div>

                {/* Shipping Method */}
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

            {/* ---------- Payment Step ---------- */}
            {step === 'payment' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Payment Method</h2>
                  <div className="p-4 border rounded-sm bg-green-50 border-green-200">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 bg-cover rounded"
                        style={{ backgroundImage: 'ur[](https://paystack.com/assets/img/logo.png)' }}
                      />
                      <div>
                        <p className="font-medium text-neutral-900">Pay with Paystack</p>
                        <p className="text-sm text-neutral-600">Card, Bank Transfer, USSD, Apple Pay</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setStep('shipping')} fullWidth>
                    Back
                  </Button>
                  <Button
                    onClick={handlePayWithPaystack}
                    fullWidth
                    disabled={isProcessing || !paystackLoaded}
                    className="bg-[#00C1A1] text-white hover:bg-[#00a88a]"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ---------- Order Summary ---------- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-neutral-50 rounded-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {items.map((item, index) => {
                  const itemPrice = item.product.sale_price || item.product.price;

                  return (
                    <div
                      key={`${item.product.id}-${item.size}-${item.color.name}-${index}`}
                      className="border-b border-neutral-200 pb-4 last:border-0"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-sm"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900">{item.product.name}</p>

                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-neutral-600">
                              {item.size} | {item.color.name} | Qty: {item.quantity}
                            </p>
                            {item.size === 'Custom' && item.customMeasurements && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-semibold rounded uppercase tracking-wider">
                                <Ruler size={8} /> Custom
                              </span>
                            )}
                          </div>

                          {/* Custom measurements */}
                          {item.customMeasurements && (
                            <div className="mt-2 bg-white border border-neutral-200 rounded p-2">
                              <p className="text-[9px] font-semibold text-neutral-900 uppercase tracking-wider mb-1">
                                Custom Measurements
                              </p>
                              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-neutral-600">
                                <div>Bust: {item.customMeasurements.bust}"</div>
                                <div>Waist: {item.customMeasurements.waist}"</div>
                                <div>Hips: {item.customMeasurements.hips}"</div>
                                <div>Length: {item.customMeasurements.length}"</div>
                                {item.customMeasurements.height && (
                                  <div className="col-span-2">
                                    Height: {item.customMeasurements.height}"
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Price */}
                          <div className="mt-2">
                            {item.product.sale_price && (
                              <p className="text-[10px] text-neutral-400 line-through">
                                {formatPrice(item.product.price * item.quantity)}
                              </p>
                            )}
                            <p
                              className={`text-sm font-semibold ${
                                item.product.sale_price ? 'text-red-600' : 'text-neutral-900'
                              }`}
                            >
                              {formatPrice(itemPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="space-y-2 py-4 border-t border-neutral-200">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
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