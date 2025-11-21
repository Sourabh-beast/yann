'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const slides = [
    {
      title: "Professional Maid Services",
      subtitle: "Your Home, Our Priority",
      description: "From deep cleaning to daily maintenance, get verified and trained maids for all your household needs. Reliable service, every single time.",
      gradient: "from-blue-600 to-cyan-600",
      category: "maid"
    },
    {
      title: "Expert Cooking Services",
      subtitle: "Delicious Meals, Made Easy",
      description: "Skilled cooks ready to prepare your favorite dishes. From daily meals to special occasions, enjoy home-cooked perfection.",
      gradient: "from-orange-600 to-red-600",
      category: "maid"
    },
    {
      title: "Gardening & Maintenance",
      subtitle: "Green Spaces, Beautiful Places",
      description: "Professional gardeners to maintain your lawn and plants. Keep your outdoor spaces lush and beautiful year-round.",
      gradient: "from-green-600 to-teal-600",
      category: "maid"
    },
    {
      title: "Baby Sitting Services",
      subtitle: "Care You Can Trust",
      description: "Experienced and caring babysitters for your little ones. Background-verified professionals who treat your child like family.",
      gradient: "from-pink-600 to-purple-600",
      category: "maid"
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const maidServices = [
    { 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', 
      label: 'Cleaning',
      color: 'from-blue-500 to-blue-600',
      description: 'Deep cleaning & maintenance'
    },
    { 
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', 
      label: 'Cooking',
      color: 'from-orange-500 to-orange-600',
      description: 'Daily meals & special dishes'
    },
    { 
      icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', 
      label: 'Gardening',
      color: 'from-green-500 to-green-600',
      description: 'Lawn & plant care'
    },
    { 
      icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', 
      label: 'Baby Sitting',
      color: 'from-pink-500 to-pink-600',
      description: 'Caring for your little ones'
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified & Background Checked Professionals</span>
            </div>

            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {slides[currentSlide].title}
                <span className={`block bg-gradient-to-r ${slides[currentSlide].gradient} bg-clip-text text-transparent mt-2`}>
                  {slides[currentSlide].subtitle}
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {slides[currentSlide].description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                href="/services"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                Book a Service
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/#how-it-works"
                className="px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-gray-200 hover:border-blue-600"
              >
                How It Works
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              {[
                { value: '5K+', label: 'Happy Customers' },
                { value: '500+', label: 'Verified Professionals' },
                { value: '24/7', label: 'Support' },
              ].map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Desktop with 3D-like animations */}
          <div className="relative lg:block hidden" ref={containerRef}>
            <div className="relative h-[650px] perspective-1000">
              
              {/* 3D Rotating Container */}
              <div 
                className="absolute inset-0 transition-transform duration-200 ease-out"
                style={{
                  transform: `rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 5}deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Central Glass Card with Morphism Effect */}
                <div 
                  className={`absolute top-1/2 left-1/2 w-80 h-96 transition-all duration-700 ${isTransitioning ? 'scale-90 opacity-0 rotate-12' : 'scale-100 opacity-100 rotate-0'}`}
                  style={{
                    transform: 'translate(-50%, -50%) translateZ(50px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="relative w-full h-full">
                    {/* Glass morphism background */}
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} opacity-10 rounded-3xl`}></div>
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col items-center justify-center p-8 z-10">
                      {/* Animated Icon Container */}
                      <div className="relative mb-6">
                        <div className={`w-32 h-32 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-110 hover:rotate-6`}
                          style={{ transformStyle: 'preserve-3d' }}>
                          {/* Icon glow effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-3xl blur-xl opacity-50 animate-pulse`}></div>
                          
                          <svg className="w-16 h-16 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {slides[currentSlide].category === 'driver' ? (
                              <>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                <circle cx="9" cy="17" r="1" fill="currentColor" />
                                <circle cx="15" cy="17" r="1" fill="currentColor" />
                              </>
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            )}
                          </svg>
                        </div>
                        
                        {/* Orbiting particles */}
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r ${slides[currentSlide].gradient} rounded-full`}
                            style={{
                              animation: `orbit 3s linear infinite`,
                              animationDelay: `${i * 1}s`,
                              transformOrigin: '0 0'
                            }}
                          ></div>
                        ))}
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                        {slides[currentSlide].category === 'driver' ? 'Professional Drivers' : slides[currentSlide].title.split(' ')[0]}
                      </h3>
                      
                      <div className="flex items-center space-x-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className="w-5 h-5 text-yellow-400 fill-current animate-star"
                            style={{ animationDelay: `${i * 0.1}s` }}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-gray-700 text-center text-sm font-medium mb-4">4.8 from 2,500+ reviews</p>
                      
                      <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        <span className="text-sm font-semibold text-gray-900">Available Now</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Service Cards for Maid Services */}
                {slides[currentSlide].category === 'maid' && maidServices.map((service, index) => {
                  const angles = [0, 90, 180, 270];
                  const angle = angles[index] * (Math.PI / 180);
                  const radius = 260;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <div
                      key={index}
                      className="absolute top-1/2 left-1/2 animate-float-rotate"
                      style={{
                        '--x': `${x}px`,
                        '--y': `${y}px`,
                        '--z': `${30 + index * 10}px`,
                        animationDelay: `${index * 0.5}s`
                      }}
                    >
                      <div className="group relative">
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`}></div>
                        
                        {/* Card */}
                        <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-5 w-44 transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-2 border border-white/20"
                          style={{ transformStyle: 'preserve-3d' }}>
                          <div className={`w-14 h-14 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-3 mx-auto transform group-hover:rotate-12 transition-transform duration-300 shadow-lg`}>
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                            </svg>
                          </div>
                          <h4 className="text-sm font-bold text-gray-900 text-center mb-1">{service.label}</h4>
                          <p className="text-xs text-gray-600 text-center leading-tight">{service.description}</p>
                          
                          {/* Active indicator */}
                          <div className="flex items-center justify-center mt-3 space-x-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-600 font-semibold">Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Driver Service Feature Badges */}
                {slides[currentSlide].category === 'driver' && (
                  <>
                    {[
                      { 
                        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                        title: 'Licensed',
                        subtitle: 'Verified Drivers',
                        color: 'from-green-400 to-green-600',
                        position: { x: -200, y: -180 }
                      },
                      { 
                        icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                        title: 'Safe & Secure',
                        subtitle: 'Background Checked',
                        color: 'from-blue-400 to-blue-600',
                        position: { x: 200, y: -180 }
                      },
                      { 
                        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                        title: 'Punctual',
                        subtitle: 'Always On Time',
                        color: 'from-purple-400 to-purple-600',
                        position: { x: -200, y: 180 }
                      },
                      { 
                        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                        title: 'Affordable',
                        subtitle: 'Best Rates',
                        color: 'from-orange-400 to-orange-600',
                        position: { x: 200, y: 180 }
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="absolute top-1/2 left-1/2 animate-float-soft"
                        style={{
                          '--x': `${feature.position.x}px`,
                          '--y': `${feature.position.y}px`,
                          '--z': `${20 + index * 5}px`,
                          animationDelay: `${index * 0.3}s`
                        }}
                      >
                        <div className="group relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
                          
                          <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 w-48 transform transition-all duration-300 group-hover:scale-105 border border-white/20">
                            <div className="flex items-center space-x-3">
                              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-300`}>
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{feature.title}</div>
                                <div className="text-xs text-gray-600">{feature.subtitle}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Decorative Elements */}
                <div className="absolute top-10 right-10 w-20 h-20 animate-spin-slow" style={{ transformStyle: 'preserve-3d' }}>
                  <div className={`w-full h-full bg-gradient-to-br ${slides[currentSlide].gradient} rounded-2xl opacity-20 transform rotate-45`}></div>
                </div>
                
                <div className="absolute bottom-10 left-10 w-16 h-16 animate-spin-slow animation-delay-2000" style={{ transformStyle: 'preserve-3d' }}>
                  <div className={`w-full h-full bg-gradient-to-br ${slides[currentSlide].gradient} rounded-full opacity-20`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Right Content */}
          <div className="relative lg:hidden">
            <div className="relative w-full max-w-md mx-auto">
              <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-xl transition-all duration-500 ${isTransitioning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
                <div className={`w-24 h-24 bg-gradient-to-br ${slides[currentSlide].gradient} rounded-3xl flex items-center justify-center mb-6 mx-auto`}>
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {slides[currentSlide].category === 'driver' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    )}
                  </svg>
                </div>

                {slides[currentSlide].category === 'maid' && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {maidServices.slice(0, 4).map((service, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-4 shadow-md text-center hover:scale-105 transition-transform">
                        <div className={`w-12 h-12 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center mb-2 mx-auto`}>
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={service.icon} />
                          </svg>
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">{service.label}</h4>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 text-center">
                  <div className="flex justify-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-gray-700 font-medium mb-3">4.8 from 2,500+ reviews</div>
                  
                  <div className="flex items-center justify-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <span className="text-sm font-semibold text-green-700">Available Now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center space-x-2 mt-12">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setIsTransitioning(false);
                }, 300);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(80px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(80px) rotate(-360deg);
          }
        }

        @keyframes star {
          0%, 100% { 
            transform: scale(1);
            opacity: 1;
          }
          50% { 
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        .animate-star {
          animation: star 2s ease-in-out infinite;
        }

        @keyframes float-rotate {
          0%, 100% { 
            transform: translate(-50%, -50%) translate(var(--x), var(--y)) translateZ(var(--z)) rotateY(0deg);
          }
          50% { 
            transform: translate(-50%, -50%) translate(var(--x), var(--y)) translateZ(calc(var(--z) + 20px)) rotateY(10deg);
          }
        }

        .animate-float-rotate {
          animation: float-rotate 4s ease-in-out infinite;
        }

        @keyframes float-soft {
          0%, 100% { 
            transform: translate(-50%, -50%) translate(var(--x), var(--y)) translateZ(var(--z)) translateY(0px);
          }
          50% { 
            transform: translate(-50%, -50%) translate(var(--x), var(--y)) translateZ(var(--z)) translateY(-15px);
          }
        }

        .animate-float-soft {
          animation: float-soft 3s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default Hero;