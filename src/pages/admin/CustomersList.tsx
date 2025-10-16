import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
}

export default function CustomersList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
          <Users className="text-amber-500" size={28} />
          Customers
        </h1>
        <p className="text-neutral-600 mt-1">{filteredCustomers.length} customers</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4 font-medium">{customer.first_name} {customer.last_name}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm">{customer.total_orders}</td>
                  <td className="px-6 py-4 text-sm font-medium">₦{customer.total_spent?.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/customers/${customer.id}`)}
                      className="p-2 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
