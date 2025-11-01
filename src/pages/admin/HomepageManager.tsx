import { useState, useEffect } from 'react';
import { 
  Home, Save, Eye, RefreshCw, Image, Type, 
  Globe, ShoppingBag, Award, Edit2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface HomepageContent {
  hero: {
    image: string;
    overlay_opacity: number;
    small_text: string;
    main_title: string;
    subtitle: string;
    button1_text: string;
    button1_link: string;
    button2_text: string;
    show_video_button: boolean;
  };
  top_banner: {
    text: string;
    background_color: string;
    text_color: string;
    is_visible: boolean;
  };
  brand_story: {
    small_text: string;
    main_text: string;
    description: string;
  };
  crafted_section: {
    background_image: string;
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
    overlay_opacity: number;
  };
  final_cta: {
    background_image: string;
    title: string;
    subtitle: string;
    button_text: string;
    button_link: string;
    overlay_opacity: number;
  };
  benefits: {
    title: string;
    small_text: string;
    benefits: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
}

interface Product {
  id: string;
  name: string;
  price: number;
  featured_image: string;
  show_on_homepage: boolean;
  homepage_section: string;
  homepage_position: number;
}

export default function HomepageContentManager() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'products'>('content');
  const [editingSection, setEditingSection] = useState<string | null>(null);

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

      // Convert array to object keyed by section_key
      const contentObj: any = {};
      data?.forEach(item => {
        contentObj[item.section_key] = item.content;
      });
      
      setContent(contentObj);
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
        .select('id, name, price, featured_image, show_on_homepage, homepage_section, homepage_position')
        .eq('show_on_homepage', true)
        .eq('status', 'active')
        .order('homepage_position');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const saveSection = async (sectionKey: string, sectionContent: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_content')
        .upsert({
          section_key: sectionKey,
          content: sectionContent,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section_key'
        });

      if (error) throw error;
      
      alert('Section updated successfully!');
      setEditingSection(null);
      await loadContent();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section: keyof HomepageContent, field: string, value: any, subfield?: string) => {
    if (!content) return;
    
    const newContent = { ...content };
    const sectionData = newContent[section] as any;
    
    if (subfield) {
      if (sectionData[field] && typeof sectionData[field] === 'object') {
        sectionData[field] = { ...sectionData[field], [subfield]: value };
      }
    } else {
      sectionData[field] = value;
    }
    
    setContent(newContent as HomepageContent);
  };

  const handleBenefitChange = (index: number, field: 'icon' | 'title' | 'description', value: string) => {
    if (!content) return;
    
    const newContent = { ...content };
    const benefit = newContent.benefits.benefits[index];
    if (benefit) {
      switch (field) {
        case 'icon':
          benefit.icon = value;
          break;
        case 'title':
          benefit.title = value;
          break;
        case 'description':
          benefit.description = value;
          break;
      }
    }
    setContent(newContent);
  };

  const groupedProducts = products.reduce((acc, product) => {
    const section = product.homepage_section || 'featured';
    if (!acc[section]) acc[section] = [];
    acc[section].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-neutral-600">Loading homepage content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <Home className="text-amber-500" size={28} />
            Homepage Content Manager
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage your homepage content, images, and text
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadContent}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </Button>
          <Button
            onClick={() => window.open('/', '_blank')}
            variant="outline"
            className="gap-2"
          >
            <Eye size={20} />
            Preview Store
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('content')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'content' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Content Management
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-1 font-medium transition-colors ${
            activeTab === 'products' 
              ? 'text-amber-600 border-b-2 border-amber-600' 
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          Product Sections
        </button>
      </div>

      {activeTab === 'content' && content && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Globe size={20} />
                Top Banner
              </h3>
              <Button
                onClick={() => setEditingSection(editingSection === 'top_banner' ? null : 'top_banner')}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} />
                {editingSection === 'top_banner' ? 'Close' : 'Edit'}
              </Button>
            </div>
            
            {editingSection === 'top_banner' ? (
              <div className="p-6 space-y-4">
                <Input
                  label="Banner Text"
                  value={content.top_banner.text}
                  onChange={(e) => handleInputChange('top_banner', 'text', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={content.top_banner.background_color}
                      onChange={(e) => handleInputChange('top_banner', 'background_color', e.target.value)}
                      className="w-full h-10 border border-neutral-300 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={content.top_banner.text_color}
                      onChange={(e) => handleInputChange('top_banner', 'text_color', e.target.value)}
                      className="w-full h-10 border border-neutral-300 rounded cursor-pointer"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={content.top_banner.is_visible}
                    onChange={(e) => handleInputChange('top_banner', 'is_visible', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span>Show Banner</span>
                </label>
                <Button onClick={() => saveSection('top_banner', content.top_banner)} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="bg-neutral-100 p-4 rounded">
                  <p className="text-sm mb-2">Current Text: {content.top_banner.text}</p>
                  <p className="text-xs text-neutral-600">Visible: {content.top_banner.is_visible ? 'Yes' : 'No'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Image size={20} />
                Hero Section
              </h3>
              <Button
                onClick={() => setEditingSection(editingSection === 'hero' ? null : 'hero')}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} />
                {editingSection === 'hero' ? 'Close' : 'Edit'}
              </Button>
            </div>
            
            {editingSection === 'hero' ? (
              <div className="p-6 space-y-4">
                <Input
                  label="Background Image URL"
                  value={content.hero.image}
                  onChange={(e) => handleInputChange('hero', 'image', e.target.value)}
                  placeholder="https://..."
                />
                <Input
                  label="Small Text (Above Title)"
                  value={content.hero.small_text}
                  onChange={(e) => handleInputChange('hero', 'small_text', e.target.value)}
                />
                <Input
                  label="Main Title (Optional)"
                  value={content.hero.main_title}
                  onChange={(e) => handleInputChange('hero', 'main_title', e.target.value)}
                />
                <Input
                  label="Subtitle (Optional)"
                  value={content.hero.subtitle}
                  onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Button 1 Text"
                    value={content.hero.button1_text}
                    onChange={(e) => handleInputChange('hero', 'button1_text', e.target.value)}
                  />
                  <Input
                    label="Button 1 Link"
                    value={content.hero.button1_link}
                    onChange={(e) => handleInputChange('hero', 'button1_link', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Button 2 Text"
                    value={content.hero.button2_text}
                    onChange={(e) => handleInputChange('hero', 'button2_text', e.target.value)}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={content.hero.show_video_button}
                      onChange={(e) => handleInputChange('hero', 'show_video_button', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Show Video Button</span>
                  </label>
                </div>
                <Input
                  label="Overlay Opacity (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={content.hero.overlay_opacity}
                  onChange={(e) => handleInputChange('hero', 'overlay_opacity', parseInt(e.target.value))}
                />
                <Button onClick={() => saveSection('hero', content.hero)} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="aspect-video bg-neutral-100 mb-4 rounded overflow-hidden">
                  <img src={content.hero.image} alt="Hero" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-neutral-600">Text: {content.hero.small_text}</p>
              </div>
            )}
          </div>

          {/* Brand Story */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Type size={20} />
                Brand Story Section
              </h3>
              <Button
                onClick={() => setEditingSection(editingSection === 'brand_story' ? null : 'brand_story')}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} />
                {editingSection === 'brand_story' ? 'Close' : 'Edit'}
              </Button>
            </div>
            
            {editingSection === 'brand_story' ? (
              <div className="p-6 space-y-4">
                <Input
                  label="Small Text"
                  value={content.brand_story.small_text}
                  onChange={(e) => handleInputChange('brand_story', 'small_text', e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Main Text
                  </label>
                  <textarea
                    value={content.brand_story.main_text}
                    onChange={(e) => handleInputChange('brand_story', 'main_text', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={content.brand_story.description}
                    onChange={(e) => handleInputChange('brand_story', 'description', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={4}
                  />
                </div>
                <Button onClick={() => saveSection('brand_story', content.brand_story)} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm font-medium mb-2">{content.brand_story.main_text}</p>
                <p className="text-xs text-neutral-600">{content.brand_story.description}</p>
              </div>
            )}
          </div>

          {/* Crafted Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Image size={20} />
                Crafted for You Section
              </h3>
              <Button
                onClick={() => setEditingSection(editingSection === 'crafted' ? null : 'crafted')}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} />
                {editingSection === 'crafted' ? 'Close' : 'Edit'}
              </Button>
            </div>
            
            {editingSection === 'crafted' ? (
              <div className="p-6 space-y-4">
                <Input
                  label="Background Image URL"
                  value={content.crafted_section.background_image}
                  onChange={(e) => handleInputChange('crafted_section', 'background_image', e.target.value)}
                />
                <Input
                  label="Title"
                  value={content.crafted_section.title}
                  onChange={(e) => handleInputChange('crafted_section', 'title', e.target.value)}
                />
                <Input
                  label="Subtitle"
                  value={content.crafted_section.subtitle}
                  onChange={(e) => handleInputChange('crafted_section', 'subtitle', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Button Text"
                    value={content.crafted_section.button_text}
                    onChange={(e) => handleInputChange('crafted_section', 'button_text', e.target.value)}
                  />
                  <Input
                    label="Button Link"
                    value={content.crafted_section.button_link}
                    onChange={(e) => handleInputChange('crafted_section', 'button_link', e.target.value)}
                  />
                </div>
                <Input
                  label="Overlay Opacity (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={content.crafted_section.overlay_opacity}
                  onChange={(e) => handleInputChange('crafted_section', 'overlay_opacity', parseInt(e.target.value))}
                />
                <Button onClick={() => saveSection('crafted_section', content.crafted_section)} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <div className="aspect-video bg-neutral-100 mb-4 rounded overflow-hidden">
                  <img src={content.crafted_section.background_image} alt="Crafted" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-medium">{content.crafted_section.title}</p>
                <p className="text-xs text-neutral-600">{content.crafted_section.subtitle}</p>
              </div>
            )}
          </div>

          {/* Final CTA */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <ShoppingBag size={20} />
                Final CTA Section
              </h3>
              <Button
                onClick={() => setEditingSection(editingSection === 'final_cta' ? null : 'final_cta')}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} />
                {editingSection === 'final_cta' ? 'Close' : 'Edit'}
              </Button>
            </div>
            
            {editingSection === 'final_cta' ? (
              <div className="p-6 space-y-4">
                <Input
                  label="Background Image URL"
                  value={content.final_cta.background_image}
                  onChange={(e) => handleInputChange('final_cta', 'background_image', e.target.value)}
                />
                <Input
                  label="Title"
                  value={content.final_cta.title}
                  onChange={(e) => handleInputChange('final_cta', 'title', e.target.value)}
                />
                <Input
                  label="Subtitle"
                  value={content.final_cta.subtitle}
                  onChange={(e) => handleInputChange('final_cta', 'subtitle', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Button Text"
                    value={content.final_cta.button_text}
                    onChange={(e) => handleInputChange('final_cta', 'button_text', e.target.value)}
                  />
                  <Input
                    label="Button Link"
                    value={content.final_cta.button_link}
                    onChange={(e) => handleInputChange('final_cta', 'button_link', e.target.value)}
                  />
                </div>
                <Input
                  label="Overlay Opacity (%)"
                  type="number"
                  min="0"
                  max="100"
                  value={content.final_cta.overlay_opacity}
                  onChange={(e) => handleInputChange('final_cta', 'overlay_opacity', parseInt(e.target.value))}
                />
                <Button onClick={() => saveSection('final_cta', content.final_cta)} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm font-medium">{content.final_cta.title}</p>
                <p className="text-xs text-neutral-600">{content.final_cta.subtitle}</p>
              </div>
            )}
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                <Award size={20} />
                Benefits Section
              </h3>
              <Button
                onClick={() => setEditingSection(editingSection === 'benefits' ? null : 'benefits')}
                variant="outline"
                size="sm"
              >
                <Edit2 size={16} />
                {editingSection === 'benefits' ? 'Close' : 'Edit'}
              </Button>
            </div>
            
            {editingSection === 'benefits' ? (
              <div className="p-6 space-y-4">
                <Input
                  label="Small Text"
                  value={content.benefits.small_text}
                  onChange={(e) => handleInputChange('benefits', 'small_text', e.target.value)}
                />
                <Input
                  label="Title"
                  value={content.benefits.title}
                  onChange={(e) => handleInputChange('benefits', 'title', e.target.value)}
                />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Benefits</h4>
                  {content.benefits.benefits.map((benefit, index) => (
                    <div key={index} className="border p-4 rounded space-y-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={benefit.icon}
                          onChange={(e) => handleBenefitChange(index, 'icon', e.target.value)}
                          className="px-3 py-2 border border-neutral-300 rounded"
                        >
                          <option value="Award">Award</option>
                          <option value="Truck">Truck</option>
                          <option value="Shield">Shield</option>
                        </select>
                        <Input
                          label=""
                          value={benefit.title}
                          onChange={(e) => handleBenefitChange(index, 'title', e.target.value)}
                          placeholder="Benefit title"
                          className="flex-1"
                        />
                      </div>
                      <textarea
                        value={benefit.description}
                        onChange={(e) => handleBenefitChange(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-sm"
                        rows={2}
                        placeholder="Benefit description..."
                      />
                    </div>
                  ))}
                </div>
                
                <Button onClick={() => saveSection('benefits', content.benefits)} disabled={saving}>
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <p className="text-sm font-medium mb-2">{content.benefits.title}</p>
                <div className="space-y-2">
                  {content.benefits.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-amber-500">•</span>
                      <div>
                        <p className="text-sm font-medium">{benefit.title}</p>
                        <p className="text-xs text-neutral-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h3 className="font-semibold text-amber-900 mb-2">Product Display Settings</h3>
            <p className="text-sm text-amber-800 mb-4">
              Products shown below are already marked to display on the homepage. 
              To add or remove products, edit them in the Products section.
            </p>
          </div>

          {/* Best Sellers Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900">
                Best Sellers (Customer Favorites)
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {groupedProducts.best_sellers?.length || 0} products
              </p>
            </div>
            <div className="p-6">
              {groupedProducts.best_sellers?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {groupedProducts.best_sellers.map(product => (
                    <div key={product.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-square bg-neutral-100">
                        {product.featured_image && (
                          <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        <p className="text-sm text-neutral-600">₦{product.price.toLocaleString()}</p>
                        <p className="text-xs text-neutral-500 mt-1">Position: {product.homepage_position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">
                  No products marked for Best Sellers. Edit products to add them here.
                </p>
              )}
            </div>
          </div>

          {/* New Arrivals Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900">
                New Arrivals
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {groupedProducts.new_arrivals?.length || 0} products
              </p>
            </div>
            <div className="p-6">
              {groupedProducts.new_arrivals?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {groupedProducts.new_arrivals.map(product => (
                    <div key={product.id} className="border rounded-lg overflow-hidden">
                      <div className="aspect-square bg-neutral-100">
                        {product.featured_image && (
                          <img src={product.featured_image} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm line-clamp-2">{product.name}</p>
                        <p className="text-sm text-neutral-600">₦{product.price.toLocaleString()}</p>
                        <p className="text-xs text-neutral-500 mt-1">Position: {product.homepage_position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 text-center py-8">
                  No products marked for New Arrivals. Edit products to add them here.
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to Manage Products on Homepage</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Go to the Products page in the admin dashboard</li>
              <li>• Edit any product you want to show on the homepage</li>
              <li>• Enable "Show on Homepage" toggle</li>
              <li>• Select section: "Best Sellers" or "New Arrivals"</li>
              <li>• Set the position order (lower numbers appear first)</li>
              <li>• Save the product</li>
              <li>• Changes will appear on the homepage immediately</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}