import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Collection } from '../types';
import Button from '../components/ui/Button';

export default function LookbookPage() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('collections')
      .select('*')
      .order('display_order');

    if (data) setCollections(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-[50vh] flex items-center justify-center bg-gradient-to-br from-amber-50 to-rose-50">
        <div className="text-center px-4 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Lookbook
          </h1>
          <p className="text-lg text-neutral-700 leading-relaxed">
            Discover our collections and the stories behind each design
          </p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="space-y-20">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-8 bg-neutral-200 rounded w-48 mb-8" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="aspect-[4/5] bg-neutral-200 rounded-sm" />
                    <div className="aspect-[4/5] bg-neutral-200 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-20">
              {collections.map((collection, index) => (
                <div key={collection.id}>
                  <div className="mb-8">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                      {collection.name}
                    </h2>
                    <p className="text-lg text-neutral-700 leading-relaxed max-w-3xl">
                      {collection.description}
                    </p>
                  </div>

                  <div className={`grid grid-cols-1 ${index % 2 === 0 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-8`}>
                    {collection.image_url && (
                      <div className={`relative ${index % 2 === 0 ? 'md:col-span-1' : 'md:col-span-2'} aspect-[4/5] overflow-hidden rounded-sm bg-neutral-100 group cursor-pointer`}
                        onClick={() => navigate(`/collection/${collection.slug}`)}
                      >
                        <img
                          src={collection.image_url}
                          alt={collection.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <Button variant="secondary">Shop {collection.name}</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {index % 3 === 0 && (
                      <div className="aspect-[4/5] overflow-hidden rounded-sm bg-neutral-100">
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-rose-100" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4 bg-neutral-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-neutral-900 mb-6">
            Styling Inspiration
          </h2>
          <p className="text-lg text-neutral-700 mb-8 leading-relaxed">
            Follow us on Instagram for daily styling tips, behind-the-scenes content,
            and to see how our community styles their Inaara pieces.
          </p>
          <Button
            variant="outline"
            onClick={() => window.open('https://instagram.com', '_blank')}
          >
            Follow @inaarawoman
          </Button>
        </div>
      </section>
    </div>
  );
}
