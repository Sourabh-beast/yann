import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.provider ? { ...data.provider, role: 'provider' } : null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Provider session check failed:', err);
      }

      try {
        const res = await fetch('/api/homeowner/me', { credentials: 'include', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setUser(data.homeowner ? { ...data.homeowner, role: 'homeowner' } : null);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Resident session check failed:', err);
      }

      setUser(null);
      setLoading(false);
    }

    checkSession();
  }, []);
  const role = user?.role || null;

  return { user, role, loading, isLoggedIn: !!user };
}
