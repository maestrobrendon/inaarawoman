import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

export default function OrdersList() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="text-yellow-600" size={16} />;
      case 'processing': return <Truck className="text-blue-600" size={16} />;
      case 'shipped': return <Truck className="text-purple-600" size={16} />;
      case 'delivered': return <CheckCircle className="text-green-600" size={16} />;
      case 'cancelled': return <XCircle className="text-red-600" size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="text-amber-500" size={28} />
            Orders
          </h1>
          <p className="text-neutral-600 mt-1">{filteredOrders.length} orders</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <Button onClick={loadOrders} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag className="mx-auto text-neutral-400 mb-4" size={48} />
            <p className="text-neutral-600">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{order.customer_email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full bg-neutral-100">
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium capitalize ${
                        order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                      ₦{order.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="p-2 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
