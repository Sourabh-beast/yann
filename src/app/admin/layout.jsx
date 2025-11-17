'use client'
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    verifyAuth();
  }, [pathname]);

  const verifyAuth = async () => {
    try {
      const res = await fetch('/api/admin/verify');
      const data = await res.json();

      if (data.success && data.authenticated) {
        setIsAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
    } catch (error) {
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  // Show login page without check
  if (pathname === '/admin/login') {
    return children;
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show children only if authenticated
  if (!isAuthenticated) {
    return null;
  }

  return children;
}
