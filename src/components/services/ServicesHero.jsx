'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';

const ServicesHero = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isLoggedIn } = useAuth();

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          // Transform database services to match component format
          const transformedServices = data.data.map((service) => ({
            id: service.id,
            name: service.title,
            category: service.category,
            price: service.price || 0,
            duration: '1-3 hours',
            rating: 4.5,
            reviews: 0,
            image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop',
            description: service.description,
            popular: service.popular || false,
            features: service.features || [],
          }));
          setServices(transformedServices);
          setFilteredServices(transformedServices);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services
  useEffect(() => {
    let filtered = services;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const categories = ['all', ...new Set(services.map(s => s.category))];

  return (
    <>
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filter */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No services found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image src={service.image} alt={service.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                      {service.popular && (
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full font-semibold">
                          Popular
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-gray-500 text-xs">Starting at</p>
                        <p className="text-xl font-bold text-blue-600">₹{service.price}</p>
                      </div>
                      <div className="text-right">
                        {service.rating > 0 && (
                          <>
                            <p className="text-yellow-500 font-semibold">{service.rating}</p>
                            <p className="text-gray-500 text-xs">({service.reviews})</p>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          setShowLoginModal(true);
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
};

export default ServicesHero;
