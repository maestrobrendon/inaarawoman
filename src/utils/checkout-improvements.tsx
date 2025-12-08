// CHECKOUT SYSTEM IMPROVEMENTS
// =================================

// 1. Enhanced Form Validation
// ---------------------------

export const validateCheckoutForm = (formData: any) => {
    const errors: Record<string, string> = {};
  
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
  
    // Phone validation (basic international format)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
  
    // Required fields
    const requiredFields = ['firstName', 'lastName', 'address', 'city', 'state', 'country'];
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
      }
    });
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // 2. Loading States Component
  // ---------------------------
  
  export const LoadingOverlay = ({ message }: { message: string }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-sm">
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">{message}</h3>
        <p className="text-sm text-neutral-600">Please don't close this window...</p>
      </div>
    </div>
  );
  
  // 3. Order Summary Component (Reusable)
  // -------------------------------------
  
  interface OrderSummaryItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image?: string;
    size?: string;
    color?: string;
  }
  
  export const OrderSummaryCard = ({ 
    items, 
    subtotal, 
    shippingFee = 0, 
    formatPrice 
  }: {
    items: OrderSummaryItem[];
    subtotal: number;
    shippingFee?: number;
    formatPrice: (amount: number) => string;
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4">Order Summary</h2>
      
      {/* Items List */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex gap-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">{item.name}</p>
              <p className="text-xs text-neutral-600">Qty: {item.quantity}</p>
              {(item.size || item.color) && (
                <p className="text-xs text-neutral-500">
                  {item.size && `Size: ${item.size}`}
                  {item.color && item.size && ' • '}
                  {item.color && item.color}
                </p>
              )}
              <p className="text-sm font-semibold text-neutral-900 mt-1">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
  
      {/* Totals */}
      <div className="space-y-2 py-4 border-t border-neutral-200">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Subtotal</span>
          <span className="text-neutral-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-600">Shipping</span>
          <span className={shippingFee === 0 ? "text-green-600" : "text-neutral-900"}>
            {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
          </span>
        </div>
      </div>
  
      <div className="flex justify-between text-lg font-bold py-4 border-t border-neutral-200">
        <span className="text-neutral-900">Total</span>
        <span className="text-neutral-900">{formatPrice(subtotal + shippingFee)}</span>
      </div>
    </div>
  );
  
  // 4. Shipping Address Form Component
  // ----------------------------------
  
  export const ShippingAddressForm = ({ 
    formData, 
    onChange, 
    errors = {} 
  }: {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errors?: Record<string, string>;
  }) => {
    const InputField = ({ 
      label, 
      name, 
      type = "text", 
      placeholder, 
      required = true 
    }: any) => (
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type={type}
          name={name}
          value={formData[name] || ''}
          onChange={onChange}
          required={required}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
            errors[name] ? 'border-red-500' : 'border-neutral-300'
          }`}
          placeholder={placeholder}
        />
        {errors[name] && (
          <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
        )}
      </div>
    );
  
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="First Name" 
            name="firstName" 
            placeholder="John" 
          />
          <InputField 
            label="Last Name" 
            name="lastName" 
            placeholder="Doe" 
          />
        </div>
  
        <InputField 
          label="Email Address" 
          name="email" 
          type="email" 
          placeholder="john.doe@example.com" 
        />
  
        <InputField 
          label="Phone Number" 
          name="phone" 
          type="tel" 
          placeholder="+234 800 000 0000" 
        />
  
        <InputField 
          label="Street Address" 
          name="address" 
          placeholder="123 Main Street" 
        />
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField 
            label="City" 
            name="city" 
            placeholder="Lagos" 
          />
          <InputField 
            label="State" 
            name="state" 
            placeholder="Lagos" 
          />
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              name="country"
              value={formData.country || 'Nigeria'}
              onChange={onChange}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] ${
                errors.country ? 'border-red-500' : 'border-neutral-300'
              }`}
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
            </select>
            {errors.country && (
              <p className="text-xs text-red-500 mt-1">{errors.country}</p>
            )}
          </div>
  
          <InputField 
            label="Postal Code" 
            name="postalCode" 
            placeholder="100001" 
            required={false}
          />
        </div>
      </div>
    );
  };
  
  // 5. Payment Method Display
  // -------------------------
  
  export const PaymentMethodInfo = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        Payment Method
      </h2>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <img 
              src="https://paystack.com/assets/img/logo/logo.svg" 
              alt="Paystack" 
              className="h-6"
            />
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Secure Payment with Paystack
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and secure. We accept all major cards, bank transfers, and mobile money.
              </p>
            </div>
          </div>
        </div>
  
        <div className="flex items-center justify-center gap-3 py-3">
          <img src="https://cdn.brandfetch.io/visa.com/w/400/h/400" alt="Visa" className="h-8" />
          <img src="https://cdn.brandfetch.io/mastercard.com/w/400/h/400" alt="Mastercard" className="h-8" />
          <img src="https://cdn.brandfetch.io/verve.com/w/400/h/400" alt="Verve" className="h-8" />
        </div>
  
        <div className="bg-neutral-50 rounded-lg p-3">
          <p className="text-xs text-neutral-600 text-center">
            🔒 Payments are processed securely. Your card details are never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
  
  // 6. Error Handler Utility
  // ------------------------
  
  export const handleCheckoutError = (error: any, reference?: string) => {
    console.error('Checkout error:', error);
    
    let errorMessage = 'An error occurred during checkout. Please try again.';
    
    if (error?.message?.includes('network')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error?.message?.includes('payment')) {
      errorMessage = `Payment processed but order creation failed. Reference: ${reference}. Please contact support.`;
    } else if (error?.code === 'PGRST116') {
      errorMessage = 'Database error. Please try again or contact support.';
    }
    
    return errorMessage;
  };
  
  // 7. Order Tracking Number Generator
  // ----------------------------------
  
  export const generateTrackingNumber = (): string => {
    const prefix = 'INW';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  };
  
  // 8. Currency Conversion Helper
  // -----------------------------
  
  export const convertCurrency = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> => {
    // This is a placeholder - you should implement actual currency conversion
    // using an API like exchangerate-api.com or similar
    
    const exchangeRates: Record<string, Record<string, number>> = {
      'NGN': { 'USD': 0.0013, 'GHS': 0.015, 'ZAR': 0.024 },
      'USD': { 'NGN': 770, 'GHS': 11.5, 'ZAR': 18.5 },
      'GHS': { 'NGN': 67, 'USD': 0.087, 'ZAR': 1.61 },
      'ZAR': { 'NGN': 42, 'USD': 0.054, 'GHS': 0.62 }
    };
  
    if (fromCurrency === toCurrency) return amount;
    
    const rate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
    return amount * rate;
  };
  
  // 9. Order Status Badge Component
  // -------------------------------
  
  export const OrderStatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⏳' },
      processing: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🔄' },
      shipped: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🚚' },
      delivered: { color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-300', icon: '❌' }
    };
  
    const config = statusConfig[status] || statusConfig.pending;
  
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        <span>{config.icon}</span>
        <span className="capitalize">{status}</span>
      </span>
    );
  };
  
  // 10. Checkout Progress Indicator
  // -------------------------------
  
  export const CheckoutProgress = ({ currentStep }: { currentStep: number }) => {
    const steps = [
      { number: 1, label: 'Cart', icon: '🛒' },
      { number: 2, label: 'Shipping', icon: '📦' },
      { number: 3, label: 'Payment', icon: '💳' },
      { number: 4, label: 'Confirmation', icon: '✓' }
    ];
  
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${index !== 0 ? 'ml-4' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
                  currentStep >= step.number
                    ? 'bg-[#D4AF37] text-white'
                    : 'bg-neutral-200 text-neutral-500'
                }`}>
                  {step.icon}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step.number ? 'text-neutral-900' : 'text-neutral-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-16 mx-2 ${
                  currentStep > step.number ? 'bg-[#D4AF37]' : 'bg-neutral-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };