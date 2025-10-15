import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockCount: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, stock_quantity, low_stock_threshold', { count: 'exact' }),
        supabase.from('orders').select('total_amount', { count: 'exact' }),
      ]);

      const totalProducts = productsRes.count || 0;
      const totalOrders = ordersRes.count || 0;
      const totalRevenue = ordersRes.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      const lowStockProducts = productsRes.data?.filter(
        (p) => p.stock_quantity <= (p.low_stock_threshold || 5)
      ).length || 0;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockCount: lowStockProducts,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Revenue',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Welcome back! Here's your store overview.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`bg-gradient-to-br ${stat.color} p-4`}>
                  <Icon className="text-white" size={32} />
                </div>
                <div className="p-6">
                  <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-neutral-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors text-left">
            <Package className="text-amber-500 mb-2" size={24} />
            <p className="font-medium text-neutral-900">Add New Product</p>
            <p className="text-sm text-neutral-600 mt-1">Create a new product listing</p>
          </button>
          <button className="p-4 border-2 border-neutral-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors text-left">
            <ShoppingBag className="text-amber-500 mb-2" size={24} />
            <p className="font-medium text-neutral-900">View Orders</p>
            <p className="text-sm text-neutral-600 mt-1">Manage customer orders</p>
          </button>
          <button className="p-4 border-2 border-neutral-200 rounded-lg hover:border-amber-500 hover:bg-amber-50 transition-colors text-left">
            <TrendingUp className="text-amber-500 mb-2" size={24} />
            <p className="font-medium text-neutral-900">Homepage Manager</p>
            <p className="text-sm text-neutral-600 mt-1">Control homepage products</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-neutral-900">Add Your First Product</p>
              <p className="text-sm text-neutral-600">Go to Products → Add New to create your first product listing</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-neutral-900">Feature on Homepage</p>
              <p className="text-sm text-neutral-600">Enable "Show on Homepage" in product settings to display products on your store</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-neutral-900">Manage Homepage Layout</p>
              <p className="text-sm text-neutral-600">Visit Homepage Manager to organize how products appear on your store</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
