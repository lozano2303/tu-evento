import { useState, useEffect } from 'react';

export const useImageCarousel = (eventImages) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % eventImages.length);
    setAutoplay(false); // Pause autoplay on manual interaction
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + eventImages.length) % eventImages.length);
    setAutoplay(false); // Pause autoplay on manual interaction
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
    setAutoplay(false); // Pause autoplay on manual interaction
  };

  // Autoplay functionality
  useEffect(() => {
    if (autoplay && eventImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % eventImages.length);
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [autoplay, eventImages.length]);

  // Resume autoplay after 5 seconds of inactivity
  useEffect(() => {
    if (!autoplay && eventImages.length > 1) {
      const timeout = setTimeout(() => {
        setAutoplay(true);
      }, 5000); // Resume after 5 seconds

      return () => clearTimeout(timeout);
    }
  }, [autoplay, eventImages.length]);

  return {
    currentImageIndex,
    autoplay,
    nextImage,
    prevImage,
    goToImage
  };
};