import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Plus, Search, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  product_count?: number;
}

export default function CollectionsList() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      
      // Get collections
      const { data: collectionsData, error: collectionsError } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (collectionsError) throw collectionsError;

      // Get product counts for each collection
      const collectionsWithCount = await Promise.all(
        (collectionsData || []).map(async (collection) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('collection_id', collection.id);
          
          return {
            ...collection,
            product_count: count || 0
          };
        })
      );

      setCollections(collectionsWithCount);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"?\n\nProducts in this collection will not be deleted, but they will no longer be associated with this collection.`)) {
      return;
    }

    try {
      setDeleting(id);
      
      // First, remove collection_id from products
      await supabase
        .from('products')
        .update({ collection_id: null })
        .eq('collection_id', id);

      // Then delete the collection
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCollections(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleViewCollection = (slug: string) => {
    window.open(`/collection/${slug}`, '_blank');
  };

  const filteredCollections = collections.filter(collection =>
    collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <FolderOpen className="text-amber-500" size={28} />
            Collections
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">
            Organize your products into collections
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/collections/new')}
          className="gap-2"
        >
          <Plus size={16} />
          New Collection
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-neutral-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500 text-sm">Loading collections...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="p-12 text-center">
            <FolderOpen className="mx-auto text-neutral-300 mb-4" size={48} />
            <h3 className="text-neutral-900 font-medium mb-2">
              {searchTerm ? 'No collections found' : 'No collections yet'}
            </h3>
            <p className="text-neutral-500 text-sm mb-6">
              {searchTerm 
                ? `No collections matching "${searchTerm}"`
                : 'Create your first collection to organize products'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/admin/collections/new')}>
                Create Collection
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredCollections.map((collection) => (
              <div 
                key={collection.id} 
                className="p-4 sm:p-6 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-neutral-900 truncate">
                        {collection.name}
                      </h3>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${
                        collection.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {collection.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-neutral-500 mb-2">
                      /{collection.slug}
                    </p>
                    
                    {collection.description && (
                      <p className="text-sm text-neutral-600 line-clamp-2 mb-3">
                        {collection.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                      <span>{collection.product_count} {collection.product_count === 1 ? 'product' : 'products'}</span>
                      <span>•</span>
                      <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewCollection(collection.slug)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                      title="View collection"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/collections/edit/${collection.id}`)}
                      className="p-2 text-neutral-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit collection"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(collection.id, collection.name)}
                      disabled={deleting === collection.id}
                      className="p-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete collection"
                    >
                      {deleting === collection.id ? (
                        <div className="w-4 h-4 border-2 border-neutral-300 border-t-red-500 rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}