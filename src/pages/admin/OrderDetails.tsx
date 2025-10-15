import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface OrderDetailsProps {
  orderId: string;
  onNavigate: (page: string) => void;
}

export default function OrderDetails({ orderId, onNavigate }: OrderDetailsProps) {
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).single(),
        supabase.from('order_items').select('*').eq('order_id', orderId),
      ]);

      if (orderRes.error) throw orderRes.error;
      setOrder(orderRes.data);
      setStatus(orderRes.data.status);
      setTrackingNumber(orderRes.data.tracking_number || '');
      setItems(itemsRes.data || []);
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
          status,
          tracking_number: trackingNumber,
          fulfilled_at: status === 'shipped' ? new Date().toISOString() : order.fulfilled_at,
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!order) return <div className="p-8">Order not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => onNavigate('orders')}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft size={20} />
        Back to Orders
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Order {order.order_number}</h1>
          <p className="text-neutral-600 mt-1">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900">Order Status</h2>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter tracking number"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900">Customer Information</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-neutral-600">Email:</span>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            <div>
              <span className="text-neutral-600">Phone:</span>
              <p className="font-medium">{order.customer_phone || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">Order Items</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div>
                <p className="font-medium text-neutral-900">{item.product_name}</p>
                {item.variant_name && <p className="text-sm text-neutral-600">{item.variant_name}</p>}
                <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-medium">₦{item.total_price?.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 border-t border-neutral-200 pt-4">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>₦{order.subtotal?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>₦{order.shipping_amount?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₦{order.total_amount?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
