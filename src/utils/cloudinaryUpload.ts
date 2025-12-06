interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

// Read environment variables dynamically to ensure they're available
const getCloudinaryConfig = () => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  // Debug logging (only in development)
  if (import.meta.env.DEV) {
    console.log('Cloudinary Config Check:', {
      cloudName: cloudName ? '✓ Set' : '✗ Missing',
      uploadPreset: uploadPreset ? '✓ Set' : '✗ Missing',
      allEnvKeys: Object.keys(import.meta.env).filter(key => key.includes('CLOUDINARY'))
    });
  }
  
  return { cloudName, uploadPreset };
};

// Validate environment variables
const validateCloudinaryConfig = () => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  
  if (!cloudName || !uploadPreset) {
    const missingVars = [];
    if (!cloudName) missingVars.push('VITE_CLOUDINARY_CLOUD_NAME');
    if (!uploadPreset) missingVars.push('VITE_CLOUDINARY_UPLOAD_PRESET');
    
    const errorMessage = `Missing Cloudinary environment variables: ${missingVars.join(', ')}. ` +
      `Please ensure these are set in your Vercel environment variables (Settings → Environment Variables) ` +
      `and redeploy your application.`;
    
    console.error('Cloudinary Configuration Error:', {
      missingVars,
      allCloudinaryVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_CLOUDINARY')),
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV
    });
    
    throw new Error(errorMessage);
  }
  
  return { cloudName, uploadPreset };
};

export const uploadToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  // Validate configuration before attempting upload
  const { cloudName, uploadPreset } = validateCloudinaryConfig();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'inaara/products');

  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    if (import.meta.env.DEV) {
      console.log('Uploading to Cloudinary:', {
        cloudName,
        uploadPreset,
        folder: 'inaara/products',
        fileName: file.name,
        fileSize: file.size
      });
    }
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

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
  // Safety check - ensure url is a string
  if (!url || typeof url !== 'string') return '';
  if (!url.includes('cloudinary.com')) return url;

  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  return `${parts[0]}/upload/${transformations}/${parts[1]}`;
};

export const getThumbnailUrl = (image: any): string => {
  const url = extractImageUrl(image);
  return optimizeCloudinaryUrl(url, 'w_300,h_300,c_fill,q_auto,f_auto');
};

/**
 * Extract raw URL from any image input without optimization
 * Handles: strings, objects with image_url/cloudinary_url, arrays, null, undefined
 */
export const extractImageUrl = (image: any): string => {
  // Handle null/undefined
  if (!image) return '';
  
  // Handle string URLs directly
  if (typeof image === 'string') return image;
  
  // Handle array (return first item)
  if (Array.isArray(image) && image.length > 0) {
    return extractImageUrl(image[0]);
  }
  
  // Handle object with various URL properties
  if (typeof image === 'object' && image !== null) {
    return image.cloudinary_url 
      || image.image_url 
      || image.secure_url
      || image.url 
      || image.src 
      || image.main_image
      || '';
  }
  
  return '';
};

/**
 * Safely extracts URL from various input types and optimizes it
 * Handles: strings, objects with image_url/cloudinary_url, arrays, null, undefined
 */
export const getProductImageUrl = (image: any): string => {
  const url = extractImageUrl(image);
  if (!url) return '';
  return optimizeCloudinaryUrl(url, 'w_800,q_auto,f_auto');
};

/**
 * Get full resolution image URL
 */
export const getFullImageUrl = (image: any): string => {
  const url = extractImageUrl(image);
  if (!url) return '';
  return optimizeCloudinaryUrl(url, 'w_1920,q_auto,f_auto');
};