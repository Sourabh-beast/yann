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
          setUser(data.provider || null);
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
          setUser(data.homeowner || null);
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

  return { user, loading, isLoggedIn: !!user };
}
