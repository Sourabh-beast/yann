"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import ServiceProviderRegistration from "./registration/Modal";
import LoginModal from "./LoginModal";
import ChangeProfilePictureModal from "./profile/ChangeProfilePictureModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if we're on admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userAvatar, setUserAvatar] = useState("");
  const [userId, setUserId] = useState("");
  const [isResidentVerified, setIsResidentVerified] = useState(false);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSignupChoiceOpen, setIsSignupChoiceOpen] = useState(false);
  const [isLoginChoiceOpen, setIsLoginChoiceOpen] = useState(false);
  const [loginType, setLoginType] = useState('partner'); // 'partner' or 'member'
  const [loginIntent, setLoginIntent] = useState('login'); // 'login' or 'signup'
  const sessionRequestIdRef = useRef(0);
  const userMenuRef = useRef(null);
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

  const resetUserSession = useCallback(() => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUserName('');
    setUserEmail('');
    setUserAvatar('');
    setUserId('');
    setIsResidentVerified(false);
  }, []);

  const fetchSession = useCallback(async () => {
    const requestId = ++sessionRequestIdRef.current;
    let applied = false;

    const hydrateProvider = (payload) => {
      setIsLoggedIn(true);
      setUserRole('provider');
      setUserName(payload.provider?.name || 'Partner');
      setUserEmail(payload.provider?.email || '');
      setUserAvatar(payload.provider?.profileImage || '');
      setUserId(payload.provider?.id || payload.provider?._id || '');
      setIsResidentVerified(false);
      applied = true;
    };

    const hydrateResident = (payload) => {
      setIsLoggedIn(true);
      setUserRole('resident');
      setUserName(payload.homeowner?.name || 'Resident');
      setUserEmail(payload.homeowner?.email || '');
      setUserAvatar(payload.homeowner?.avatar || '');
      setUserId(payload.homeowner?.id || payload.homeowner?._id || '');
      setIsResidentVerified(Boolean(payload.homeowner?.aadhaarVerified || payload.homeowner?.isVerified));
      applied = true;
    };

    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (requestId === sessionRequestIdRef.current && res.ok) {
        const data = await res.json();
        hydrateProvider(data);
      }
    } catch (err) {
      console.error('Error fetching partner session:', err);
    }

    if (!applied) {
      try {
        const res = await fetch('/api/homeowner/me', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (requestId === sessionRequestIdRef.current && res.ok) {
          const data = await res.json();
          hydrateResident(data);
        }
      } catch (err) {
        console.error('Error fetching resident session:', err);
      }
    }

    if (requestId === sessionRequestIdRef.current && !applied) {
      resetUserSession();
    }
  }, [resetUserSession]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleAuthLogout = () => {
      sessionRequestIdRef.current += 1;
      resetUserSession();
      setIsMenuOpen(false);
      setIsLoginModalOpen(false);
      setIsUserMenuOpen(false);
      setIsProfileModalOpen(false);
      setIsLogoutConfirmOpen(false);
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
  }, [fetchSession, resetUserSession]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const openSignupChoice = () => {
    setIsSignupChoiceOpen(true);
    setIsMenuOpen(false);
  };
  const closeSignupChoice = () => setIsSignupChoiceOpen(false);

  const openLoginChoice = () => {
    setIsLoginChoiceOpen(true);
    setIsMenuOpen(false);
  };
  const closeLoginChoice = () => setIsLoginChoiceOpen(false);

  const handleLoginAsPartner = () => {
    setIsLoginChoiceOpen(false);
    setLoginType('partner');
    setLoginIntent('login');
    setIsLoginModalOpen(true);
  };

  const handleLoginAsMember = () => {
    setIsLoginChoiceOpen(false);
    setLoginType('member');
    setLoginIntent('login');
    setIsLoginModalOpen(true);
  };

  const handleSignupAsPartner = () => {
    setIsSignupChoiceOpen(false);
    setIsRegistrationModalOpen(true);
  };

  const handleSignupAsMember = () => {
    setIsSignupChoiceOpen(false);
    setLoginType('member');
    setLoginIntent('signup');
    setIsLoginModalOpen(true);
  };

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
      const endpoint = userRole === 'resident' ? '/api/homeowner/logout' : '/api/auth/logout';
      await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
      });
    } catch (err) {
      console.error('Error during logout:', err);
    }

    resetUserSession();
    setIsMenuOpen(false);
    setIsLoginModalOpen(false);
    setIsUserMenuOpen(false);
    setIsLogoutConfirmOpen(false);
    setIsProfileModalOpen(false);
    router.push('/');
    router.refresh();
    window.dispatchEvent(new Event('auth:logout'));
  };

  const navigateFromMenu = useCallback((path) => {
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    router.push(path);
  }, [router]);

  const handleResidentVerification = useCallback(async () => {
    if (!userId || userRole !== 'resident') return;
    if (isResidentVerified || isVerificationLoading) return;

    setIsVerificationLoading(true);
    try {
      const returnUrl = typeof window !== 'undefined' ? window.location.href : '';
      const res = await fetch('/api/verification/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          userType: 'homeowner',
          returnUrl
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success || !data?.url) {
        alert(data?.message || 'Unable to start verification');
        return;
      }

      setIsUserMenuOpen(false);
      window.location.href = data.url;
    } catch (error) {
      console.error('Verification initiation failed:', error);
      alert('Unable to start verification. Please try again.');
    } finally {
      setIsVerificationLoading(false);
    }
  }, [userId, userRole, isResidentVerified, isVerificationLoading]);

  const partnerNavItems = [
    { label: 'Dashboard', href: '/dashboard', exactMatch: true },
    { label: 'Bookings', href: '/dashboard/bookings' },
    { label: 'Manage Services', href: '/dashboard/services' },
    { label: 'Profile', href: '/dashboard/profile' },
    { label: 'Earnings', href: '/dashboard/earnings' },
    { label: 'Support', href: '/support' },
  ];

  const residentNavItems = [
    { label: 'Resident Hub', href: '/resident', exactMatch: true },
    { label: 'Browse Services', href: '/my-services' },
    { label: 'Requests', href: '/resident/requests' },
    { label: 'Saved Pros', href: '/resident/favorites' },
    { label: 'Support', href: '/support' },
  ];

  const currentNavItems = userRole === 'resident' ? residentNavItems : partnerNavItems;

  // Render admin navbar (minimal, no buttons)
  if (isAdminRoute) {
    return (
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Non-clickable */}
            <div className="flex items-center">
              <Image
                src="/logo.svg"
                alt="YANN - Your Ride, Your Way"
                width={787}
                height={262}
                className="h-15 w-auto position-absolute z-1"
                priority
              />
            </div>

            {/* Admin Badge Only */}
            <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

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
                    onClick={openLoginChoice}
                    className="text-blue-600 border border-blue-600 px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-blue-600 hover:text-white"
                  >
                    Login
                  </button>

                  {/* Sign Up Button */}
                  <button
                    onClick={openSignupChoice}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  {currentNavItems.map((item) => {
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
                  <div className="relative" ref={userMenuRef}>
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen((prev) => !prev)}
                      className="flex items-center gap-3 rounded-full border border-transparent bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-2 pr-4 transition hover:border-blue-200"
                      aria-haspopup="true"
                      aria-expanded={isUserMenuOpen}
                    >
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={`${userName}'s avatar`}
                          className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white">
                          {(userName || 'Y').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="hidden sm:flex flex-col items-start leading-4">
                        <span className="text-sm font-semibold text-gray-800">{userName}</span>
                        {isUserMenuOpen && userEmail ? <span className="text-xs text-gray-500">{userEmail}</span> : null}
                      </span>
                      <svg className={`h-4 w-4 text-gray-500 transition ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                      </svg>
                    </button>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-sm font-semibold text-gray-900">{userName}</p>
                          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">
                            {userRole === 'resident' ? 'Resident space' : 'Partner account'}
                          </p>
                          {userEmail ? <p className="text-xs text-gray-500">{userEmail}</p> : null}
                          {userRole === 'resident' && isResidentVerified && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Verified
                            </div>
                          )}
                        </div>
                        <div className="py-1">
                          {userRole === 'provider' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsUserMenuOpen(false);
                                  setIsProfileModalOpen(true);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v14m7-7H5" />
                                </svg>
                                <span>Change profile picture</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => navigateFromMenu('/dashboard/profile')}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A4 4 0 018 16h8a4 4 0 012.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>View partner profile</span>
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => navigateFromMenu('/resident/requests')}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h16M4 12h16M4 17h10" />
                                </svg>
                                <span>My service requests</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => navigateFromMenu('/resident/favorites')}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 5.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>Saved experts</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => navigateFromMenu('/resident/profile')}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Resident profile</span>
                              </button>
                              {isResidentVerified ? (
                                <div className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-emerald-700">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Verified</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleResidentVerification}
                                  disabled={isVerificationLoading}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l7 4v5c0 5-3.5 9-7 9s-7-4-7-9V7l7-4z" />
                                  </svg>
                                  <span>{isVerificationLoading ? 'Starting verification...' : 'Verify documents'}</span>
                                </button>
                              )}
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsLogoutConfirmOpen(true);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
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
                    onClick={openLoginChoice}
                    className="block w-full text-center text-blue-600 border border-blue-600 px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:bg-blue-600 hover:text-white"
                  >
                    Login
                  </button>

                  {/* Sign Up Button */}
                  <button
                    onClick={openSignupChoice}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 mt-2"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  {currentNavItems.map((item) => {
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

                  <div className="flex items-center space-x-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={`${userName}'s avatar`}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-base font-bold text-white">
                        {(userName || 'Y').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-800">{userName}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-blue-500">
                        {userRole === 'resident' ? 'Resident space' : 'Partner account'}
                      </span>
                      {userEmail ? <span className="text-xs text-gray-500">{userEmail}</span> : null}
                    </div>
                  </div>

                  {userRole === 'provider' ? (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsProfileModalOpen(true);
                        }}
                        className="block w-full rounded-full border border-blue-200 px-6 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Change profile picture
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/dashboard/profile');
                        }}
                        className="block w-full rounded-full border border-blue-200 px-6 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Partner profile
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/resident/requests');
                        }}
                        className="block w-full rounded-full border border-blue-200 px-6 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        My service requests
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/resident/favorites');
                        }}
                        className="block w-full rounded-full border border-blue-200 px-6 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                      >
                        Saved experts
                      </button>
                      {isResidentVerified ? (
                        <div className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-2.5 text-center text-sm font-semibold text-emerald-700">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleResidentVerification();
                          }}
                          disabled={isVerificationLoading}
                          className="block w-full rounded-full border border-blue-200 px-6 py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isVerificationLoading ? 'Starting verification...' : 'Verify documents'}
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="block w-full rounded-full border border-red-600 px-6 py-2.5 text-center text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
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
            defaultPanel={loginType === 'member' ? 'resident' : 'partner'}
            intent={loginIntent}
          />
        </div>
      )}

      {isProfileModalOpen && userRole === 'provider' && (
        <ChangeProfilePictureModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onSuccess={(updatedImage) => {
            setUserAvatar(updatedImage);
            setTimeout(() => {
              window.dispatchEvent(new Event('auth:refresh'));
            }, 0);
          }}
        />
      )}

      {/* Login Choice Modal */}
      {isLoginChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Welcome Back</h3>
              <button
                onClick={closeLoginChoice}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">How would you like to login?</p>
            
            <div className="space-y-4">
              {/* Login as Partner */}
              <button
                onClick={handleLoginAsPartner}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Login as Partner</h4>
                  <p className="text-sm text-gray-500">Access your service provider dashboard</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Login as Member */}
              <button
                onClick={handleLoginAsMember}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Login as Member</h4>
                  <p className="text-sm text-gray-500">Access your resident account</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  setIsLoginChoiceOpen(false);
                  setIsSignupChoiceOpen(true);
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Sign Up Choice Modal */}
      {isSignupChoiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Join YANN</h3>
              <button
                onClick={closeSignupChoice}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">Choose how you want to join our platform</p>
            
            <div className="space-y-4">
              {/* Sign up as Partner */}
              <button
                onClick={handleSignupAsPartner}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Sign up as Partner</h4>
                  <p className="text-sm text-gray-500">Offer your services and grow your business</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Sign up as Member */}
              <button
                onClick={handleSignupAsMember}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Sign up as Member</h4>
                  <p className="text-sm text-gray-500">Book services for your home easily</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsSignupChoiceOpen(false);
                  setIsLoginModalOpen(true);
                }}
                className="text-blue-600 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      )}

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L4.34 17c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to logout?</h3>
                <p className="mt-1 text-sm text-gray-600">You will need to enter your email and OTP again to access your account.</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Never mind
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutConfirmOpen(false);
                  handleLogout();
                }}
                className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
