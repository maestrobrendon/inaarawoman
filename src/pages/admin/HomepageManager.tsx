import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Save, 
  Eye, 
  RefreshCw, 
  Image as ImageIcon, 
  Type, 
  ChevronDown,
  ChevronRight,
  Upload,
  Trash2,
  Plus,
  Check,
  X,
  ExternalLink,
  Layers,
  Layout,
  Sparkles,
  ShoppingBag,
  Instagram,
  Truck,
  Shield,
  Headphones,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ============================================
// TYPES
// ============================================

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  mobilePosition: string;
}

interface CategoryItem {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  alignment: 'left' | 'right';
}

interface BenefitItem {
  icon: string;
  title: string;
  description: string;
}

interface HomepageContent {
  announcement: {
    text: string;
    is_visible: boolean;
  };
  hero: {
    slides: HeroSlide[];
    autoplay_speed: number;
  };
  best_sellers: {
    title: string;
    view_all_link: string;
    show_section: boolean;
  };
  about_section: {
    image: string;
    title: string;
    description: string;
    button_text: string;
    button_link: string;
    show_section: boolean;
  };
  new_arrivals: {
    title: string;
    view_all_link: string;
    show_section: boolean;
  };
  category_showcase: {
    categories: CategoryItem[];
    show_section: boolean;
  };
  benefits: {
    title: string;
    subtitle: string;
    items: BenefitItem[];
    show_section: boolean;
  };
  instagram: {
    handle: string;
    images: string[];
    show_section: boolean;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  main_image?: string;
  images?: string[];
  is_bestseller: boolean;
  is_new: boolean;
  show_on_homepage: boolean;
  homepage_section: string;
  homepage_position: number;
}

// ============================================
// DEFAULT CONTENT
// ============================================

const defaultContent: HomepageContent = {
  announcement: {
    text: 'DISCOVER OUR NIVARA COLLECTION',
    is_visible: true,
  },
  hero: {
    slides: [
      {
        image: 'https://res.cloudinary.com/dusynu0kv/image/upload/q_auto,f_auto,w_1920/v1764968906/s1q1nyc4y7lcvqxtsltz.jpg',
        title: 'Bold Layers,\nConfident Looks.',
        subtitle: 'Layer up with confidence and stylish all season',
        mobilePosition: 'object-left'
      },
      {
        image: 'https://res.cloudinary.com/dusynu0kv/image/upload/q_auto,f_auto,w_1920/v1764968784/xritjgpwclz3vs0eccdi.jpg',
        title: 'Elegant\nSimplicity.',
        subtitle: 'Discover timeless pieces for the modern woman',
        mobilePosition: 'object-center'
      },
      {
        image: 'https://res.cloudinary.com/dusynu0kv/image/upload/q_auto,f_auto,w_1920/v1761658028/hero_jlpiil.jpg',
        title: 'Define Your\nStyle.',
        subtitle: 'Curated collections that speak to your individuality',
        mobilePosition: 'object-center'
      }
    ],
    autoplay_speed: 8000,
  },
  best_sellers: {
    title: 'Best Sellers',
    view_all_link: '/shop',
    show_section: true,
  },
  about_section: {
    image: 'https://res.cloudinary.com/dusynu0kv/image/upload/q_auto,f_auto,w_1920/v1764968797/xwxzqp1biltadyyxsct7.jpg',
    title: 'Our Story, Your Style',
    description: 'Crafting timeless fashion with quality, innovation, and sophistication at the core',
    button_text: 'Explore About us',
    button_link: '/about',
    show_section: true,
  },
  new_arrivals: {
    title: 'New in',
    view_all_link: '/shop',
    show_section: true,
  },
  category_showcase: {
    categories: [
      {
        title: 'Elevate Your Style',
        subtitle: 'New in Dresses',
        description: 'Discover sophisticated silhouettes and luxurious fabrics, designed for timeless style',
        image: '/IMG_4511 copy.JPG',
        link: '/shop?category=dresses',
        alignment: 'left'
      },
      {
        title: 'Discover Nivara SS26',
        subtitle: 'New in Collection',
        description: 'Experience premium fabrics and modern fits, designed for effortless everyday style',
        image: 'https://res.cloudinary.com/dusynu0kv/image/upload/q_auto,f_auto,w_1200/v1761734975/IMG_0011_kerlww.jpg',
        link: '/shop?category=tops',
        alignment: 'right'
      }
    ],
    show_section: true,
  },
  benefits: {
    title: 'Why Shop with Inaara',
    subtitle: 'Enjoy exclusive benefits designed for a seamless shopping experience',
    items: [
      { icon: 'Truck', title: 'Fast Shipping', description: 'Get your order in 4-7 business days.' },
      { icon: 'Headphones', title: 'Here to help', description: 'Customer service is available Monday through Friday.' },
      { icon: 'Shield', title: 'Secure Payment', description: 'We keep your payment information safe.' },
      { icon: 'RotateCcw', title: '10-Days Return Policy', description: "We think you'll love it. If you don't, let us know!" }
    ],
    show_section: true,
  },
  instagram: {
    handle: '@inaarawoman_',
    images: [],
    show_section: true,
  },
};

// ============================================
// HELPER COMPONENTS
// ============================================

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

function SectionCard({ title, icon, isExpanded, onToggle, children, badge, badgeColor = 'bg-green-100 text-green-700' }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-600">
            {icon}
          </div>
          <span className="font-medium text-neutral-900">{title}</span>
          {badge && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={20} className="text-neutral-400" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-neutral-100">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
}

function InputField({ label, value, onChange, placeholder, type = 'text', multiline = false, rows = 3 }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
        />
      )}
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function ToggleSwitch({ label, checked, onChange, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-medium text-neutral-900 text-sm">{label}</p>
        {description && <p className="text-xs text-neutral-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-amber-500' : 'bg-neutral-200'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
        />
      </button>
    </div>
  );
}

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
}

function ImageUpload({ label, value, onChange, aspectRatio = 'aspect-video' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'inaara_uploads');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dusynu0kv/image/upload',
        { method: 'POST', body: formData }
      );

      const data = await response.json();
      if (data.secure_url) {
        onChange(data.secure_url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
      <div className="space-y-3">
        {value && (
          <div className={`${aspectRatio} bg-neutral-100 rounded-xl overflow-hidden relative group`}>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <Upload size={18} />
              </button>
              <button
                onClick={() => onChange('')}
                className="p-2 bg-white rounded-lg hover:bg-red-50 text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )}
        
        {!value && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full ${aspectRatio} border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-50/50 transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? (
              <RefreshCw size={24} className="text-neutral-400 animate-spin" />
            ) : (
              <Upload size={24} className="text-neutral-400" />
            )}
            <span className="text-sm text-neutral-500">
              {isUploading ? 'Uploading...' : 'Click to upload image'}
            </span>
          </button>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Or paste image URL..."
          className="w-full px-4 py-2 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HomepageManager() {
  const [content, setContent] = useState<HomepageContent>(defaultContent);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'sections' | 'products'>('sections');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['announcement']));
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadContent();
    loadProducts();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homepage_content')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      if (data && data.length > 0) {
        // Merge database content with default content
        const mergedContent = { ...defaultContent };
        data.forEach((item: any) => {
          if (item.section_key && item.content) {
            (mergedContent as any)[item.section_key] = {
              ...(defaultContent as any)[item.section_key],
              ...item.content
            };
          }
        });
        setContent(mergedContent);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, main_image, images, is_bestseller, is_new, show_on_homepage, homepage_section, homepage_position')
        .eq('status', 'active')
        .order('homepage_position');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const updateContent = (section: keyof HomepageContent, updates: any) => {
    setContent(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
    setHasChanges(true);
  };

  const saveSection = async (sectionKey: string) => {
    setSaving(true);
    try {
      const sectionContent = (content as any)[sectionKey];
      
      const { error } = await supabase
        .from('homepage_content')
        .upsert({
          section_key: sectionKey,
          content: sectionContent,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section_key'
        });

      if (error) throw error;
      
      setLastSaved(new Date());
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    try {
      const sections = Object.keys(content);
      
      for (const sectionKey of sections) {
        const sectionContent = (content as any)[sectionKey];
        
        await supabase
          .from('homepage_content')
          .upsert({
            section_key: sectionKey,
            content: sectionContent,
            is_active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'section_key'
          });
      }
      
      setLastSaved(new Date());
      setHasChanges(false);
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const updateHeroSlide = (index: number, field: keyof HeroSlide, value: string) => {
    const newSlides = [...content.hero.slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    updateContent('hero', { slides: newSlides });
  };

  const addHeroSlide = () => {
    const newSlides = [...content.hero.slides, {
      image: '',
      title: 'New Slide',
      subtitle: 'Add your subtitle here',
      mobilePosition: 'object-center'
    }];
    updateContent('hero', { slides: newSlides });
  };

  const removeHeroSlide = (index: number) => {
    if (content.hero.slides.length <= 1) {
      alert('You must have at least one slide');
      return;
    }
    const newSlides = content.hero.slides.filter((_, i) => i !== index);
    updateContent('hero', { slides: newSlides });
  };

  const updateCategoryItem = (index: number, field: keyof CategoryItem, value: string) => {
    const newCategories = [...content.category_showcase.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    updateContent('category_showcase', { categories: newCategories });
  };

  const updateBenefitItem = (index: number, field: keyof BenefitItem, value: string) => {
    const newItems = [...content.benefits.items];
    newItems[index] = { ...newItems[index], [field]: value };
    updateContent('benefits', { items: newItems });
  };

  const bestSellerProducts = products.filter(p => p.is_bestseller);
  const newArrivalProducts = products.filter(p => p.is_new);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-neutral-600">Loading homepage content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Home className="text-amber-600" size={22} />
            </div>
            Homepage Manager
          </h1>
          <p className="text-neutral-500 text-sm mt-1">
            Customize your homepage content, images, and layout
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-neutral-400">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => window.open('/', '_blank')}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors text-sm"
          >
            <Eye size={18} />
            Preview
          </button>
          <button
            onClick={saveAllChanges}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              hasChanges
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="text-amber-600" size={20} />
              <p className="text-sm text-amber-800">You have unsaved changes</p>
            </div>
            <button
              onClick={saveAllChanges}
              className="text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Save now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'sections'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <Layout size={16} />
            Page Sections
          </span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'products'
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <span className="flex items-center gap-2">
            <ShoppingBag size={16} />
            Featured Products
          </span>
        </button>
      </div>

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          {/* Announcement Bar */}
          <SectionCard
            title="Announcement Bar"
            icon={<Type size={20} />}
            isExpanded={expandedSections.has('announcement')}
            onToggle={() => toggleSection('announcement')}
            badge={content.announcement.is_visible ? 'Visible' : 'Hidden'}
            badgeColor={content.announcement.is_visible ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-4">
              <InputField
                label="Announcement Text"
                value={content.announcement.text}
                onChange={(value) => updateContent('announcement', { text: value })}
                placeholder="Enter announcement text..."
              />
              <ToggleSwitch
                label="Show Announcement Bar"
                checked={content.announcement.is_visible}
                onChange={(checked) => updateContent('announcement', { is_visible: checked })}
                description="Toggle the scrolling announcement bar at the top of the page"
              />
              <button
                onClick={() => saveSection('announcement')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>

          {/* Hero Section */}
          <SectionCard
            title="Hero Slideshow"
            icon={<ImageIcon size={20} />}
            isExpanded={expandedSections.has('hero')}
            onToggle={() => toggleSection('hero')}
            badge={`${content.hero.slides.length} slides`}
          >
            <div className="space-y-6">
              {content.hero.slides.map((slide, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-neutral-900">Slide {index + 1}</h4>
                    <button
                      onClick={() => removeHeroSlide(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <ImageUpload
                    label="Slide Image"
                    value={slide.image}
                    onChange={(url) => updateHeroSlide(index, 'image', url)}
                    aspectRatio="aspect-[16/9]"
                  />
                  
                  <InputField
                    label="Title (use \n for line break)"
                    value={slide.title}
                    onChange={(value) => updateHeroSlide(index, 'title', value)}
                    multiline
                    rows={2}
                  />
                  
                  <InputField
                    label="Subtitle"
                    value={slide.subtitle}
                    onChange={(value) => updateHeroSlide(index, 'subtitle', value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Mobile Image Position
                    </label>
                    <select
                      value={slide.mobilePosition}
                      onChange={(e) => updateHeroSlide(index, 'mobilePosition', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="object-left">Left</option>
                      <option value="object-center">Center</option>
                      <option value="object-right">Right</option>
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={addHeroSlide}
                className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-xl text-neutral-500 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Add New Slide
              </button>

              <button
                onClick={() => saveSection('hero')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Hero Section
              </button>
            </div>
          </SectionCard>

          {/* Best Sellers Section */}
          <SectionCard
            title="Best Sellers Section"
            icon={<Sparkles size={20} />}
            isExpanded={expandedSections.has('best_sellers')}
            onToggle={() => toggleSection('best_sellers')}
            badge={content.best_sellers.show_section ? 'Visible' : 'Hidden'}
            badgeColor={content.best_sellers.show_section ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-4">
              <InputField
                label="Section Title"
                value={content.best_sellers.title}
                onChange={(value) => updateContent('best_sellers', { title: value })}
              />
              <InputField
                label="View All Link"
                value={content.best_sellers.view_all_link}
                onChange={(value) => updateContent('best_sellers', { view_all_link: value })}
              />
              <ToggleSwitch
                label="Show Section"
                checked={content.best_sellers.show_section}
                onChange={(checked) => updateContent('best_sellers', { show_section: checked })}
              />
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Products marked as "Best Seller" in the product editor will appear here automatically.
                  Currently showing {bestSellerProducts.length} products.
                </p>
              </div>
              <button
                onClick={() => saveSection('best_sellers')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>

          {/* About Section */}
          <SectionCard
            title="About / Story Section"
            icon={<Layers size={20} />}
            isExpanded={expandedSections.has('about_section')}
            onToggle={() => toggleSection('about_section')}
            badge={content.about_section.show_section ? 'Visible' : 'Hidden'}
            badgeColor={content.about_section.show_section ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-4">
              <ImageUpload
                label="Background Image"
                value={content.about_section.image}
                onChange={(url) => updateContent('about_section', { image: url })}
                aspectRatio="aspect-[16/9]"
              />
              <InputField
                label="Title"
                value={content.about_section.title}
                onChange={(value) => updateContent('about_section', { title: value })}
              />
              <InputField
                label="Description"
                value={content.about_section.description}
                onChange={(value) => updateContent('about_section', { description: value })}
                multiline
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Button Text"
                  value={content.about_section.button_text}
                  onChange={(value) => updateContent('about_section', { button_text: value })}
                />
                <InputField
                  label="Button Link"
                  value={content.about_section.button_link}
                  onChange={(value) => updateContent('about_section', { button_link: value })}
                />
              </div>
              <ToggleSwitch
                label="Show Section"
                checked={content.about_section.show_section}
                onChange={(checked) => updateContent('about_section', { show_section: checked })}
              />
              <button
                onClick={() => saveSection('about_section')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>

          {/* New Arrivals Section */}
          <SectionCard
            title="New Arrivals Section"
            icon={<ShoppingBag size={20} />}
            isExpanded={expandedSections.has('new_arrivals')}
            onToggle={() => toggleSection('new_arrivals')}
            badge={content.new_arrivals.show_section ? 'Visible' : 'Hidden'}
            badgeColor={content.new_arrivals.show_section ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-4">
              <InputField
                label="Section Title"
                value={content.new_arrivals.title}
                onChange={(value) => updateContent('new_arrivals', { title: value })}
              />
              <InputField
                label="View All Link"
                value={content.new_arrivals.view_all_link}
                onChange={(value) => updateContent('new_arrivals', { view_all_link: value })}
              />
              <ToggleSwitch
                label="Show Section"
                checked={content.new_arrivals.show_section}
                onChange={(checked) => updateContent('new_arrivals', { show_section: checked })}
              />
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Products marked as "New" in the product editor will appear here automatically.
                  Currently showing {newArrivalProducts.length} products.
                </p>
              </div>
              <button
                onClick={() => saveSection('new_arrivals')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>

          {/* Category Showcase */}
          <SectionCard
            title="Category Showcase"
            icon={<Layout size={20} />}
            isExpanded={expandedSections.has('category_showcase')}
            onToggle={() => toggleSection('category_showcase')}
            badge={content.category_showcase.show_section ? 'Visible' : 'Hidden'}
            badgeColor={content.category_showcase.show_section ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-6">
              <ToggleSwitch
                label="Show Section"
                checked={content.category_showcase.show_section}
                onChange={(checked) => updateContent('category_showcase', { show_section: checked })}
              />

              {content.category_showcase.categories.map((category, index) => (
                <div key={index} className="p-4 bg-neutral-50 rounded-xl space-y-4">
                  <h4 className="font-medium text-neutral-900">Category {index + 1}</h4>
                  
                  <ImageUpload
                    label="Category Image"
                    value={category.image}
                    onChange={(url) => updateCategoryItem(index, 'image', url)}
                    aspectRatio="aspect-[4/5]"
                  />
                  
                  <InputField
                    label="Subtitle (small text)"
                    value={category.subtitle}
                    onChange={(value) => updateCategoryItem(index, 'subtitle', value)}
                  />
                  
                  <InputField
                    label="Title"
                    value={category.title}
                    onChange={(value) => updateCategoryItem(index, 'title', value)}
                  />
                  
                  <InputField
                    label="Description"
                    value={category.description}
                    onChange={(value) => updateCategoryItem(index, 'description', value)}
                    multiline
                  />
                  
                  <InputField
                    label="Button Link"
                    value={category.link}
                    onChange={(value) => updateCategoryItem(index, 'link', value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Layout Alignment
                    </label>
                    <select
                      value={category.alignment}
                      onChange={(e) => updateCategoryItem(index, 'alignment', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    >
                      <option value="left">Image Left, Text Right</option>
                      <option value="right">Image Right, Text Left</option>
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={() => saveSection('category_showcase')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>

          {/* Benefits Section */}
          <SectionCard
            title="Why Shop With Us"
            icon={<Shield size={20} />}
            isExpanded={expandedSections.has('benefits')}
            onToggle={() => toggleSection('benefits')}
            badge={content.benefits.show_section ? 'Visible' : 'Hidden'}
            badgeColor={content.benefits.show_section ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-4">
              <InputField
                label="Section Title"
                value={content.benefits.title}
                onChange={(value) => updateContent('benefits', { title: value })}
              />
              <InputField
                label="Subtitle"
                value={content.benefits.subtitle}
                onChange={(value) => updateContent('benefits', { subtitle: value })}
              />
              <ToggleSwitch
                label="Show Section"
                checked={content.benefits.show_section}
                onChange={(checked) => updateContent('benefits', { show_section: checked })}
              />

              <div className="space-y-4">
                <h4 className="font-medium text-neutral-700">Benefits List</h4>
                {content.benefits.items.map((item, index) => (
                  <div key={index} className="p-4 bg-neutral-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Icon</label>
                        <select
                          value={item.icon}
                          onChange={(e) => updateBenefitItem(index, 'icon', e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        >
                          <option value="Truck">Truck (Shipping)</option>
                          <option value="Headphones">Headphones (Support)</option>
                          <option value="Shield">Shield (Security)</option>
                          <option value="RotateCcw">Return Arrow (Returns)</option>
                        </select>
                      </div>
                      <InputField
                        label="Title"
                        value={item.title}
                        onChange={(value) => updateBenefitItem(index, 'title', value)}
                      />
                    </div>
                    <InputField
                      label="Description"
                      value={item.description}
                      onChange={(value) => updateBenefitItem(index, 'description', value)}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => saveSection('benefits')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>

          {/* Instagram Section */}
          <SectionCard
            title="Instagram Section"
            icon={<Instagram size={20} />}
            isExpanded={expandedSections.has('instagram')}
            onToggle={() => toggleSection('instagram')}
            badge={content.instagram.show_section ? 'Visible' : 'Hidden'}
            badgeColor={content.instagram.show_section ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}
          >
            <div className="space-y-4">
              <InputField
                label="Instagram Handle"
                value={content.instagram.handle}
                onChange={(value) => updateContent('instagram', { handle: value })}
                placeholder="@yourusername"
              />
              <ToggleSwitch
                label="Show Section"
                checked={content.instagram.show_section}
                onChange={(checked) => updateContent('instagram', { show_section: checked })}
              />
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> Instagram images are currently loaded from the homepage code.
                  To change images, update the InstagramSection component in the code.
                </p>
              </div>
              <button
                onClick={() => saveSection('instagram')}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm hover:bg-neutral-800 transition-colors"
              >
                <Save size={16} />
                Save Section
              </button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              How Product Display Works
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              Products are displayed on the homepage based on their settings in the product editor.
              Mark products as "Best Seller" or "New" to show them in the respective sections.
            </p>
            <a
              href="/admin/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-amber-700 hover:text-amber-800"
            >
              Go to Products
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Best Sellers Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900">Best Sellers</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {bestSellerProducts.length} products marked as best sellers
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  {bestSellerProducts.length} products
                </span>
              </div>
            </div>

            {bestSellerProducts.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {bestSellerProducts.map((product) => (
                    <div key={product.id} className="group">
                      <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-2">
                        {product.main_image || product.images?.[0] ? (
                          <img
                            src={product.main_image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-neutral-900 truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500">₦{product.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Sparkles className="mx-auto text-neutral-300 mb-3" size={40} />
                <p className="text-neutral-500 mb-2">No best sellers yet</p>
                <p className="text-sm text-neutral-400">
                  Edit products and mark them as "Best Seller" to show here
                </p>
              </div>
            )}
          </div>

          {/* New Arrivals Products */}
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-900">New Arrivals</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {newArrivalProducts.length} products marked as new
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                  {newArrivalProducts.length} products
                </span>
              </div>
            </div>

            {newArrivalProducts.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {newArrivalProducts.map((product) => (
                    <div key={product.id} className="group">
                      <div className="aspect-[3/4] bg-neutral-100 rounded-xl overflow-hidden mb-2">
                        {product.main_image || product.images?.[0] ? (
                          <img
                            src={product.main_image || product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium text-neutral-900 truncate">{product.name}</p>
                      <p className="text-xs text-neutral-500">₦{product.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <ShoppingBag className="mx-auto text-neutral-300 mb-3" size={40} />
                <p className="text-neutral-500 mb-2">No new arrivals yet</p>
                <p className="text-sm text-neutral-400">
                  Edit products and mark them as "New" to show here
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}