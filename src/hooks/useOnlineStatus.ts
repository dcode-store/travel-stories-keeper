import { useState, useEffect, useCallback } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(() => 
    typeof navigator !== 'undefined' && navigator.onLine ? new Date() : null
  );

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setLastOnline(new Date());
    // If we were offline and now online, set wasOffline flag
    // This can be used to trigger sync
    if (!navigator.onLine === false) {
      setWasOffline(true);
      // Reset after a short delay
      setTimeout(() => setWasOffline(false), 5000);
    }
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline, lastOnline };
}
