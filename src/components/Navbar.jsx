"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import ServiceProviderRegistration from "./registration/Modal";
import LoginModal from "./LoginModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const sessionRequestIdRef = useRef(0);
  const isActiveLink = useCallback((href, options = {}) => {
    const { exact = false } = options;
    if (!pathname) return false;
    if (href === '/') {
      return pathname === '/';
    }
    if (exact) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }, [pathname]);

  const fetchSession = useCallback(async () => {
    const requestId = ++sessionRequestIdRef.current;
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (requestId !== sessionRequestIdRef.current) {
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setIsLoggedIn(true);
        setUserName(data.provider?.name || 'User');
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      if (requestId === sessionRequestIdRef.current) {
        setIsLoggedIn(false);
        setUserName('');
      }
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const handleAuthLogout = () => {
      sessionRequestIdRef.current += 1;
      setIsLoggedIn(false);
      setUserName('');
      setIsMenuOpen(false);
      setIsLoginModalOpen(false);
    };

    const handleAuthRefresh = () => {
      fetchSession();
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    window.addEventListener('auth:refresh', handleAuthRefresh);

    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
      window.removeEventListener('auth:refresh', handleAuthRefresh);
    };
  }, [fetchSession]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const openRegistrationModal = () => {
    setIsRegistrationModalOpen(true);
    setIsMenuOpen(false);
  };
  const closeRegistrationModal = () => setIsRegistrationModalOpen(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const handleLogout = async () => {
    sessionRequestIdRef.current += 1; // invalidate in-flight session fetches
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch (err) {
      console.error('Error during logout:', err);
    }

    setIsLoggedIn(false);
    setUserName('');
    setIsMenuOpen(false);
    setIsLoginModalOpen(false);
    router.push('/');
    router.refresh();
    window.dispatchEvent(new Event('auth:logout'));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center transition-all duration-300 hover:scale-105"
            >
              <Image
                src="/logo.svg"
                alt="YANN - Your Ride, Your Way"
                width={787}
                height={262}
                className="h-15 w-auto position-absolute z-1"

                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/"
                    className={`relative group font-medium transition-colors duration-300 ${isActiveLink('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    Home
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${isActiveLink('/') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>

                  <Link
                    href="/services"
                    className={`relative group font-medium transition-colors duration-300 ${isActiveLink('/services') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    Services
                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${isActiveLink('/services') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>

                  {/* Login Button */}
                  <button
                    onClick={openLoginModal}
                    className="text-blue-600 border border-blue-600 px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-blue-600 hover:text-white"
                  >
                    Login
                  </button>

                  {/* Partner Registration Button */}
                  <button
                    onClick={openRegistrationModal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                  >
                    Partner Registration
                  </button>
                </>
              ) : (
                <>
                  {[{
                    label: 'Dashboard',
                    href: '/dashboard',
                    exactMatch: true
                  }, {
                    label: 'Bookings',
                    href: '/dashboard/bookings'
                  }, {
                    label: 'Manage Services',
                    href: '/dashboard/services'
                  }, {
                    label: 'Profile',
                    href: '/dashboard/profile'
                  }, {
                    label: 'Earnings',
                    href: '/dashboard/earnings'
                  }, {
                    label: 'Support',
                    href: '/support'
                  }].map((item) => {
                    const active = isActiveLink(item.href, { exact: item.exactMatch });
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`relative group font-medium transition-colors duration-300 ${active ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                      >
                        {item.label}
                        <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${active ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                      </Link>
                    );
                  })}

                  {/* User Menu */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-700 font-medium">{userName}</span>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="text-red-600 border border-red-600 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:bg-red-600 hover:text-white flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 group"
            >
              <span
                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                  isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
              ></span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <div className="py-4 space-y-4 border-t border-gray-100">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/"
                    className={`block font-medium transition-colors duration-300 py-2 ${isActiveLink('/') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Home
                  </Link>

                  <Link
                    href="/services"
                    className={`block font-medium transition-colors duration-300 py-2 ${isActiveLink('/services') ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Services
                  </Link>

                  {/* Mobile Login Button */}
                  <button
                    onClick={openLoginModal}
                    className="block w-full text-center text-blue-600 border border-blue-600 px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-blue-600 hover:text-white"
                  >
                    Login
                  </button>

                  {/* Partner Registration Button */}
                  <button
                    onClick={openRegistrationModal}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 mt-2"
                  >
                    Partner Registration
                  </button>
                </>
              ) : (
                <>
                  {[{
                    label: 'Dashboard',
                    href: '/dashboard',
                    exactMatch: true
                  }, {
                    label: 'Bookings',
                    href: '/dashboard/bookings'
                  }, {
                    label: 'Manage Services',
                    href: '/dashboard/services'
                  }, {
                    label: 'Profile',
                    href: '/dashboard/profile'
                  }, {
                    label: 'Earnings',
                    href: '/dashboard/earnings'
                  }, {
                    label: 'Support',
                    href: '/support'
                  }].map((item) => {
                    const active = isActiveLink(item.href, { exact: item.exactMatch });
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block font-medium transition-colors duration-300 py-2 ${active ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-700 font-medium">{userName}</span>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-center text-red-600 border border-red-600 px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-red-600 hover:text-white"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Registration Modal */}
      {isRegistrationModalOpen && (
        <div className="fixed inset-0 z-50">
          <ServiceProviderRegistration
            isOpen={isRegistrationModalOpen}
            onClose={closeRegistrationModal}
          />
        </div>
      )}

      {/* ✅ Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50">
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={closeLoginModal}
            onLoginSuccess={() => {
              fetchSession();
            }}
          />
        </div>
      )}
    </>
  );
}
