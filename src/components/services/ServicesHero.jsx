'use client'
import React, { useState, useMemo } from 'react';
import { Search, Star, Clock, MapPin, Filter, Heart, ChevronDown } from 'lucide-react';

const ServicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Sample services data
  const services = [
    {
      id: 1,
      name: "Deep House Cleaning",
      category: "cleaning",
      price: 1200,
      duration: "3-4 hours",
      rating: 4.8,
      reviews: 1247,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      description: "Complete deep cleaning of your entire house including bathrooms, kitchen, and all rooms",
      popular: true
    },
    {
      id: 2,
      name: "Regular House Cleaning",
      category: "cleaning",
      price: 800,
      duration: "2-3 hours",
      rating: 4.6,
      reviews: 892,
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
      description: "Regular maintenance cleaning for your home on weekly or monthly basis",
      popular: true
    },
    {
      id: 3,
      name: "Bathroom Deep Clean",
      category: "cleaning",
      price: 400,
      duration: "1-2 hours",
      rating: 4.7,
      reviews: 634,
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop",
      description: "Specialized bathroom cleaning with sanitization and deep scrubbing"
    },
    {
      id: 4,
      name: "Kitchen Deep Clean",
      category: "cleaning",
      price: 600,
      duration: "2-3 hours",
      rating: 4.5,
      reviews: 445,
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      description: "Complete kitchen cleaning including appliances, cabinets, and countertops"
    },
    {
      id: 5,
      name: "Laundry & Ironing",
      category: "laundry",
      price: 300,
      duration: "2-4 hours",
      rating: 4.4,
      reviews: 321,
      image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop",
      description: "Professional laundry service with washing, drying, and ironing"
    },
    {
      id: 6,
      name: "Carpet Cleaning",
      category: "specialty",
      price: 500,
      duration: "1-2 hours",
      rating: 4.6,
      reviews: 278,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      description: "Deep carpet cleaning with stain removal and sanitization"
    },
    {
      id: 7,
      name: "Window Cleaning",
      category: "specialty",
      price: 350,
      duration: "1-2 hours",
      rating: 4.3,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
      description: "Interior and exterior window cleaning for crystal clear views"
    },
    {
      id: 8,
      name: "Move-in/Move-out Cleaning",
      category: "specialty",
      price: 1500,
      duration: "4-6 hours",
      rating: 4.9,
      reviews: 567,
      image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop",
      description: "Comprehensive cleaning for moving in or out of a property"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services', count: services.length },
    { id: 'cleaning', name: 'House Cleaning', count: services.filter(s => s.category === 'cleaning').length },
    { id: 'laundry', name: 'Laundry', count: services.filter(s => s.category === 'laundry').length },
    { id: 'specialty', name: 'Specialty', count: services.filter(s => s.category === 'specialty').length }
  ];

  // Filter and search logic
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(service => {
        if (max) {
          return service.price >= min && service.price <= max;
        }
        return service.price >= min;
      });
    }

    // Sort services
    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.reviews - a.reviews);
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      default:
        return filtered;
    }
  }, [services, searchTerm, selectedCategory, priceRange, sortBy]);

  const ServiceCard = ({ service }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={service.image} 
          alt={service.name}
          className="w-full h-48 object-cover"
        />
        {service.popular && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Popular
          </span>
        )}
        <button className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800">{service.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="ml-1 text-sm font-medium">{service.rating}</span>
            <span className="ml-1 text-sm text-gray-500">({service.reviews})</span>
          </div>
          <div className="flex items-center text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm">{service.duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800">
            ₹{service.price}
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maid Services</h1>
              <p className="text-gray-600 mt-1">Professional cleaning services at your doorstep</p>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-sm">Gurugram, Haryana</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories and Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">({category.count})</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Price Range</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: '0-500', label: '₹0 - ₹500' },
                  { value: '500-1000', label: '₹500 - ₹1000' },
                  { value: '1000-1500', label: '₹1000 - ₹1500' },
                  { value: '1500', label: '₹1500+' }
                ].map(price => (
                  <button
                    key={price.value}
                    onClick={() => setPriceRange(price.value)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      priceRange === price.value 
                        ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </button>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredServices.length} Services Available
                {searchTerm && (
                  <span className="text-gray-600 font-normal"> for "{searchTerm}"</span>
                )}
              </h2>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No services found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;