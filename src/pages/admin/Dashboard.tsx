import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../../lib/motion/compat';
import { 
  Package, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  ArrowUpRight,
  Calendar,
  Activity,
  Zap
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockCount: number;
  pendingOrders: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyOrders: number;
  weeklyRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  order_status: string;
  payment_status: string;
  created_at: string;
  items_count?: number;
}

interface LowStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  main_image?: string;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'customer' | 'review';
  message: string;
  timestamp: string;
  icon: any;
  color: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    pendingOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    weeklyOrders: 0,
    weeklyRevenue: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order change detected:', payload);
        handleOrderChange(payload);
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadDashboardData();
      })
      .subscribe();

    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      loadDashboardData(true);
    }, 30000);

    return () => {
      ordersSubscription.unsubscribe();
      productsSubscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  const handleOrderChange = (payload: any) => {
    if (payload.eventType === 'INSERT') {
      // New order - add to activity and refresh stats
      const newOrder = payload.new;
      addActivity({
        type: 'order',
        message: `New order #${newOrder.order_number} received from ${newOrder.customer_name}`,
        icon: ShoppingBag,
        color: 'text-green-500 bg-green-100',
      });
      loadDashboardData(true);
    } else if (payload.eventType === 'UPDATE') {
      // Order updated
      const updatedOrder = payload.new;
      addActivity({
        type: 'order',
        message: `Order #${updatedOrder.order_number} status updated to ${updatedOrder.order_status}`,
        icon: RefreshCw,
        color: 'text-blue-500 bg-blue-100',
      });
      loadDashboardData(true);
    }
  };

  const addActivity = (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setRecentActivity(prev => [newActivity, ...prev].slice(0, 10));
  };

  const loadDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch all data in parallel
      const [
        productsRes,
        ordersRes,
        customersRes,
        todayOrdersRes,
        weeklyOrdersRes,
        monthlyOrdersRes,
        recentOrdersRes,
        lowStockRes,
      ] = await Promise.all([
        // Total products
        supabase.from('products').select('id, stock_quantity, low_stock_threshold', { count: 'exact' }),
        // All orders
        supabase.from('orders').select('id, total, order_status, payment_status'),
        // Unique customers
        supabase.from('orders').select('customer_email'),
        // Today's orders
        supabase.from('orders').select('id, total').gte('created_at', todayStart),
        // This week's orders
        supabase.from('orders').select('id, total').gte('created_at', weekStart),
        // This month's orders
        supabase.from('orders').select('id, total').gte('created_at', monthStart),
        // Recent orders (last 10)
        supabase
          .from('orders')
          .select('id, order_number, customer_name, customer_email, total, order_status, payment_status, created_at, items')
          .order('created_at', { ascending: false })
          .limit(10),
        // Low stock products
        supabase
          .from('products')
          .select('id, name, stock_quantity, low_stock_threshold, main_image')
          .or('stock_quantity.lte.low_stock_threshold,stock_quantity.lte.5')
          .order('stock_quantity', { ascending: true })
          .limit(5),
      ]);

      // Calculate stats
      const totalProducts = productsRes.count || 0;
      const allOrders = ordersRes.data || [];
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const pendingOrders = allOrders.filter(o => o.order_status === 'pending' || o.order_status === 'processing').length;

      // Unique customers
      const uniqueEmails = new Set(customersRes.data?.map(c => c.customer_email) || []);
      const totalCustomers = uniqueEmails.size;

      // Low stock count
      const lowStockProducts = productsRes.data?.filter(
        p => p.stock_quantity <= (p.low_stock_threshold || 5)
      ) || [];

      // Today's stats
      const todayOrdersData = todayOrdersRes.data || [];
      const todayOrders = todayOrdersData.length;
      const todayRevenue = todayOrdersData.reduce((sum, o) => sum + (o.total || 0), 0);

      // Weekly stats
      const weeklyOrdersData = weeklyOrdersRes.data || [];
      const weeklyOrders = weeklyOrdersData.length;
      const weeklyRevenue = weeklyOrdersData.reduce((sum, o) => sum + (o.total || 0), 0);

      // Monthly stats
      const monthlyOrdersData = monthlyOrdersRes.data || [];
      const monthlyOrders = monthlyOrdersData.length;
      const monthlyRevenue = monthlyOrdersData.reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        totalCustomers,
        lowStockCount: lowStockProducts.length,
        pendingOrders,
        todayOrders,
        todayRevenue,
        weeklyOrders,
        weeklyRevenue,
        monthlyOrders,
        monthlyRevenue,
      });

      // Format recent orders
      const formattedOrders: RecentOrder[] = (recentOrdersRes.data || []).map(order => ({
        ...order,
        items_count: Array.isArray(order.items) ? order.items.length : 0,
      }));
      setRecentOrders(formattedOrders);

      // Set low stock products
      setLowStockProducts(lowStockRes.data || []);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={14} />;
      case 'processing':
        return <RefreshCw size={14} />;
      case 'shipped':
        return <Truck size={14} />;
      case 'delivered':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      subValue: `₦${stats.todayRevenue.toLocaleString()} today`,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      trend: stats.todayRevenue > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      subValue: `${stats.todayOrders} today`,
      icon: ShoppingBag,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: stats.todayOrders > 0 ? 'up' : 'neutral',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      subValue: `${stats.lowStockCount} low stock`,
      icon: Package,
      color: 'bg-gradient-to-br from-violet-500 to-violet-600',
      trend: 'neutral',
    },
    {
      title: 'Customers',
      value: stats.totalCustomers,
      subValue: 'Unique buyers',
      icon: Users,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trend: 'neutral',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 bg-neutral-200 rounded w-48 animate-pulse mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-64 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
              <div className="h-12 w-12 bg-neutral-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <motion.button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </motion.button>
        </div>
      </div>

      {/* Alert Banner - Pending Orders */}
      <AnimatePresence>
        {stats.pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="text-amber-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-amber-900">
                  {stats.pendingOrders} order{stats.pendingOrders > 1 ? 's' : ''} pending
                </p>
                <p className="text-sm text-amber-700">
                  Review and process pending orders
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
            >
              View Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  {stat.trend === 'up' && (
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                      <ArrowUpRight size={14} />
                      Active
                    </div>
                  )}
                </div>
                <p className="text-sm text-neutral-500 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                <p className="text-xs text-neutral-400 mt-1">{stat.subValue}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-neutral-400" size={20} />
            <h3 className="font-medium text-neutral-900">Today</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Orders</span>
              <span className="font-semibold text-neutral-900">{stats.todayOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Revenue</span>
              <span className="font-semibold text-neutral-900">₦{stats.todayRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-neutral-400" size={20} />
            <h3 className="font-medium text-neutral-900">This Week</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Orders</span>
              <span className="font-semibold text-neutral-900">{stats.weeklyOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Revenue</span>
              <span className="font-semibold text-neutral-900">₦{stats.weeklyRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-neutral-400" size={20} />
            <h3 className="font-medium text-neutral-900">This Month</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Orders</span>
              <span className="font-semibold text-neutral-900">{stats.monthlyOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Revenue</span>
              <span className="font-semibold text-neutral-900">₦{stats.monthlyRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-100">
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-neutral-900">Recent Orders</h2>
              <p className="text-sm text-neutral-500 mt-0.5">Latest customer orders</p>
            </div>
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowUpRight size={14} />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="mx-auto text-neutral-300 mb-4" size={48} />
              <p className="text-neutral-500">No orders yet</p>
              <p className="text-sm text-neutral-400 mt-1">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                        <ShoppingBag className="text-neutral-500" size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-900">#{order.order_number}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${getStatusColor(order.order_status)}`}>
                            {getStatusIcon(order.order_status)}
                            {order.order_status}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">{order.customer_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-neutral-900">₦{order.total.toLocaleString()}</p>
                      <p className="text-xs text-neutral-400">{formatTimeAgo(order.created_at)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={18} />
                <h2 className="font-semibold text-neutral-900">Low Stock</h2>
              </div>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                {stats.lowStockCount}
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                <p className="text-sm text-neutral-500">All products stocked</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.main_image ? (
                          <img
                            src={product.main_image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-full h-full p-2 text-neutral-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">{product.name}</p>
                        <p className="text-xs text-red-600 font-medium">
                          {product.stock_quantity} left in stock
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {stats.lowStockCount > 5 && (
              <div className="p-4 border-t border-neutral-100">
                <button
                  onClick={() => navigate('/admin/products')}
                  className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  View all low stock items
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6">
            <h2 className="font-semibold text-neutral-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/admin/products/new')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Plus className="text-amber-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Add Product</p>
                  <p className="text-xs text-neutral-500">Create new listing</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/orders')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Manage Orders</p>
                  <p className="text-xs text-neutral-500">View all orders</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/collections')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Package className="text-violet-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Collections</p>
                  <p className="text-xs text-neutral-500">Organize products</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/customers')}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Users className="text-emerald-600" size={20} />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">Customers</p>
                  <p className="text-xs text-neutral-500">View customer list</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Zap className="text-amber-500" size={18} />
              <h2 className="font-semibold text-neutral-900">Live Activity</h2>
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-700">{activity.message}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}