import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, MapPin, CreditCard, Loader } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';

// Paystack Public Key
const PAYSTACK_PUBLIC_KEY = 'pk_live_6fb4375c586d035dfa541d01357199850e6773fb';

// Supported currencies
const SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'USD'];

// Get currency for Paystack
const getCurrencyForPaystack = (currencyCode: string): string => {
  if (SUPPORTED_CURRENCIES.includes(currencyCode)) {
    return currencyCode;
  }
  return 'USD';
};

// Convert to smallest unit (kobo/cents)
const convertToPaystackAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

// Generate order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const { formatPrice, currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    postalCode: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/shop');
    }
  }, [items, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.address &&
      formData.city &&
      formData.state &&
      formData.country
    );
  };

  // Helper function to get product image
  const getProductImage = (product: any): string => {
    if (product.main_image) return product.main_image;
    if (product.image) return product.image;
    if (product.image_url) return product.image_url;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder.jpg';
  };

  // Create or update customer
  const createOrUpdateCustomer = async (orderTotal: number): Promise<string> => {
    try {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (existingCustomer) {
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postalCode,
            total_orders: existingCustomer.total_orders + 1,
            total_spent: existingCustomer.total_spent + orderTotal,
            currency: currency.code,
            updated_at: new Date().toISOString()
          })
          .eq('email', formData.email);

        if (updateError) throw updateError;
        return existingCustomer.id;
      } else {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([{
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postal_code: formData.postalCode,
            total_orders: 1,
            total_spent: orderTotal,
            currency: currency.code
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        return newCustomer.id;
      }
    } catch (error) {
      console.error('Error managing customer:', error);
      throw error;
    }
  };

  // Send order confirmation email
  const sendOrderConfirmationEmail = async (orderData: any): Promise<void> => {
    try {
      const emailData = {
        to: formData.email,
        subject: `Order Confirmation - ${orderData.order_number}`,
        data: {
          customerName: `${formData.firstName} ${formData.lastName}`,
          orderNumber: orderData.order_number,
          orderDate: new Date().toLocaleDateString(),
          items: orderData.items,
          subtotal: orderData.subtotal,
          shippingFee: orderData.shipping_fee,
          total: orderData.total_amount,
          currency: orderData.currency,
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postalCode: formData.postalCode
          },
          paymentReference: orderData.payment_reference
        }
      };

      await supabase.functions.invoke('send-order-email', {
        body: emailData
      });
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (reference: any): Promise<void> => {
    try {
      setProcessingOrder(true);

      const { data: { user } } = await supabase.auth.getUser();

      const shippingFee = 0;
      const totalAmount = subtotal + shippingFee;
      const orderNumber = generateOrderNumber();

      // Create customer
      const customerId = await createOrUpdateCustomer(totalAmount);

      // Prepare order data
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_id: customerId,
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_country: formData.country,
        shipping_postal_code: formData.postalCode,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        currency: currency.code,
        payment_method: 'paystack',
        payment_status: 'paid',
        payment_reference: reference.reference,
        order_status: 'pending',
        items: items.map((item: any) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_slug: item.product.slug,
          quantity: item.quantity,
          price: item.product.sale_price || item.product.price,
          variant: null,
          image: getProductImage(item.product)
        }))
      };

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Send email
      await sendOrderConfirmationEmail(orderData);

      // Navigate to confirmation
      navigate(`/order-confirmation/${order.id}`, {
        state: { orderNumber: orderNumber }
      });

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Payment successful but there was an error processing your order. Please contact support with reference: ' + reference.reference);
    } finally {
      setProcessingOrder(false);
    }
  };

  // Paystack config
  const paystackCurrency = getCurrencyForPaystack(currency.code);
  const amountInKobo = convertToPaystackAmount(subtotal);

  const config = {
    reference: `INW-${new Date().getTime()}`,
    email: formData.email,
    amount: amountInKobo,
    currency: paystackCurrency,
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: `${formData.firstName} ${formData.lastName}`
        },
        {
          display_name: 'Phone Number',
          variable_name: 'phone_number',
          value: formData.phone
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config);

  const handlePaymentClick = () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    initializePayment(
      (reference: any) => handlePaymentSuccess(reference),
      () => {
        setLoading(false);
        alert('Payment cancelled');
      }
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900">Checkout</h1>
          <p className="text-neutral-600 mt-2">Complete your purchase</p>
        </div>

        {processingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-sm">
              <Loader className="animate-spin mx-auto mb-4 text-[#D4AF37]" size={48} />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Processing Your Order</h3>
              <p className="text-sm text-neutral-600">Please wait while we process your payment...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Shipping Information
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="john.doe@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="+234 800 000 0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Lagos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="Lagos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="Nigeria">Nigeria</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Kenya">Kenya</option>
                      <option value="South Africa">South Africa</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                      placeholder="100001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                Payment Method
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Secure Payment with Paystack</strong>
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Your payment information is encrypted and secure. We accept all major cards and payment methods.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item: any, index: number) => {
                  const productImage = getProductImage(item.product);
                  const itemPrice = item.product.sale_price || item.product.price;
                  
                  return (
                    <div key={`${item.product.id}-${item.size}-${item.color.name}-${index}`} className="flex gap-3">
                      <img
                        src={productImage}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{item.product.name}</p>
                        <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                        <p className="text-xs text-neutral-500">
                          {item.size && `Size: ${item.size}`}
                          {item.color && item.color.name && ` • ${item.color.name}`}
                        </p>
                        <p className="text-sm font-semibold text-neutral-900 mt-1">
                          {formatPrice(itemPrice * item.quantity)}
                        </p>
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
                  <span className="text-green-600">FREE</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold py-4 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">{formatPrice(subtotal)}</span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePaymentClick}
                disabled={!isFormValid() || loading || processingOrder}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                  isFormValid() && !loading && !processingOrder
                    ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {loading || processingOrder ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Pay {formatPrice(subtotal)}
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center mt-4">
                By placing your order, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}