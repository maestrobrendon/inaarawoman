import { usePaystackPayment } from 'react-paystack';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../context/ToastContext';

// Paystack Configuration
const PAYSTACK_PUBLIC_KEY = 'pk_live_6fb4375c586d035dfa541d01357199850e6773fb';

// Paystack supports these currencies
const SUPPORTED_PAYSTACK_CURRENCIES = ['NGN', 'GHS', 'ZAR', 'USD'];

// Get currency that Paystack supports
const getCurrencyForPaystack = (currencyCode: string): string => {
  if (SUPPORTED_PAYSTACK_CURRENCIES.includes(currencyCode)) {
    return currencyCode;
  }
  // Default to USD if currency not supported by Paystack
  return 'USD';
};

// Convert amount to smallest unit (kobo for NGN, cents for USD, etc.)
const convertToPaystackAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

// Generate unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

interface PaystackPaymentProps {
  amount: number; // Amount in the selected currency
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  onSuccess?: () => void;
  onClose?: () => void;
  children: React.ReactNode;
}

interface CartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    main_image?: string;
    featured_image?: string;
  };
  quantity: number;
  variant?: any;
}

interface PaystackReference {
  reference: string;
  status: string;
  message: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export default function PaystackPayment({
  amount,
  email,
  firstName,
  lastName,
  phone,
  shippingAddress,
  onSuccess,
  onClose,
  children
}: PaystackPaymentProps) {
  const navigate = useNavigate();
  const { currency } = useCurrency();
  const { items, clearCart } = useCart();
  const { showToast } = useToast();

  // Get the currency code that Paystack supports
  const paystackCurrency = getCurrencyForPaystack(currency.code);
  
  // Convert amount to smallest unit (kobo/cents)
  const amountInKobo = convertToPaystackAmount(amount);

  const config = {
    reference: `INW-${new Date().getTime()}`,
    email: email,
    amount: amountInKobo,
    currency: paystackCurrency,
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          display_name: 'Customer Name',
          variable_name: 'customer_name',
          value: `${firstName} ${lastName}`
        },
        {
          display_name: 'Phone Number',
          variable_name: 'phone_number',
          value: phone
        }
      ]
    }
  };

  // Create or update customer record
  const createOrUpdateCustomer = async (orderTotal: number): Promise<string> => {
    try {
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .single();

      if (existingCustomer) {
        // Update existing customer
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            country: shippingAddress.country,
            postal_code: shippingAddress.postalCode,
            total_orders: existingCustomer.total_orders + 1,
            total_spent: existingCustomer.total_spent + orderTotal,
            currency: currency.code,
            updated_at: new Date().toISOString()
          })
          .eq('email', email);

        if (updateError) throw updateError;
        return existingCustomer.id;
      } else {
        // Create new customer
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert([{
            email: email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            country: shippingAddress.country,
            postal_code: shippingAddress.postalCode,
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
        to: email,
        subject: `Order Confirmation - ${orderData.order_number}`,
        template: 'order-confirmation',
        data: {
          customerName: `${firstName} ${lastName}`,
          orderNumber: orderData.order_number,
          orderDate: new Date().toLocaleDateString(),
          items: orderData.items,
          subtotal: orderData.subtotal,
          shippingFee: orderData.shipping_fee,
          total: orderData.total_amount,
          currency: orderData.currency,
          shippingAddress: {
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state,
            country: shippingAddress.country,
            postalCode: shippingAddress.postalCode
          },
          paymentReference: orderData.payment_reference
        }
      };

      // Using Supabase Edge Function
      const { error } = await supabase.functions.invoke('send-order-email', {
        body: emailData
      });

      if (error) {
        console.error('Error sending email:', error);
        // Don't throw error - email failure shouldn't stop order creation
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Log but don't throw - email is not critical
    }
  };

  const handlePaystackSuccess = async (reference: PaystackReference): Promise<void> => {
    try {
      showToast('Payment successful! Processing your order...', 'success');

      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // Calculate totals
      const subtotal = amount;
      const shippingFee = 0; // You can add shipping calculation logic here
      const totalAmount = subtotal + shippingFee;

      // Generate unique order number
      const orderNumber = generateOrderNumber();

      // Step 1: Create or update customer record
      const customerId = await createOrUpdateCustomer(totalAmount);

      // Step 2: Prepare order data
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_id: customerId,
        customer_email: email,
        customer_name: `${firstName} ${lastName}`,
        customer_phone: phone,
        shipping_address: shippingAddress.address,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_country: shippingAddress.country,
        shipping_postal_code: shippingAddress.postalCode,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        currency: currency.code,
        payment_method: 'paystack',
        payment_status: 'paid',
        payment_reference: reference.reference,
        order_status: 'pending',
        items: (items as CartItem[]).map((item: CartItem) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_slug: item.product.slug,
          quantity: item.quantity,
          price: item.product.price,
          variant: item.variant || null,
          image: item.product.main_image || item.product.featured_image
        }))
      };

      // Step 3: Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 4: Send confirmation email to customer
      await sendOrderConfirmationEmail(orderData);

      // Step 5: Clear cart after successful order
      clearCart();

      // Step 6: Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Step 7: Show success message and redirect
      showToast('Order placed successfully! Check your email for confirmation.', 'success');
      
      // Redirect to order confirmation page
      navigate(`/order-confirmation/${order.id}`, {
        state: { orderNumber: orderNumber }
      });

    } catch (error) {
      console.error('Error creating order:', error);
      showToast('Payment successful but there was an error processing your order. Please contact support with reference: ' + reference.reference, 'error');
    }
  };

  const handlePaystackClose = (): void => {
    showToast('Payment cancelled', 'error');
    if (onClose) {
      onClose();
    }
  };

  const initializePayment = usePaystackPayment(config);

  const handleClick = (): void => {
    initializePayment(
      (reference: PaystackReference) => handlePaystackSuccess(reference),
      () => handlePaystackClose()
    );
  };

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer', display: 'inline-block' }}>
      {children}
    </div>
  );
}