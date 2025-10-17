"use client";

import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import ServiceProviderRegistration from "./registration/Modal";

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Professional service categories
  const services = [
    "Home Cleaning",
    "Appliance Repair", 
    "Salon at Home",
    "Electrician",
    "Plumbing",
    "Painting",
    "Pest Control",
    "AC Service"
  ];

  // Animated stats
  const stats = [
    { value: "100K+", label: "Happy Customers" },
    { value: "50+", label: "Service Categories" },
    { value: "5,000+", label: "Verified Professionals" },
    { value: "98%", label: "Customer Satisfaction" }
  ];

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Rotate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Minimalist avatar designs
  const avatarStyles = [
    { bg: 'from-blue-400 to-blue-600', initial: 'A' },
    { bg: 'from-purple-400 to-purple-600', initial: 'S' },
    { bg: 'from-green-400 to-green-600', initial: 'M' },
    { bg: 'from-orange-400 to-orange-600', initial: 'R' },
  ];

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-50 to-white"
    >
      {/* Professional animated background */}
      <div className="absolute inset-0">
        {/* Subtle gradient orbs */}
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 opacity-[0.15]"
          style={{
            transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-3xl"></div>
        </div>
        
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 opacity-[0.15]"
          style={{
            transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        </div>

        {/* Professional grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Professional badge */}
            <div className="inline-flex items-center animate-fade-in">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-4 py-1.5 flex items-center space-x-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-sm font-medium text-blue-700">India's #1 Service Platform</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight animate-fade-in-up">
                <span className="block">Quality Services</span>
                <span className="block mt-2">
                  delivered by{" "}
                  <span className="relative inline-block">
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transform skew-x-12 -rotate-1"></span>
                    <span className="relative text-white px-4">YANN</span>
                  </span>
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 max-w-xl animate-fade-in-up animation-delay-200">
                Expert professionals for all your home and personal service needs. 
                Trusted, verified, and available at your convenience.
              </p>
            </div>

            {/* Service categories ticker */}
            <div className="space-y-2 animate-fade-in-up animation-delay-400">
              <p className="text-sm text-gray-500 font-medium">POPULAR SERVICES</p>
              <div className="flex flex-wrap gap-2">
                {services.slice(0, 4).map((service, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {service}
                  </span>
                ))}
                <span className="px-3 py-1.5 text-sm text-gray-500 font-medium cursor-default">
                  +45 more
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
              <Link
                href="/services"
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700"
              >
                Book a Service
                <svg
                  className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <button
                onClick={openModal}
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl transition-all duration-300 hover:border-gray-400 hover:shadow-lg hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Join as Professional
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-8 pt-4 animate-fade-in-up animation-delay-800">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {avatarStyles.map((avatar, i) => (
                    <div 
                      key={i} 
                      className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden group hover:scale-110 transition-transform duration-200"
                      style={{ zIndex: avatarStyles.length - i }}
                    >
                      {/* Minimalist gradient background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${avatar.bg}`}></div>
                      
                      {/* Simple geometric pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <svg viewBox="0 0 40 40" className="w-full h-full">
                          <circle cx="20" cy="20" r="8" fill="white" />
                          <circle cx="20" cy="20" r="12" fill="none" stroke="white" strokeWidth="1" />
                        </svg>
                      </div>
                      
                      {/* Initial letter */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{avatar.initial}</span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Additional users indicator */}
                  <div className="relative w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">+99k</span>
                  </div>
                </div>
                
                <p className="ml-3 text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">100K+</span> Happy Users
                </p>
              </div>

              {/* <div className="flex items-center"> */}
                {/* <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                </div> */}
                {/* <p className="ml-2 text-sm font-semibold text-gray-700">4.8/5</p> */}
              {/* </div> */}
            </div>
          </div>

          {/* Right Content - Interactive Stats Display */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px]">
              {/* Central showcase */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-96 h-96">
                  {/* Rotating rings */}
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full animate-spin-very-slow"></div>
                  <div className="absolute inset-4 border-4 border-blue-100 rounded-full animate-spin-very-slow-reverse"></div>
                  <div className="absolute inset-8 border-4 border-indigo-100 rounded-full animate-spin-very-slow"></div>
                  
                  {/* Central stats display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 w-72 transform transition-all duration-500 hover:scale-105">
                      <div className="text-center space-y-2">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-number-change">
                          {stats[currentStat].value}
                        </div>
                        <div className="text-gray-600 font-medium">
                          {stats[currentStat].label}
                        </div>
                      </div>
                      
                      {/* Progress dots */}
                      <div className="flex justify-center space-x-2 mt-6">
                        {stats.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              index === currentStat 
                                ? 'w-8 bg-blue-600' 
                                : 'w-1.5 bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Orbiting service icons - Train style */}
                  {[
                    { icon: "🧹", delay: 0 },
                    { icon: "🔧", delay: 0.5 },
                    { icon: "💡", delay: 1 },
                    { icon: "🍽️", delay: 1.5 },
                    { icon: "👶🏻", delay: 2 },
                    { icon: "🌱", delay: 2.5 }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="absolute w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        animation: `orbit-train 12s linear infinite`,
                        animationDelay: `${item.delay}s`,
                      }}
                    >
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Provider Registration Modal */}
      <ServiceProviderRegistration 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />

      {/* Professional animations */}
      <style jsx>{`
        @keyframes spin-very-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-very-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes orbit-train {
          from { 
            transform: translate(-50%, -50%) rotate(0deg) translateX(180px) rotate(0deg);
          }
          to { 
            transform: translate(-50%, -50%) rotate(360deg) translateX(180px) rotate(-360deg);
          }
        }

        @keyframes number-change {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-spin-very-slow {
          animation: spin-very-slow 60s linear infinite;
        }

        .animate-spin-very-slow-reverse {
          animation: spin-very-slow-reverse 45s linear infinite;
        }

        .animate-number-change {
          animation: number-change 0.5s ease-in-out;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
          animation-fill-mode: both;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>
    </section>
  );
}