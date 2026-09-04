import { useEffect, useMemo, useRef, useState } from 'react';
import { Settings as SettingsIcon, Save, DollarSign, Package, Truck, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { useUnsavedGuard } from '../../hooks/useUnsavedGuard';
import { clearStoreSettingsCache } from '../../lib/storeSettings';

export default function Settings() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const originalRef = useRef<string>('{}');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const dirty = useMemo(() => JSON.stringify(settings) !== originalRef.current, [settings]);
  useUnsavedGuard(dirty);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('store_settings')
        .select('*');

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach(setting => {
        try {
          settingsMap[setting.key] = JSON.parse(setting.value);
        } catch {
          settingsMap[setting.key] = setting.value;
        }
      });

      setSettings(settingsMap);
      originalRef.current = JSON.stringify(settingsMap);
    } catch (error) {
      console.error('Error loading settings:', error);
      showToast('Could not load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('store_settings')
          .upsert({
            key: update.key,
            value: update.value,
            category: getCategoryForKey(update.key),
            description: getDescriptionForKey(update.key),
          });

        if (error) throw error;
      }

      originalRef.current = JSON.stringify(settings);
      clearStoreSettingsCache();
      showToast('Settings saved', 'success');
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to save settings',
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  const getCategoryForKey = (key: string): string => {
    if (key.includes('email')) return 'general';
    if (key.includes('tax') || key.includes('currency')) return 'pricing';
    if (key.includes('stock')) return 'inventory';
    if (key.includes('shipping')) return 'shipping';
    return 'general';
  };

  const getDescriptionForKey = (key: string): string => {
    const descriptions: Record<string, string> = {
      store_name: 'Store name',
      store_email: 'Store contact email',
      store_phone: 'Store contact phone',
      store_whatsapp: 'WhatsApp number for order follow-up',
      store_address: 'Store address',
      store_currency: 'Store currency',
      tax_rate: 'Default tax rate percentage',
      low_stock_threshold: 'Low stock alert threshold',
      enable_shipping: 'Enable shipping calculations',
      free_shipping_threshold: 'Minimum order for free shipping',
    };
    return descriptions[key] || '';
  };

  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'shipping', label: 'Shipping', icon: Truck },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 flex items-center gap-2">
            <SettingsIcon className="text-amber-500" size={28} />
            Store Settings
          </h1>
          <p className="text-neutral-600 mt-1">Manage your store configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !dirty} className="gap-2">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {dirty && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <AlertCircle className="text-amber-600" size={18} />
          <p className="text-sm text-amber-800">You have unsaved changes</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-neutral-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">General Settings</h2>

              <Input
                label="Store Name"
                value={settings.store_name || ''}
                onChange={(e) => handleChange('store_name', e.target.value)}
                placeholder="Inaara Woman"
                helperText="Shows in the footer copyright line."
              />

              <Input
                label="Store Email"
                type="email"
                value={settings.store_email || ''}
                onChange={(e) => handleChange('store_email', e.target.value)}
                placeholder="info@inaarawoman.com"
                helperText="Shows on the Contact page and in the footer."
              />

              <Input
                label="Store Phone"
                value={settings.store_phone || ''}
                onChange={(e) => handleChange('store_phone', e.target.value)}
                placeholder="+234 XXX XXX XXXX"
                helperText="Shown on Contact / footer when set. Leave blank to hide."
              />

              <Input
                label="WhatsApp Number"
                value={settings.store_whatsapp || ''}
                onChange={(e) => handleChange('store_whatsapp', e.target.value)}
                placeholder="+234 XXX XXX XXXX"
                helperText="Used in the order-confirmation email's 'Need help?' button (wa.me link) and the footer. Falls back to Store Phone if blank."
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Store Address
                </label>
                <textarea
                  value={settings.store_address || ''}
                  onChange={(e) => handleChange('store_address', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="Enter store address..."
                />
                <p className="mt-1 text-xs text-neutral-400">
                  Shown on the Contact page when set.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">Pricing Settings</h2>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Currency
                </label>
                <select
                  value={settings.store_currency || 'NGN'}
                  onChange={(e) => handleChange('store_currency', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="NGN">Nigerian Naira (₦)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
                <p className="mt-1 text-xs text-neutral-400">
                  Storefront currency is chosen by the shopper via the header switcher — this
                  is a reference default only.
                </p>
              </div>

              <Input
                label="Tax Rate (%)"
                type="number"
                value={settings.tax_rate || 0}
                onChange={(e) => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
                placeholder="0"
                helperText="Added as a line on checkout when 'Enable tax calculations' is on."
              />

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enable_tax"
                  checked={settings.enable_tax || false}
                  onChange={(e) => handleChange('enable_tax', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="enable_tax" className="text-sm text-neutral-700">
                  Enable tax calculations
                </label>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">Inventory Settings</h2>

              <Input
                label="Low Stock Threshold"
                type="number"
                value={settings.low_stock_threshold || 5}
                onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value) || 5)}
                placeholder="5"
                helperText="Alert when stock falls below this number"
              />

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <input
                  type="checkbox"
                  id="track_inventory"
                  checked={settings.track_inventory !== false}
                  onChange={(e) => handleChange('track_inventory', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="track_inventory" className="text-sm text-neutral-700">
                  Track inventory levels
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <input
                  type="checkbox"
                  id="allow_backorders"
                  checked={settings.allow_backorders || false}
                  onChange={(e) => handleChange('allow_backorders', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="allow_backorders" className="text-sm text-neutral-700">
                  Allow backorders when out of stock
                </label>
              </div>

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <input
                  type="checkbox"
                  id="email_low_stock"
                  checked={settings.email_low_stock || false}
                  onChange={(e) => handleChange('email_low_stock', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="email_low_stock" className="text-sm text-neutral-700">
                  Email alerts for low stock items
                </label>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900">Shipping Settings</h2>

              <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-700">
                Checkout rates are calculated per delivery zone (Nigerian states +
                international zones) in code. The <strong>Free Shipping Threshold</strong>{' '}
                below overrides those to ₦0 for large orders; the other fields here are
                not yet applied at checkout.
              </p>

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enable_shipping"
                  checked={settings.enable_shipping !== false}
                  onChange={(e) => handleChange('enable_shipping', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="enable_shipping" className="text-sm text-neutral-700">
                  Enable shipping calculations
                </label>
              </div>

              <Input
                label="Default Shipping Rate (₦)"
                type="number"
                value={settings.default_shipping_rate || 0}
                onChange={(e) => handleChange('default_shipping_rate', parseFloat(e.target.value) || 0)}
                placeholder="0"
                helperText="Not applied at checkout (zone rates are used instead)."
              />

              <Input
                label="Free Shipping Threshold (₦)"
                type="number"
                value={settings.free_shipping_threshold || 0}
                onChange={(e) => handleChange('free_shipping_threshold', parseFloat(e.target.value) || 0)}
                placeholder="0"
                helperText="Orders at/above this subtotal ship free. Set 0 to disable."
              />

              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg">
                <input
                  type="checkbox"
                  id="enable_local_pickup"
                  checked={settings.enable_local_pickup || false}
                  onChange={(e) => handleChange('enable_local_pickup', e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="enable_local_pickup" className="text-sm text-neutral-700">
                  Enable local pickup option
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Shipping Policy
                </label>
                <textarea
                  value={settings.shipping_policy || ''}
                  onChange={(e) => handleChange('shipping_policy', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={4}
                  placeholder="Enter your shipping policy..."
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save size={16} />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
