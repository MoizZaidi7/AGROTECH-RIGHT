import axiosInstance from './axiosConfig';

// Track page views for analytics
export const trackPageView = async (pagePath) => {
  try {
    await axiosInstance.post('/reports/track-page', {
      page: pagePath,
      referrer: document.referrer || 'direct',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience for analytics failures
    console.debug('Page tracking error:', error.message);
  }
};

// Hook to use in React components
export const usePageTracking = () => {
  return trackPageView;
};
