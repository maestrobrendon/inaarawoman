import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderConfirmationPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-3">
            Order Confirmed!
          </h1>
          
          <p className="text-neutral-600 mb-6">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          {orderId && (
            <div className="inline-block bg-neutral-50 border border-neutral-200 rounded-lg px-6 py-3 mb-6">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Order ID</p>
              <p className="text-lg font-mono font-bold text-neutral-900">
                {orderId}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              📧 A confirmation email has been sent to your email address with order details.
            </p>
          </div>

          {/* What's Next */}
          <div className="bg-neutral-50 rounded-lg p-6 mb-6 text-left">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              What Happens Next?
            </h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Order Processing</h3>
                  <p className="text-sm text-neutral-600">
                    We're preparing your items and will notify you when they're ready to ship.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Shipment</h3>
                  <p className="text-sm text-neutral-600">
                    Once shipped, you'll receive a tracking number to monitor your delivery.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 mb-1">Delivery</h3>
                  <p className="text-sm text-neutral-600">
                    Your order will arrive within 5-7 business days. Enjoy your purchase!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors font-medium"
            >
              Return to Home
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">
              Need help? Contact us at{' '}
              <a href="mailto:support@inaarawoman.com" className="text-[#D4AF37] hover:underline">
                info@inaarawoman.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}