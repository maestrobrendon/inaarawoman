import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  position: number;
  created_at: string;
  product_count?: number;
}

interface CollectionsListProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function CollectionsList({ onNavigate }: CollectionsListProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          collection_products(count)
        `)
        .order('position', { ascending: true });

      if (error) throw error;

      const collectionsWithCount = data?.map(col => ({
        ...col,
        product_count: col.collection_products?.[0]?.count || 0
      })) || [];

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"? This will not delete the products.`)) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('Collection deleted successfully!');
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const filteredCollections = collections.filter(collection =>
    collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <FolderOpen className="text-amber-500" size={28} />
            Collections
          </h1>
          <p className="text-neutral-600 mt-1">{filteredCollections.length} collections</p>
        </div>
        <Button
          onClick={() => onNavigate('collection-form', { mode: 'new' })}
          className="gap-2"
        >
          <Plus size={16} />
          Add Collection
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">Loading collections...</div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto text-neutral-400 mb-4" size={48} />
            <p className="text-neutral-600 mb-4">No collections found</p>
            <Button onClick={() => onNavigate('collection-form', { mode: 'new' })}>
              Create Your First Collection
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredCollections.map((collection) => (
                  <tr key={collection.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900">{collection.name}</p>
                      {collection.description && (
                        <p className="text-sm text-neutral-600 truncate max-w-xs">
                          {collection.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{collection.slug}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
                      {collection.product_count} products
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        collection.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}>
                        {collection.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{collection.position}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate('collection-form', { mode: 'edit', id: collection.id })}
                          className="p-2 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(collection.id, collection.name)}
                          className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
