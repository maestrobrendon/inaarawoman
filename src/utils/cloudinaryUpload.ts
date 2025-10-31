interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Validate environment variables
const validateCloudinaryConfig = () => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    const missingVars = [];
    if (!CLOUD_NAME) missingVars.push('VITE_CLOUDINARY_CLOUD_NAME');
    if (!UPLOAD_PRESET) missingVars.push('VITE_CLOUDINARY_UPLOAD_PRESET');
    
    throw new Error(
      `Missing Cloudinary environment variables: ${missingVars.join(', ')}\n\n` +
      `Please add these to your .env file:\n` +
      `VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name\n` +
      `VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset`
    );
  }
};

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  // Validate configuration before attempting upload
  validateCloudinaryConfig();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET!);
  formData.append('folder', 'inaara/products');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Upload failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.secure_url || !data.public_id) {
      throw new Error('Invalid response from Cloudinary: missing required fields');
    }

    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    // Re-throw with more context if it's our validation error
    if (error instanceof Error && error.message.includes('Missing Cloudinary')) {
      throw error;
    }
    // Otherwise wrap in a more user-friendly error
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to upload image. Please check your Cloudinary configuration and try again.'
    );
  }
};

export const uploadMultipleToCloudinary = async (
  files: File[]
): Promise<CloudinaryUploadResult[]> => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

export const optimizeCloudinaryUrl = (
  url: string,
  transformations: string = 'w_800,q_auto,f_auto'
): string => {
  if (!url || !url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

export const getThumbnailUrl = (url: string): string => {
  return optimizeCloudinaryUrl(url, 'w_300,h_300,c_fill,q_auto,f_auto');
};

export const getProductImageUrl = (url: string): string => {
  return optimizeCloudinaryUrl(url, 'w_800,q_auto,f_auto');
};

export const getFullImageUrl = (url: string): string => {
  return optimizeCloudinaryUrl(url, 'w_1920,q_auto,f_auto');
};
