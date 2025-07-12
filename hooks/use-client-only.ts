import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if component is mounted on client side
 * Prevents hydration mismatches by returning false on server-side render
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Custom hook to safely access window object
 * Returns undefined on server-side render
 */
export function useWindowSafe() {
  const [windowObj, setWindowObj] = useState<Window | undefined>(undefined);

  useEffect(() => {
    setWindowObj(window);
  }, []);

  return windowObj;
} 