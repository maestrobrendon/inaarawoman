import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Ruler } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import { Address } from '../types';
import { calculateShipping, calculateTax } from '../lib/utils';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PaystackPayment from '../components/payment/PaystackPayment';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, convertPrice } = useCurrency();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<any>({});

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

  const [email, setEmail] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  const shipping = calculateShipping(subtotal, shippingAddress.country);
  const tax = calculateTax(subtotal, shippingAddress.country);
  const convertedSubtotal = convertPrice(subtotal);
  const convertedShipping = convertPrice(shipping);
  const convertedTax = convertPrice(tax);
  const total = convertedSubtotal + convertedShipping + convertedTax;

  const countries = [
    { value: 'NG', label: 'Nigeria' },
    { value: 'GH', label: 'Ghana' },
    { value: 'ZA', label: 'South Africa' },
    { value: 'KE', label: 'Kenya' },
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'CA', label: 'Canada' },
  ];

  useEffect(() => {
    // Load user data if logged in
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');

        // Try to load saved address from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setShippingAddress({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            address_line1: profile.address || '',
            address_line2: '',
            city: profile.city || '',
            state: profile.state || '',
            postal_code: profile.postal_code || '',
            country: profile.country || 'NG',
            phone: profile.phone || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateShippingForm = () => {
    const newErrors: any = {};

    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    if (!shippingAddress.first_name) newErrors.first_name = 'First name is required';
    if (!shippingAddress.last_name) newErrors.last_name = 'Last name is required';
    if (!shippingAddress.phone) newErrors.phone = 'Phone number is required';
    if (!shippingAddress.address_line1) newErrors.address_line1 = 'Address is required';
    if (!shippingAddress.city) newErrors.city = 'City is required';
    if (!shippingAddress.state) newErrors.state = 'State is required';
    if (!shippingAddress.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev: any) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setStep('payment');
    }
  };

  /* ---------- Empty cart view ---------- */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg text-neutral-600 mb-4">Your cart is empty</p>
          <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  /* ---------- Main checkout UI ---------- */
  return (
    <div className="min-h-screen py-12 bg-neutral-50">
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
              {step === 'shipping' ? '1' : '✓'}
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">Contact Information</h2>

                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors((prev: any) => ({ ...prev, email: '' }));
                        }
                      }}
                      error={errors.email}
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900 mb-4">Shipping Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="First Name"
                        value={shippingAddress.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        error={errors.first_name}
                        required
                      />
                      <Input
                        label="Last Name"
                        value={shippingAddress.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        error={errors.last_name}
                        required
                      />
                    </div>

                    <Input
                      label="Phone Number"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      error={errors.phone}
                      required
                      className="mt-4"
                      placeholder="e.g. +234 800 000 0000"
                    />

                    <Input
                      label="Address Line 1"
                      value={shippingAddress.address_line1}
                      onChange={(e) => handleInputChange('address_line1', e.target.value)}
                      error={errors.address_line1}
                      required
                      className="mt-4"
                      placeholder="Street address"
                    />
                    
                    <Input
                      label="Address Line 2 (Optional)"
                      value={shippingAddress.address_line2}
                      onChange={(e) => handleInputChange('address_line2', e.target.value)}
                      className="mt-4"
                      placeholder="Apartment, suite, etc."
                    />

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input
                        label="City"
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        error={errors.city}
                        required
                      />
                      <Input
                        label="State/Province"
                        value={shippingAddress.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        error={errors.state}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <Input
                        label="Postal Code"
                        value={shippingAddress.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        placeholder="Optional"
                      />
                      <Select
                        label="Country"
                        options={countries}
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        error={errors.country}
                        required
                      />
                    </div>
                  </div>

                  {/* Shipping Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-3">Shipping Method</h3>
                    <div className="space-y-2">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
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
                          {subtotal >= 150 ? 'FREE' : formatPrice(convertedShipping)}
                        </p>
                      </label>

                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-neutral-50 transition-colors">
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
                        <p className="font-semibold text-neutral-900">{formatPrice(convertPrice(25))}</p>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" fullWidth>
                    Continue to Payment
                  </Button>
                </form>
              </div>
            )}

            {/* ---------- Payment Step ---------- */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-4">Payment Method</h2>
                  <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
                        <img 
                          src="https://paystack.com/assets/img/logo.svg" 
                          alt="Paystack"
                          className="w-8 h-8"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">Pay with Paystack</p>
                        <p className="text-sm text-neutral-600">Card, Bank Transfer, USSD, Apple Pay</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Review */}
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h3 className="font-medium text-neutral-900 mb-2">Order Details</h3>
                  <div className="text-sm space-y-1 text-neutral-600">
                    <p><span className="font-medium">Email:</span> {email}</p>
                    <p><span className="font-medium">Name:</span> {shippingAddress.first_name} {shippingAddress.last_name}</p>
                    <p><span className="font-medium">Phone:</span> {shippingAddress.phone}</p>
                    <p><span className="font-medium">Address:</span> {shippingAddress.address_line1}, {shippingAddress.city}, {shippingAddress.state}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep('shipping')} 
                    fullWidth
                    disabled={isProcessing}
                  >
                    Back
                  </Button>
                  
                  <PaystackPayment
                    amount={total}
                    email={email}
                    firstName={shippingAddress.first_name}
                    lastName={shippingAddress.last_name}
                    phone={shippingAddress.phone}
                    shippingAddress={{
                      address: shippingAddress.address_line1,
                      city: shippingAddress.city,
                      state: shippingAddress.state,
                      country: shippingAddress.country,
                      postalCode: shippingAddress.postal_code
                    }}
                    onSuccess={() => {
                      clearCart();
                      setIsProcessing(false);
                    }}
                    onClose={() => {
                      setIsProcessing(false);
                    }}
                  >
                    <button
                      className="flex-1 px-6 py-3 bg-[#00C1A1] text-white font-medium rounded-lg hover:bg-[#00a88a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isProcessing}
                      onClick={() => setIsProcessing(true)}
                    >
                      {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                    </button>
                  </PaystackPayment>
                </div>

                <p className="text-xs text-center text-neutral-500">
                  Your payment information is secure and encrypted
                </p>
              </div>
            )}
          </div>

          {/* ---------- Order Summary ---------- */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
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
                          className="w-16 h-16 object-cover rounded-lg"
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
                            <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded p-2">
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
                                {formatPrice(convertPrice(item.product.price * item.quantity))}
                              </p>
                            )}
                            <p
                              className={`text-sm font-semibold ${
                                item.product.sale_price ? 'text-red-600' : 'text-neutral-900'
                              }`}
                            >
                              {formatPrice(convertPrice(itemPrice * item.quantity))}
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
                  <span className="text-neutral-900">{formatPrice(convertedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900">
                    {convertedShipping === 0 ? 'FREE' : formatPrice(convertedShipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Tax</span>
                  <span className="text-neutral-900">{formatPrice(convertedTax)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-semibold pt-4 border-t-2 border-neutral-200">
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