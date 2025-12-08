import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../lib/supabase';
import {
  validateCheckoutForm,
  LoadingOverlay,
  ShippingAddressForm,
  PaymentMethodInfo,
  CheckoutProgress,
  handleCheckoutError
} from '../utils/checkout-improvements';

// Paystack Public Key
const PAYSTACK_PUBLIC_KEY = 'pk_live_6fb4375c586d035dfa541d01357199850e6773fb';
const SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'USD'];

const getCurrencyForPaystack = (currencyCode: string): string => {
  return SUPPORTED_CURRENCIES.includes(currencyCode) ? currencyCode : 'USD';
};

const convertToPaystackAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { formatPrice, currency } = useCurrency();
  
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [orderError, setOrderError] = useState<string | null>(null);

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
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const getProductImage = (product: any): string => {
    if (product.main_image) return product.main_image;
    if (product.image) return product.image;
    if (product.image_url) return product.image_url;
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder.jpg';
  };

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

  const handlePaymentSuccess = async (reference: any): Promise<void> => {
    try {
      setProcessingOrder(true);
      setOrderError(null);

      const { data: { user } } = await supabase.auth.getUser();

      const shippingFee = 0;
      const totalAmount = subtotal + shippingFee;
      const orderNumber = generateOrderNumber();

      const customerId = await createOrUpdateCustomer(totalAmount);

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

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      await sendOrderConfirmationEmail(orderData);
      
      clearCart();

      navigate(`/order-confirmation/${order.id}`, {
        state: { orderNumber: orderNumber }
      });

    } catch (error) {
      const errorMessage = handleCheckoutError(error, reference.reference);
      setOrderError(errorMessage);
      setProcessingOrder(false);
    }
  };

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
    // Validate form
    const validation = validateCheckoutForm(formData);
    
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900">Checkout</h1>
          <p className="text-neutral-600 mt-2">Complete your purchase</p>
        </div>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={2} />

        {/* Loading Overlay */}
        {processingOrder && (
          <LoadingOverlay message="Processing Your Order" />
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
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Information
              </h2>
              
              <ShippingAddressForm 
                formData={formData}
                onChange={handleInputChange}
                errors={formErrors}
              />
            </div>

            {/* Payment Method */}
            <PaymentMethodInfo />
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
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold py-4 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">{formatPrice(subtotal)}</span>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePaymentClick}
                disabled={loading || processingOrder}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                  loading || processingOrder
                    ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-lg'
                }`}
              >
                {loading || processingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Pay {formatPrice(subtotal)}
                  </>
                )}
              </button>

              {/* Trust Indicators */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure 256-bit SSL encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>PCI DSS compliant payments</span>
                </div>
              </div>

              <p className="text-xs text-neutral-500 text-center mt-4">
                By placing your order, you agree to our{' '}
                <a href="/terms" className="text-[#D4AF37] hover:underline">Terms & Conditions</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}