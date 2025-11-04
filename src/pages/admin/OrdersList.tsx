import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Eye, Package, Truck, CheckCircle, XCircle, RefreshCw, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCurrency } from '../../context/CurrencyContext';
import Button from '../../components/ui/Button';

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  payment_method: string;
}

export default function OrdersList() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  useEffect(() => {
    calculateStats();
  }, [orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('order_status', statusFilter);
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

  const calculateStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.order_status === 'pending').length,
      processing: orders.filter(o => o.order_status === 'processing').length,
      shipped: orders.filter(o => o.order_status === 'shipped').length,
      delivered: orders.filter(o => o.order_status === 'delivered').length,
      totalRevenue: orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0)
    };
    setStats(stats);
  };

  const filteredOrders = orders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="text-yellow-600" size={16} />;
      case 'processing': return <RefreshCw className="text-blue-600" size={16} />;
      case 'shipped': return <Truck className="text-purple-600" size={16} />;
      case 'delivered': return <CheckCircle className="text-green-600" size={16} />;
      case 'cancelled': return <XCircle className="text-red-600" size={16} />;
      default: return <Package className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const exportOrders = () => {
    const csv = [
      ['Order Number', 'Customer Name', 'Email', 'Phone', 'Status', 'Payment Status', 'Total', 'Currency', 'Date'],
      ...filteredOrders.map(o => [
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.currency,
        new Date(o.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <ShoppingBag className="text-[#D4AF37]" size={28} />
            Orders Management
          </h1>
          <p className="text-neutral-600 mt-1">{filteredOrders.length} orders found</p>
        </div>
        <Button onClick={exportOrders} variant="outline" className="gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-neutral-900">
          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-xs text-neutral-600 uppercase tracking-wider mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">₦{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search by order number, email, or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingBag className="mx-auto text-neutral-400 mb-4" size={48} />
            <p className="text-neutral-600 font-medium mb-2">No orders found</p>
            <p className="text-sm text-neutral-500">
              {searchTerm ? 'Try adjusting your search' : 'Orders will appear here once customers make purchases'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-mono text-sm font-medium text-neutral-900">{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{order.customer_name}</p>
                        <p className="text-xs text-neutral-500">{order.customer_email}</p>
                        {order.customer_phone && (
                          <p className="text-xs text-neutral-500">{order.customer_phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.order_status)}`}>
                        {getStatusIcon(order.order_status)}
                        <span className="capitalize">{order.order_status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        order.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.payment_status === 'paid' ? '✓ Paid' : 'Pending'}
                      </span>
                      <p className="text-xs text-neutral-500 mt-1 capitalize">{order.payment_method}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-neutral-900">
                        {order.currency === 'NGN' ? '₦' : order.currency === 'USD' ? '$' : order.currency}
                        {order.total_amount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      <p>{new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-neutral-700 bg-neutral-100 hover:bg-[#D4AF37] hover:text-white rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      {filteredOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow px-6 py-3 flex justify-between items-center">
          <p className="text-sm text-neutral-600">
            Showing <span className="font-medium">{filteredOrders.length}</span> of <span className="font-medium">{orders.length}</span> orders
          </p>
          <Button onClick={loadOrders} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={14} />
            Refresh
          </Button>
        </div>
      )}
    </div>
  );
}