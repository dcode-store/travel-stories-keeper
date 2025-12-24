import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LAST_ROUTE_KEY = 'journo-last-route';
const VALID_ROUTES = ['/', '/trips'];

export function useLastRoute() {
  const location = useLocation();

  // Save current route whenever it changes
  useEffect(() => {
    if (VALID_ROUTES.includes(location.pathname)) {
      localStorage.setItem(LAST_ROUTE_KEY, location.pathname);
    }
  }, [location.pathname]);
}

export function useRedirectToLastRoute() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if we're on the root path
    if (location.pathname === '/') {
      const lastRoute = localStorage.getItem(LAST_ROUTE_KEY);
      if (lastRoute && lastRoute !== '/' && VALID_ROUTES.includes(lastRoute)) {
        navigate(lastRoute, { replace: true });
      }
    }
  }, []);
}

export function getLastRoute(): string {
  return localStorage.getItem(LAST_ROUTE_KEY) || '/';
}