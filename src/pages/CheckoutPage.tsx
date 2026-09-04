import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Loader, AlertCircle, Truck } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { supabase } from '../lib/supabase';

// Paystack Public Key
const PAYSTACK_PUBLIC_KEY = 'pk_live_6fb4375c586d035dfa541d01357199850e6773fb';

// Supported currencies
const SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'USD'];

// Nigerian States organized by zones
const NIGERIAN_STATES = {
  LAGOS: ['Lagos'],
  ABUJA: ['FCT', 'Abuja'],
  SOUTHERN: [
    'Abia', 'Akwa Ibom', 'Anambra', 'Bayelsa', 'Cross River', 
    'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Imo', 
    'Ogun', 'Ondo', 'Osun', 'Oyo', 'Rivers'
  ],
  NORTHERN: [
    'Adamawa', 'Bauchi', 'Benue', 'Borno', 'Gombe', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Nasarawa', 'Niger', 'Plateau', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ]
};

// International shipping zones (base price per kg in NGN)
const INTERNATIONAL_ZONES = {
  'Zone 1': { countries: ['United Kingdom', 'Guernsey', 'Ireland', 'Jersey'], pricePerKg: 58000 },
  'Zone 2': { countries: ['Benin', 'Burkina Faso', 'Cameroon', 'Cape Verde', 'Central African Rep', 'Chad', 'Congo', 'Congo DPR', 'Cote D Ivoire', 'Gabon', 'Gambia', 'Ghana', 'Guinea Rep', 'Guinea-Bissau', 'Guinea-Equatorial', 'Liberia', 'Mali', 'Niger', 'Sao Tome And Principe', 'Senegal', 'Sierra Leone', 'Togo'], pricePerKg: 68700 },
  'Zone 3': { countries: ['USA', 'Canada', 'Mexico'], pricePerKg: 69900 },
  'Zone 4': { countries: ['France', 'Germany', 'Estonia', 'Belgium', 'Austria', 'Greece', 'Italy', 'Finland', 'Norway', 'Poland', 'Portugal', 'Poland', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Luxembourg', 'Malta', 'Netherlands', 'Hungary', 'Norway'], pricePerKg: 77200 },
  'Zone 5': { countries: ['South Africa', 'Algeria', 'Angola', 'Botswana', 'Burundi', 'Comoros', 'Djibouti', 'Egypt', 'Eritrea', 'Eswatini', 'Ethiopia', 'Kenya', 'Lesotho', 'Libya', 'Madagascar', 'Malawi', 'Mauritania', 'Mauritius', 'Mayotte', 'Morocco', 'Mozambique', 'Namibia'], pricePerKg: 79500 },
  'Zone 6': { countries: ['United Arab Emirates', 'Afghanistan', 'Bahrain', 'Iran', 'Iraq', 'Israel', 'Jordan', 'Kuwait', 'Lebanon', 'Oman', 'Qatar', 'Saudi Arabia', 'Syria', 'Yemen'], pricePerKg: 85300 },
  'Zone 7': { countries: ['Pakistan', 'Armenia', 'Australia', 'Azerbaijan', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'Georgia', 'Hong Kong SAR China', 'India', 'Indonesia', 'Japan', 'Kazakhstan', 'Korea Rep Of', 'Korea D.P.R Of', 'Kyrgyzstan', 'Laos', 'Macau SAR China', 'Malaysia', 'Maldives'], pricePerKg: 93500 },
  'Zone 8': { countries: ['Ecuador', 'American Samoa', 'Antigua', 'Argentina', 'Aruba', 'Bahamas', 'Barbados', 'Belize', 'Bermuda', 'Bolivia', 'Bonaire', 'Brazil', 'Cayman Islands', 'Chile', 'Colombia', 'Cook Islands', 'Costa Rica', 'Cuba', 'Curacao', 'Dominica', 'Dominican Rep'], pricePerKg: 100300 }
};

// Get all countries sorted alphabetically
const ALL_COUNTRIES = ['Nigeria', ...Object.values(INTERNATIONAL_ZONES)
  .flatMap(zone => zone.countries)
  .sort()];

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

// Calculate domestic (Nigerian) shipping fee
const calculateNigerianShipping = (state: string): number => {
  if (NIGERIAN_STATES.LAGOS.includes(state)) return 10000;
  if (NIGERIAN_STATES.ABUJA.includes(state)) return 10000;
  if (NIGERIAN_STATES.NORTHERN.includes(state)) return 12000;
  if (NIGERIAN_STATES.SOUTHERN.includes(state)) return 5000;
  return 5000; // Default
};

// Calculate international shipping fee (base 2kg package)
const calculateInternationalShipping = (country: string, weight: number = 2): number => {
  for (const zone of Object.values(INTERNATIONAL_ZONES)) {
    if (zone.countries.includes(country)) {
      return zone.pricePerKg * weight;
    }
  }
  return 0;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  const { settings } = useStoreSettings();
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [shippingFee, setShippingFee] = useState(0);

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

  // Calculate shipping fee when country or state changes
  useEffect(() => {
    if (formData.country === 'Nigeria' && formData.state) {
      const fee = calculateNigerianShipping(formData.state);
      setShippingFee(fee);
    } else if (formData.country !== 'Nigeria' && formData.country) {
      const fee = calculateInternationalShipping(formData.country);
      setShippingFee(fee);
    } else {
      setShippingFee(0);
    }
  }, [formData.country, formData.state]);

  // Store-settings-driven adjustments (admin » Settings)
  const freeShippingApplies =
    settings.free_shipping_threshold > 0 && subtotal >= settings.free_shipping_threshold;
  const locationChosen =
    formData.country === 'Nigeria' ? !!formData.state : !!formData.country;
  const effectiveShipping = freeShippingApplies ? 0 : shippingFee;
  const taxAmount = settings.enable_tax
    ? Math.round((subtotal * settings.tax_rate) / 100)
    : 0;
  const grandTotal = subtotal + effectiveShipping + taxAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset state when country changes
    if (name === 'country') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: '' // Reset state when country changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const isFormValid = () => {
    const baseValid = formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.address &&
      formData.city &&
      formData.country;
    
    // State is required for Nigeria
    if (formData.country === 'Nigeria') {
      return baseValid && formData.state;
    }
    
    return baseValid;
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
      console.log('=== CREATING/UPDATING CUSTOMER ===');
      console.log('Email:', formData.email);

      const { data: existingCustomer, error: selectError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', formData.email)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing customer:', selectError);
        throw selectError;
      }

      if (existingCustomer) {
        console.log('Updating existing customer:', existingCustomer.id);
        
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

        if (updateError) {
          console.error('Error updating customer:', updateError);
          throw updateError;
        }
        
        console.log('Customer updated successfully');
        return existingCustomer.id;
      } else {
        console.log('Creating new customer');
        
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

        if (insertError) {
          console.error('Error inserting customer:', insertError);
          throw insertError;
        }
        
        console.log('Customer created successfully:', newCustomer.id);
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
      console.log('=== SENDING EMAIL ===');
      
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

      const { data, error } = await supabase.functions.invoke('send-order-email', {
        body: emailData
      });

      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent successfully:', data);
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (reference: any): Promise<void> => {
    try {
      setProcessingOrder(true);
      setOrderError(null);

      console.log('=== PAYMENT SUCCESS ===');
      console.log('Payment reference:', reference);

      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id || 'No user logged in');

      const totalAmount = grandTotal;
      const orderNumber = generateOrderNumber();

      console.log('Order number generated:', orderNumber);
      console.log('Shipping fee:', effectiveShipping);
      console.log('Tax:', taxAmount);
      console.log('Total amount:', totalAmount);

      // Step 1: Create customer
      console.log('=== STEP 1: CREATE CUSTOMER ===');
      let customerId;
      try {
        customerId = await createOrUpdateCustomer(totalAmount);
        console.log('Customer ID:', customerId);
      } catch (customerError) {
        console.error('CUSTOMER ERROR:', customerError);
        throw new Error('Failed to create customer record');
      }

      // Step 2: Prepare order data
      console.log('=== STEP 2: PREPARE ORDER DATA ===');
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_id: customerId,
        customer_email: formData.email,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state || formData.country,
        shipping_country: formData.country,
        shipping_postal_code: formData.postalCode,
        subtotal: subtotal,
        shipping_fee: effectiveShipping,
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

      console.log('Order data prepared:', orderData);

      // Step 3: Create order
      console.log('=== STEP 3: CREATE ORDER ===');
      let order;
      try {
        const { data: orderResult, error: orderError } = await supabase
          .from('orders')
          .insert([orderData])
          .select()
          .single();

        if (orderError) {
          console.error('ORDER ERROR:', orderError);
          throw orderError;
        }

        order = orderResult;
        console.log('Order created successfully:', order.id);
      } catch (orderError) {
        console.error('Failed to create order:', orderError);
        throw new Error('Failed to create order record');
      }

      // Step 4: Send email
      console.log('=== STEP 4: SEND EMAIL ===');
      await sendOrderConfirmationEmail(orderData);

      // Step 5: Navigate to confirmation FIRST (before clearing cart)
      console.log('=== STEP 5: NAVIGATE TO CONFIRMATION ===');
      console.log('Navigating to:', `/order-confirmation/${order.id}`);
      console.log('Order number:', orderNumber);
      
      navigate(`/order-confirmation/${order.id}`, {
        state: { orderNumber: orderNumber },
        replace: true
      });

      // Step 6: Clear cart AFTER navigation with delay
      console.log('=== STEP 6: CLEAR CART ===');
      setTimeout(() => {
        clearCart();
        console.log('Cart cleared');
      }, 500);

      console.log('=== ORDER PROCESS COMPLETE ===');

    } catch (error: any) {
      console.error('=== FULL CHECKOUT ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      setOrderError(
        `Payment successful but there was an error processing your order. Please contact support with reference: ${reference?.reference || 'N/A'}`
      );
      setProcessingOrder(false);
    }
  };

  // Paystack config
  const paystackCurrency = getCurrencyForPaystack(currency.code);
  const totalAmountForPayment = grandTotal;
  const amountInKobo = convertToPaystackAmount(totalAmountForPayment);

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
    setOrderError(null);
    
    initializePayment({
      onSuccess: (reference: any) => handlePaymentSuccess(reference),
      onClose: () => {
        setLoading(false);
      }
    });
  };

  if (items.length === 0) {
    return null;
  }

  // Get available states based on selected country
  const getAvailableStates = () => {
    if (formData.country === 'Nigeria') {
      return [
        ...NIGERIAN_STATES.LAGOS,
        ...NIGERIAN_STATES.ABUJA,
        ...NIGERIAN_STATES.SOUTHERN,
        ...NIGERIAN_STATES.NORTHERN
      ].sort();
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900">Checkout</h1>
          <p className="text-neutral-600 mt-2">Complete your purchase</p>
        </div>

        {/* Processing Overlay */}
        {processingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center max-w-sm">
              <Loader className="animate-spin mx-auto mb-4 text-[#D4AF37]" size={48} />
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Processing Your Order</h3>
              <p className="text-sm text-neutral-600">Please wait while we process your payment...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {orderError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-1">Payment Error</h3>
              <p className="text-sm text-red-700">{orderError}</p>
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
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  >
                    <option value="">Select Country</option>
                    {ALL_COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.country === 'Nigeria' && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                    >
                      <option value="">Select State</option>
                      {getAvailableStates().map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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

                {/* Shipping Method Display */}
                {shippingFee > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Truck className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Shipping Method
                        </p>
                        <p className="text-sm text-green-700">
                          {formData.country === 'Nigeria' ? 
                            'Express Delivery via GIGL (1-3 business days)' : 
                            'International Express Delivery (3-7 business days)'
                          }
                        </p>
                        <p className="text-sm font-bold text-green-900 mt-2">
                          Shipping Fee:{' '}
                          {freeShippingApplies ? (
                            <>
                              <span className="line-through opacity-60">
                                {formatPrice(shippingFee)}
                              </span>{' '}
                              FREE
                            </>
                          ) : (
                            formatPrice(shippingFee)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    <div key={`${item.product.id}-${item.size}-${item.color?.name}-${index}`} className="flex gap-3">
                      <img
                        src={productImage}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-900">{item.product.name}</p>
                        <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
                        {(item.size || item.color?.name) && (
                          <p className="text-xs text-neutral-500">
                            {item.size && `Size: ${item.size}`}
                            {item.color?.name && item.size && ' • '}
                            {item.color?.name}
                          </p>
                        )}
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
                  <span
                    className={`font-semibold ${
                      effectiveShipping === 0 ? 'text-neutral-500' : 'text-neutral-900'
                    }`}
                  >
                    {freeShippingApplies
                      ? 'FREE'
                      : !locationChosen
                      ? 'Select location'
                      : formatPrice(shippingFee)}
                  </span>
                </div>
                {settings.enable_tax && settings.tax_rate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax ({settings.tax_rate}%)</span>
                    <span className="text-neutral-900">{formatPrice(taxAmount)}</span>
                  </div>
                )}
                {settings.free_shipping_threshold > 0 && !freeShippingApplies && (
                  <p className="pt-1 text-xs text-neutral-500">
                    Add {formatPrice(settings.free_shipping_threshold - subtotal)} more for free
                    shipping.
                  </p>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold py-4 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">{formatPrice(grandTotal)}</span>
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
                    Pay {formatPrice(grandTotal)}
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