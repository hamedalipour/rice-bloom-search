// Route validation utility
export const logInvalidRouteAccess = (path: string, userAgent?: string) => {
  console.warn(`Invalid route access detected:`, {
    path,
    timestamp: new Date().toISOString(),
    userAgent: userAgent || navigator.userAgent,
  });
  
  // In production, you might want to send this to an analytics service
  // or security monitoring system
};

export const validateRoutePath = (path: string): boolean => {
  // Define valid route patterns
  const validRoutes = [
    '/',
    '/shop',
    '/cart',
    '/blog',
    '/about',
    '/contact',
    '/login',
    '/register',
    '/profile',
    '/admin',
    '/admin/products',
    '/admin/blog',
  ];
  
  // Check exact matches
  if (validRoutes.includes(path)) {
    return true;
  }
  
  // Check dynamic routes
  const dynamicRoutePatterns = [
    /^\/product\/[a-zA-Z0-9-]+$/,  // /product/:slug
    /^\/blog\/[a-zA-Z0-9-]+$/,     // /blog/:slug
  ];
  
  return dynamicRoutePatterns.some(pattern => pattern.test(path));
};

export const getRouteSecurityLevel = (path: string): 'public' | 'protected' | 'admin' => {
  if (path.startsWith('/admin')) {
    return 'admin';
  }
  
  if (['/profile'].includes(path)) {
    return 'protected';
  }
  
  return 'public';
};