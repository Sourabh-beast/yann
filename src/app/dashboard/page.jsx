'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);

  const fetchProvider = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });

      if (res.ok) {
        const data = await res.json();
        setProvider(data.provider);
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    fetchProvider();

    // Mouse move effect
    const handleMouseMove = (e) => {
      setMousePosition({ 
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fetchProvider]);

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleAddService = () => {
    setIsAddServiceModalOpen(true);
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">Loading your dashboard...</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce animation-delay-200"></div>
            <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce animation-delay-400"></div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20px, -50px) scale(1.1); }
            50% { transform: translate(-20px, 20px) scale(0.9); }
            75% { transform: translate(50px, 50px) scale(1.05); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-150 {
            animation-delay: 150ms;
          }
          .animation-delay-200 {
            animation-delay: 200ms;
          }
          .animation-delay-400 {
            animation-delay: 400ms;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Bookings',
      value: '24',
      change: '+12%',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      shadowColor: 'shadow-blue-500/50',
    },
    {
      title: 'Active Services',
      value: provider.services.length,
      change: '+8%',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-purple-500 via-purple-600 to-pink-600',
      shadowColor: 'shadow-purple-500/50',
    },
    {
      title: 'Experience',
      value: `${provider.experience} Yrs`,
      change: 'Professional',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      gradient: 'from-green-500 via-green-600 to-teal-600',
      shadowColor: 'shadow-green-500/50',
    },
    {
      title: 'Rating',
      value: '4.8',
      change: '★★★★★',
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      gradient: 'from-yellow-500 via-orange-500 to-red-500',
      shadowColor: 'shadow-yellow-500/50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden pt-20">
      {/* Animated Background Shapes - Reduced opacity */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        ></div>
        <div 
          className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{
            transform: `translate(${-mousePosition.x}px, ${mousePosition.y}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        ></div>
        <div 
          className="absolute -bottom-8 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{
            transform: `translate(${mousePosition.y}px, ${-mousePosition.x}px)`,
            transition: 'transform 0.3s ease-out'
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section - Simplified */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* User Avatar - Simplified */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold">
                  {provider.name.charAt(0).toUpperCase()}
                </span>
              </div>

              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {provider.name}! 👋
                </h2>
                <p className="text-lg text-gray-600">
                  Manage your services and track your performance
                </p>
              </div>
            </div>

            {/* Status Badge - Simplified */}
            <div className="hidden md:flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-gray-100">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mb-2 ${
                  provider.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
              </div>
              <div className="h-12 w-px bg-gray-200"></div>
              <span className={`text-lg font-bold capitalize ${
                provider.status === 'active' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {provider.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Cleaner design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg border border-gray-100 transform transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon with gradient background */}
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mb-4 text-white shadow-md`}>
                {stat.icon}
              </div>
              
              {/* Title */}
              <h3 className="text-gray-500 text-xs font-bold mb-2 uppercase tracking-wider">
                {stat.title}
              </h3>
              
              {/* Value */}
              <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-3`}>
                {stat.value}
              </p>
              
              {/* Change Indicator */}
              <div className="flex items-center space-x-2">
                {stat.change.includes('%') ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-sm font-bold text-green-600">{stat.change}</span>
                    <span className="text-xs text-gray-500">this month</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold text-gray-600">{stat.change}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card - Simplified */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Profile Details
                </h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              
              <div className="space-y-5">
                {/* Name */}
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="text-lg font-bold text-gray-900">{provider.name}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{provider.email}</p>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-lg font-bold text-gray-900">{provider.experience} years</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleEditProfile}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* Services & Activity - Cleaner */}
          <div className="lg:col-span-2 space-y-8">
              {/* Services Card */}
              <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Your Services
                  </h3>
                  <div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-xl border border-purple-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-purple-600">{provider.services.length} Active</span>
                  </div>
                </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {provider.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex items-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-bold text-gray-900 capitalize text-base">{service}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-green-600 font-semibold">Active</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={handleAddService}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-700 hover:text-purple-700 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add New Service</span>
                  </button>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Recent Activity
                  </h3>
                  <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                    <span>View All</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { action: 'New booking received', time: '2 hours ago', icon: '📅', gradient: 'from-blue-500 to-cyan-500' },
                    { action: 'Service completed', time: '5 hours ago', icon: '✅', gradient: 'from-green-500 to-teal-500' },
                    { action: 'Payment received', time: '1 day ago', icon: '💰', gradient: 'from-yellow-500 to-orange-500' },
                    { action: 'Profile updated', time: '2 days ago', icon: '👤', gradient: 'from-purple-500 to-pink-500' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5">
                      <div className={`w-12 h-12 bg-gradient-to-br ${activity.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                        <span className="text-2xl">{activity.icon}</span>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Modals */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Edit Profile</h3>
            <p className="text-gray-600 mb-6">Profile editing feature coming soon!</p>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isAddServiceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add New Service</h3>
            <p className="text-gray-600 mb-6">Service management feature coming soon!</p>
            <button
              onClick={() => setIsAddServiceModalOpen(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}