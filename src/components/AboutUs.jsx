"use client";

import { useEffect, useState, useRef } from "react";

export default function AboutUs() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const sectionRef = useRef(null);
  const statsRef = useRef(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Mouse tracking for parallax
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePosition({
          x: (e.clientX - rect.left - rect.width / 2) / rect.width,
          y: (e.clientY - rect.top - rect.height / 2) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { 
      title: "Verified Professionals", 
      desc: "Background-checked experts",
      icon: "🛡️",
      color: "from-blue-400 to-blue-600"
    },
    { 
      title: "Instant Booking", 
      desc: "Schedule services in minutes",
      icon: "⚡",
      color: "from-purple-400 to-purple-600"
    },
    { 
      title: "100% Satisfaction", 
      desc: "Quality guarantee on all services",
      icon: "✨",
      color: "from-green-400 to-green-600"
    },
    { 
      title: "24/7 Support", 
      desc: "Always here to help you",
      icon: "🌟",
      color: "from-orange-400 to-orange-600"
    }
  ];

  const stats = [
    { value: "100K+", label: "Happy Customers", icon: "👥" },
    { value: "5K+", label: "Service Partners", icon: "🤝" },
    { value: "50+", label: "Service Types", icon: "🛠️" },
    { value: "500+", label: "Cities Covered", icon: "🌍" }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-gray-50 to-white py-20 md:py-32 overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Gradient orbs with parallax */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 opacity-[0.08]"
          style={{
            transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full blur-3xl"></div>
        </div>
        
        <div 
          className="absolute bottom-0 left-0 w-80 h-80 opacity-[0.08]"
          style={{
            transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
          }}
        >
          <div className="w-full h-full bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full blur-3xl"></div>
        </div>

        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0,0,0) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${15 + Math.random() * 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with animation */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full px-4 py-1.5 flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-700">Our Story</span>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Redefining Service Excellence with{" "}
            <span className="relative inline-block">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transform skew-x-12 -rotate-1"></span>
              <span className="relative text-white px-4">YANN</span>
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting you with trusted professionals, delivering excellence at every touchpoint
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left side - Interactive showcase */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="relative">
              {/* Main card with glassmorphism */}
              <div className="relative bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-100 shadow-xl">
                {/* Animated service showcase */}
                <div className="relative h-80 flex items-center justify-center">
                  {/* Rotating ring */}
                  <div className="absolute inset-0 border-4 border-gray-100 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-4 border-4 border-blue-100 rounded-full animate-spin-slow-reverse"></div>
                  
                  {/* Center feature display */}
                  <div className="relative z-10 text-center">
                    <div className="text-6xl mb-4 animate-bounce-slow">
                      {features[activeFeature].icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {features[activeFeature].title}
                    </h3>
                    <p className="text-gray-600">
                      {features[activeFeature].desc}
                    </p>
                  </div>

                  {/* Feature dots */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {features.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveFeature(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === activeFeature 
                            ? 'w-8 bg-gradient-to-r from-blue-600 to-indigo-600' 
                            : 'w-2 bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements around the card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl p-3 shadow-lg border border-gray-100 animate-float">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-xs text-gray-500">Award Winning</p>
                    <p className="text-sm font-semibold text-gray-800">Platform</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-3 shadow-lg border border-gray-100 animate-float-delayed">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <p className="text-xs text-gray-500">Rated</p>
                    <p className="text-sm font-semibold text-gray-800">4.9/5 Stars</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className={`space-y-8 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold text-gray-900">
                Your Trusted Partner for Every Service Need
              </h3>
              
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  At YANN, we're not just another service platform. We're your neighbors, 
                  your problem-solvers, and your trusted partners in maintaining and improving 
                  your living spaces.
                </p>
                
                <p>
                  Founded with a simple vision - to make quality services accessible to everyone - 
                  we've grown into India's most trusted service marketplace. Our network of verified 
                  professionals ensures that help is always just a tap away.
                </p>

                <p>
                  From routine maintenance to emergency repairs, from beauty services to deep cleaning, 
                  we bring expertise to your doorstep with transparency, reliability, and a commitment 
                  to excellence that sets us apart.
                </p>
              </div>
            </div>

            {/* Feature list with hover effects */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105"
                  onClick={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl group-hover:animate-bounce">
                      {feature.icon}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div 
          ref={statsRef}
          className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 text-center border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-2xl transition-all duration-300"></div>
              
              <div className="relative">
                <div className="text-3xl mb-2 group-hover:animate-bounce">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100vh) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-spin-slow {
          animation: spin-slow 30s linear infinite;
        }

        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 25s linear infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}