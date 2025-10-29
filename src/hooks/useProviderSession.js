'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const SESSION_ENDPOINT = "/api/auth/me";

export default function useProviderSession({ autoRedirect = true } = {}) {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  const fetchSession = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(SESSION_ENDPOINT, {
        credentials: "include",
        cache: "no-store",
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setProvider(data.provider || null);
      } else {
        setProvider(null);
        if (autoRedirect && typeof window !== "undefined") {
          router.push("/");
        }
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setProvider(null);
        setError(err instanceof Error ? err.message : "Unable to fetch session");
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [autoRedirect, router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchSession();
    };

    const handleLogout = () => {
      requestIdRef.current += 1;
      setProvider(null);
      setLoading(false);
      if (autoRedirect) {
        router.push("/");
      }
    };

    window.addEventListener("auth:refresh", handleRefresh);
    window.addEventListener("auth:logout", handleLogout);

    return () => {
      window.removeEventListener("auth:refresh", handleRefresh);
      window.removeEventListener("auth:logout", handleLogout);
    };
  }, [autoRedirect, fetchSession, router]);

  return { provider, loading, error, refresh: fetchSession };
}
