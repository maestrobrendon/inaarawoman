import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Calendar, ShoppingBag, DollarSign, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface CustomerDetailsProps {
  customerId: string;
  onNavigate: (page: string, data?: any) => void;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
}

export default function CustomerDetails({ customerId, onNavigate }: CustomerDetailsProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomer();
    loadOrders();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      setCustomer(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        notes: data.notes || '',
      });
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, status, total_amount, created_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', customerId);

      if (error) throw error;
      alert('Customer updated successfully!');
      setEditing(false);
      loadCustomer();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!customer) return <div className="p-8">Customer not found</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('customers')}
          className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={20} />
          Back to Customers
        </button>

        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline">
            Edit Customer
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} className="mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <User className="text-amber-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-neutral-900">
                  {customer.first_name} {customer.last_name}
                </h1>
                <p className="text-neutral-600">{customer.email}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                  <Input
                    label="Last Name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                </div>
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-neutral-700">
                  <Mail size={20} className="text-neutral-400" />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3 text-neutral-700">
                    <Phone size={20} className="text-neutral-400" />
                    <span>{customer.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-neutral-700">
                  <Calendar size={20} className="text-neutral-400" />
                  <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                {customer.notes && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm font-medium text-neutral-700 mb-2">Notes</p>
                    <p className="text-neutral-600">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Order History</h2>
            {orders.length === 0 ? (
              <p className="text-neutral-600 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => onNavigate('order-details', { id: order.id })}
                    className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{order.order_number}</p>
                      <p className="text-sm text-neutral-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-neutral-900">
                        ₦{order.total_amount.toLocaleString()}
                      </p>
                      <span className={`text-xs font-medium capitalize ${
                        order.status === 'delivered' ? 'text-green-600' :
                        order.status === 'cancelled' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-amber-600" size={24} />
                  <div>
                    <p className="text-sm text-neutral-600">Total Orders</p>
                    <p className="text-2xl font-bold text-neutral-900">{customer.total_orders}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="text-green-600" size={24} />
                  <div>
                    <p className="text-sm text-neutral-600">Total Spent</p>
                    <p className="text-2xl font-bold text-neutral-900">
                      ₦{customer.total_spent?.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">Average Order Value</p>
                <p className="text-xl font-bold text-neutral-900">
                  ₦{customer.total_orders > 0
                    ? Math.round(customer.total_spent / customer.total_orders).toLocaleString()
                    : '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neutral-700">Newsletter</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  customer.is_subscribed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}>
                  {customer.is_subscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
