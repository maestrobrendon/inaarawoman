import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Save, Mail, Phone, MapPin, CreditCard, Clock, Truck, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import Button from '../../components/ui/Button';

interface OrderItem {
  product_id: string;
  product_name: string;
  product_slug: string;
  quantity: number;
  price: number;
  variant: any;
  image: string;
}

interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_postal_code: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  payment_reference: string;
  order_status: string;
  items: OrderItem[];
  notes: string;
  created_at: string;
  updated_at: string;
}

export default function OrderDetails() {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { formatPrice } = useCurrency();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      if (data) {
        setOrder(data as Order);
        setOrderStatus(data.order_status);
        setTrackingNumber(data.tracking_number || '');
        setAdminNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('orders')
        .update({
          order_status: orderStatus,
          tracking_number: trackingNumber,
          notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      alert('Order updated successfully!');
      loadOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      processing: 'bg-blue-100 text-blue-800 border-blue-300',
      shipped: 'bg-purple-100 text-purple-800 border-purple-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-neutral-600">Order not found</p>
        <Button onClick={() => navigate('/admin/orders')} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Orders</span>
        </button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Order Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#D4AF37]">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              Order {order.order_number}
            </h1>
            <div className="flex items-center gap-4 text-sm text-neutral-600">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {new Date(order.created_at).toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <CreditCard size={14} />
                {order.payment_reference}
              </span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(order.order_status)}`}>
            {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Status Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Order Status
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Current Status
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Enter tracking number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Admin Notes
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Internal notes about this order..."
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <Package size={20} />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0">
                  <img
                    src={item.image || '/placeholder.jpg'}
                    alt={item.product_name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900">{item.product_name}</h3>
                    <p className="text-sm text-neutral-600 mt-1">
                      Quantity: {item.quantity}
                      {item.variant && (
                        <>
                          {item.variant.size && ` • Size: ${item.variant.size}`}
                          {item.variant.color && ` • Color: ${item.variant.color}`}
                        </>
                      )}
                    </p>
                    <p className="text-sm font-semibold text-neutral-900 mt-2">
                      {order.currency === 'NGN' ? '₦' : '$'}{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Totals */}
            <div className="mt-6 space-y-2 pt-4 border-t border-neutral-200">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-neutral-900">
                  {order.currency === 'NGN' ? '₦' : '$'}{order.subtotal?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-neutral-900">
                  {order.shipping_fee === 0 ? 'FREE' : `${order.currency === 'NGN' ? '₦' : '$'}${order.shipping_fee?.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">
                  {order.currency === 'NGN' ? '₦' : '$'}{order.total_amount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Customer
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-neutral-900">{order.customer_name}</p>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-neutral-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Email</p>
                  <a href={`mailto:${order.customer_email}`} className="text-sm text-[#D4AF37] hover:underline break-all">
                    {order.customer_email}
                  </a>
                </div>
              </div>
              {order.customer_phone && (
                <div className="flex items-start gap-2">
                  <Phone size={16} className="text-neutral-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Phone</p>
                    <a href={`tel:${order.customer_phone}`} className="text-sm text-[#D4AF37] hover:underline">
                      {order.customer_phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Shipping Address
            </h2>
            <div className="bg-neutral-50 rounded-lg p-4">
              <p className="font-medium text-neutral-900 mb-2">{order.customer_name}</p>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {order.shipping_address}<br />
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}<br />
                {order.shipping_country}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-neutral-900 mb-4 flex items-center gap-2">
              <CreditCard size={20} />
              Payment
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Method</p>
                <p className="text-sm font-medium text-neutral-900 capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                  order.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Reference</p>
                <p className="text-xs font-mono text-neutral-900 break-all">{order.payment_reference}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Currency</p>
                <p className="text-sm font-medium text-neutral-900">{order.currency}</p>
              </div>
            </div>
          </div>

          {/* Tracking Information */}
          {trackingNumber && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Truck className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Tracking Number</p>
                  <p className="text-sm font-mono text-blue-700">{trackingNumber}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}