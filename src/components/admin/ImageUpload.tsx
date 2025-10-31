import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Check } from 'lucide-react';
import Button from '../ui/Button';
import { uploadMultipleToCloudinary } from '../../utils/cloudinaryUpload';

interface CloudinaryImage {
  secure_url: string;
  public_id: string;
  is_featured: boolean;
}

interface ImageUploadProps {
  existingImages?: CloudinaryImage[];
  onImagesChange: (images: CloudinaryImage[]) => void;
}

export default function ImageUpload({ existingImages = [], onImagesChange }: ImageUploadProps) {
  const [images, setImages] = useState<CloudinaryImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`);

    try {
      const filesArray = Array.from(files);
      const uploadResults = await uploadMultipleToCloudinary(filesArray);

      const newImages: CloudinaryImage[] = uploadResults.map((result, index) => ({
        secure_url: result.secure_url,
        public_id: result.public_id,
        is_featured: images.length === 0 && index === 0,
      }));

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
      setUploadProgress('Upload complete!');

      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload images. Please try again.';
      
      // Show more detailed error message
      if (errorMessage.includes('Missing Cloudinary')) {
        setUploadProgress('Error: Cloudinary configuration is missing. Please check your environment variables.');
      } else {
        setUploadProgress(`Error: ${errorMessage}`);
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => setUploadProgress(''), 5000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);

    if (images[index].is_featured && updatedImages.length > 0) {
      updatedImages[0].is_featured = true;
    }

    setImages(updatedImages);
    onImagesChange(updatedImages);
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

      {uploadProgress && (
        <div className={`text-sm font-medium ${
          uploadProgress.startsWith('Error:') 
            ? 'text-red-600' 
            : uploadProgress.startsWith('Uploading') || uploadProgress === 'Upload complete!'
            ? 'text-amber-600'
            : 'text-amber-600'
        }`}>
          {uploadProgress}
        </div>
      )}

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
                  src={image.secure_url}
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
