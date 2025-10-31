import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  productName: string;
  onImageClick?: () => void;
}

export default function ImageSlider({ images, productName, onImageClick }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-400 text-sm">No image available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image with Slider */}
      <div className="relative aspect-[3/4] bg-white rounded-lg overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${productName} - Image ${currentIndex + 1}`}
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={onImageClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </AnimatePresence>

        {/* Zoom Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={20} />
        </div>

        {/* Navigation Arrows (only show if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-neutral-900" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-neutral-900" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation (Vertical on left side) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? 'border-neutral-900 shadow-md'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Full Screen Image Modal Component
interface ImageModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  productName: string;
}

export function ImageModal({ images, currentIndex, onClose, productName }: ImageModalProps) {
  const [index, setIndex] = useState(currentIndex);

  const nextImage = () => {
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-neutral-300 transition-colors z-10"
        aria-label="Close"
      >
        <X size={32} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-4">
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            alt={`${productName} - Full size image ${index + 1}`}
            className="max-w-full max-h-full object-contain"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          />
        </AnimatePresence>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
      </div>
    </motion.div>
  );
}