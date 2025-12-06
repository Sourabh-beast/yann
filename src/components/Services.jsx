'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const serviceGradients = {
  'driver': 'from-slate-900 to-blue-700',
  'pujari': 'from-purple-600 to-pink-600',
  'cleaning': 'from-blue-500 to-cyan-500',
};

const serviceIcons = {
  'driver': (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-5a2 2 0 011.886-1.342h10.228A2 2 0 0119 8l2 5M5 13h14m-9 5h4m-9 0h1m10 0h1m-3 0a3 3 0 11-6 0" />
    </svg>
  ),
  'pujari': (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'cleaning': (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setServices(data.data);
        } else {
          throw new Error('Failed to load services');
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err.message);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const prioritizedServices = loading ? [] : [...services].sort((a, b) => {
    const aInactive = a.category !== 'driver' && a.category !== 'pujari';
    const bInactive = b.category !== 'driver' && b.category !== 'pujari';
    if (aInactive === bInactive) return 0;
    return aInactive ? 1 : -1;
  });

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Our Services</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Services Tailored{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              For You
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From home maintenance to personal care, we've got everything you need to make your life easier and more convenient.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 animate-pulse">
                <div className="w-20 h-20 bg-gray-300 rounded-2xl mb-6"></div>
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-2 mb-6">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-4 bg-gray-200 rounded w-3/4"></div>
                  ))}
                </div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))
          ) : prioritizedServices.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No services available at the moment.</p>
            </div>
          ) : (
            prioritizedServices.map((service) => {
              const isActive = service.category === 'driver' || service.category === 'pujari';
              const serviceSlug = service.title.toLowerCase().replaceAll(/ & /g, '-').replaceAll(/ /g, '-');
              const gradient = serviceGradients[service.category] || 'from-blue-500 to-cyan-500';
              const icon = serviceIcons[service.category];

              return (
                <div
                  key={service.id}
                  className={`group relative bg-white rounded-3xl p-8 shadow-md border border-gray-100 overflow-hidden transition-all duration-500 ${
                    isActive ? 'hover:shadow-2xl hover:-translate-y-3' : 'filter grayscale opacity-80'
                  }`}
                >
                  {!isActive && (
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-900 text-white rounded-full">
                      Coming Soon
                    </div>
                  )}

                  {/* Popular Badge */}
                  {service.popular && isActive && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  )}

                  {/* Gradient Background */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} ${
                      isActive ? 'opacity-0 group-hover:opacity-5' : 'opacity-0'
                    } transition-opacity duration-500`}
                  ></div>

                  {/* Icon */}
                  <div
                    className={`relative w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white mb-6 transition-all duration-500 shadow-lg ${
                      isActive ? 'group-hover:scale-110 group-hover:rotate-6' : 'grayscale'
                    }`}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {Array.isArray(service.features) &&
                      service.features.map((feature, idx) => (
                        <li key={`${service.id}-${idx}`} className="flex items-center text-sm text-gray-600">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                  </ul>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Price</div>
                      <div className={`text-xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                        {service.price ? `₹${service.price}` : 'Contact for price'}
                      </div>
                    </div>
                    {isActive ? (
                      <Link
                        href={`/services/${serviceSlug}`}
                        className={`px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                      >
                        Book Now
                      </Link>
                    ) : (
                      <span className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-semibold cursor-not-allowed">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/services"
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200"
          >
            View All Services
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;