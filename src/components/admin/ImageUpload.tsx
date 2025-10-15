import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../ui/Button';

interface UploadedImage {
  id?: string;
  url: string;
  storage_path: string;
  is_featured: boolean;
  position: number;
}

interface ImageUploadProps {
  productId?: string;
  existingImages?: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
}

export default function ImageUpload({ productId, existingImages = [], onImagesChange }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newImages: UploadedImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        newImages.push({
          url: publicUrl,
          storage_path: filePath,
          is_featured: images.length === 0 && i === 0,
          position: images.length + i,
        });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (index: number) => {
    const imageToRemove = images[index];

    try {
      if (imageToRemove.storage_path) {
        await supabase.storage
          .from('product-images')
          .remove([imageToRemove.storage_path]);
      }

      if (imageToRemove.id && productId) {
        await supabase
          .from('product_images')
          .delete()
          .eq('id', imageToRemove.id);
      }

      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Failed to remove image');
    }
  };

  const handleSetFeatured = (index: number) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      is_featured: i === index,
    }));
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-neutral-700">
          Product Images
        </label>
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          variant="outline"
          className="gap-2"
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Images'}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-12 text-center">
          <ImageIcon className="mx-auto text-neutral-400 mb-4" size={48} />
          <p className="text-neutral-600 mb-2">No images uploaded</p>
          <p className="text-sm text-neutral-500">
            Click "Upload Images" to add product photos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {image.is_featured && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                  <Check size={12} />
                  Featured
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                {!image.is_featured && (
                  <button
                    type="button"
                    onClick={() => handleSetFeatured(index)}
                    className="p-2 bg-white rounded-lg hover:bg-neutral-100 transition-colors"
                    title="Set as featured"
                  >
                    <Check size={16} className="text-amber-500" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-2 bg-white rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove image"
                >
                  <X size={16} className="text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        The first image will be set as featured by default. You can change it by clicking the check icon.
      </p>
    </div>
  );
}
