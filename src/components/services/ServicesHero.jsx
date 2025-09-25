'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Clock, MapPin, Filter, Heart, ChevronDown, X, CheckCircle } from 'lucide-react';

/* ------------------------------ sample data ------------------------------ */
const useServicesData = () => useMemo(() => ([
  { id: 1, name: 'Deep House Cleaning', category: 'cleaning', price: 1200, duration: '3-4 hours', rating: 4.8, reviews: 1247, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Complete deep cleaning of your entire house including bathrooms, kitchen, and all rooms', popular: true },
  { id: 2, name: 'Regular House Cleaning', category: 'cleaning', price: 800, duration: '2-3 hours', rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop', description: 'Regular maintenance cleaning for your home on weekly or monthly basis', popular: true },
  { id: 3, name: 'Bathroom Deep Clean', category: 'cleaning', price: 400, duration: '1-2 hours', rating: 4.7, reviews: 634, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop', description: 'Specialized bathroom cleaning with sanitization and deep scrubbing' },
  { id: 4, name: 'Kitchen Deep Clean', category: 'cleaning', price: 600, duration: '2-3 hours', rating: 4.5, reviews: 445, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', description: 'Complete kitchen cleaning including appliances, cabinets, and countertops' },
  { id: 5, name: 'Laundry & Ironing', category: 'laundry', price: 300, duration: '2-4 hours', rating: 4.4, reviews: 321, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop', description: 'Professional laundry service with washing, drying, and ironing' },
  { id: 6, name: 'Carpet Cleaning', category: 'specialty', price: 500, duration: '1-2 hours', rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', description: 'Deep carpet cleaning with stain removal and sanitization' },
  { id: 7, name: 'Window Cleaning', category: 'specialty', price: 350, duration: '1-2 hours', rating: 4.3, reviews: 189, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Interior and exterior window cleaning for crystal clear views' },
  { id: 8, name: 'Move-in/Move-out Cleaning', category: 'specialty', price: 1500, duration: '4-6 hours', rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop', description: 'Comprehensive cleaning for moving in or out of a property' }
]), []);

/* currency formatter for INR */
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/* ------------------------------ BookingModal ------------------------------ */
const BookingModal = ({ open, onClose, baseService, servicesList = [], onConfirm }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [time, setTime] = useState('09:00');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [months, setMonths] = useState(1);
  const [notes, setNotes] = useState('');

  // new states
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      // reset to sensible defaults when modal opens
      setDate(new Date().toISOString().slice(0, 10));
      setTime('09:00');
      setSelectedExtras([]);
      setMonths(1);
      setNotes('');
      setStatus('idle');
      setErrorMsg('');
    }
  }, [open]);

  if (!open) return null;

  // generate 30-minute slots from 08:00 to 18:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      ['00', '30'].forEach(min => {
        const hh = h.toString().padStart(2, '0');
        slots.push(`${hh}:${min}`);
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const toggleExtra = (id) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const extrasTotal = selectedExtras.reduce((acc, id) => {
    const s = servicesList.find(x => x.id === id);
    return acc + (s?.price || 0);
  }, 0);

  const basePrice = baseService?.price || 0;
  const totalPrice = (basePrice + extrasTotal) * (months || 1);

  const handleConfirm = async () => {
    setStatus('submitting');
    setErrorMsg('');

    const booking = {
      serviceId: baseService?.id || null,
      serviceName: baseService?.name || null,
      date,
      time,
      months,
      extras: selectedExtras,
      notes,
      totalPrice
    };

    try {
      // support both sync and async onConfirm handlers
      const result = onConfirm?.(booking);
      if (result && typeof result.then === 'function') {
        await result;
      }
      // success state
      setStatus('success');
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  // Success screen content
  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { /* don't close modal by clicking backdrop when success is shown */ }} />

        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-8">
          <div className="bg-green-100 rounded-full p-4 mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 text-center mb-4">Your booking for <span className="font-semibold">{baseService?.name}</span> on <span className="font-medium">{date}</span> at <span className="font-medium">{time}</span> has been confirmed.</p>
          <div className="text-sm text-gray-500 mb-6">
            <div>Total: <span className="font-semibold text-gray-800 ml-2">{currency.format(totalPrice)}</span></div>
            {notes && <div className="mt-1">Notes: <span className="text-gray-700">{notes}</span></div>}
          </div>

          <div className="w-full flex gap-3">
            <button onClick={() => { setStatus('idle'); onClose?.(); }} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">Done</button>
            <button onClick={() => { setStatus('idle'); }} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">Make another</button>
          </div>
        </div>
      </div>
    );
  }

  // Error screen (inline at bottom)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { if (status === 'idle') onClose?.(); }} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{baseService?.name ?? 'Service'}</h3>
              <p className="text-blue-100 text-sm mt-1">Book your service appointment</p>
            </div>
            <button 
              aria-label="close booking" 
              onClick={() => { if (status === 'idle') onClose?.(); }} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Service Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{baseService?.name}</p>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{baseService?.duration}</span>
                      <span className="mx-2">•</span>
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="ml-1">{baseService?.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {currency.format(baseService?.price || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Select Date & Time
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select 
                    value={time} 
                    onChange={e => setTime(e.target.value)} 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Additional Services
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {servicesList.filter(s => s.id !== baseService?.id).map(extra => (
                  <label 
                    key={extra.id} 
                    className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      selectedExtras.includes(extra.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedExtras.includes(extra.id)} 
                      onChange={() => toggleExtra(extra.id)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{extra.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{extra.description}</div>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <span className="font-semibold text-blue-600">{currency.format(extra.price)}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{extra.duration}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Duration & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Service Duration</label>
                <select 
                  value={months} 
                  onChange={e => setMonths(Number(e.target.value))} 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const val = i + 1;
                    return (
                      <option key={val} value={val}>
                        {val} {val === 1 ? 'month' : 'months'}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <input 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Any special requests..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Price Summary */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Base Service</span>
              <span className="font-medium">{currency.format(basePrice)}</span>
            </div>
            {extrasTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Additional Services</span>
                <span className="font-medium">{currency.format(extrasTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{months} {months === 1 ? 'month' : 'months'}</span>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">{currency.format(totalPrice)}</span>
              </div>
            </div>
          </div>

          {status === 'error' && (
            <div className="mb-3 text-sm text-red-600">
              {errorMsg || 'Failed to place booking.'}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button 
              onClick={() => { if (status === 'idle') onClose?.(); }} 
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              disabled={status !== 'idle'}
            >
              Cancel
            </button>

            <button 
              onClick={handleConfirm} 
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"></circle>
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                  <span>Confirming...</span>
                </>
              ) : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ ServiceCard (integrated) ------------------------------ */
const ServiceCard = ({ service, onBook }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative">
      <img src={service.image} alt={service.name} className="w-full h-48 object-cover" loading="lazy" />
      {service.popular && (
        <span className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">Popular</span>
      )}
      <button aria-label={`favorite ${service.name}`} className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors">
        <Heart className="w-4 h-4 text-gray-600" />
      </button>
    </div>

    <div className="p-4">
      <h3 className="font-semibold text-lg mb-2 text-gray-800">{service.name}</h3>
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="ml-1 text-sm font-medium">{service.rating ?? '-'}</span>
          <span className="ml-1 text-sm text-gray-500">({service.reviews ?? 0})</span>
        </div>
        <div className="flex items-center text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          <span className="text-sm">{service.duration}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-800">{currency.format(service.price)}</div>
        <button onClick={() => onBook(service)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Book Now</button>
      </div>
    </div>
  </div>
);

/* ------------------------------ ServicesPage (integrates modal) ------------------------------ */
const ServicesPage = () => {
  const services = useServicesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);

  const handleBook = (service) => {
    setBookingService(service);
    setBookingOpen(true);
  };

  const handleConfirmBooking = async (booking) => {
    // Example API call replacement:
    // await fetch('/api/bookings', { method: 'POST', body: JSON.stringify(booking) });
    console.log('Booking confirmed:', booking);
    // return; // if you want success
    // If you want to demonstrate an error, throw here:
    // throw new Error('Server error');
  };

  // simple filtering (kept minimal to focus on modal integration)
  const filteredServices = useMemo(() => {
    let filtered = services;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'all') filtered = filtered.filter(s => s.category === selectedCategory);

    const sorted = [...filtered];
    switch (sortBy) {
      case 'popular': sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
      case 'rating': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'price-low': sorted.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-high': sorted.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      default: break;
    }
    return sorted;
  }, [services, searchTerm, selectedCategory, sortBy]);

  const categories = useMemo(() => ([
    { id: 'all', name: 'All Services', count: services.length },
    { id: 'cleaning', name: 'House Cleaning', count: services.filter(s => s.category === 'cleaning').length },
    { id: 'laundry', name: 'Laundry', count: services.filter(s => s.category === 'laundry').length },
    { id: 'specialty', name: 'Specialty', count: services.filter(s => s.category === 'specialty').length },
  ]), [services]);

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
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'hover:bg-gray-100'}`}>
                    <div className="flex justify-between items-center"><span>{cat.name}</span><span className="text-sm text-gray-500">({cat.count})</span></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Price Range</h3>
              <div className="space-y-2">
                {[{ value: 'all', label: 'All Prices' },{ value: '0-500', label: '₹0 - ₹500' },{ value: '500-1000', label: '₹500 - ₹1000' },{ value: '1000-1500', label: '₹1000 - ₹1500' },{ value: '1500', label: '₹1500+' }].map(price => (
                  <button key={price.value} onClick={() => setPriceRange(price.value)} className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${priceRange === price.value ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'hover:bg-gray-100'}`}>{price.label}</button>
                ))}
              </div>
            </div>
          </aside>

          <main className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search for services..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>

                <div className="relative">
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>

              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">{filteredServices.length} Services Available</h2>
            </div>

            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map(s => <ServiceCard key={s.id} service={s} onBook={handleBook} />)}
              </div>
            ) : (
              <div className="text-center py-12"><div className="text-gray-400 mb-4"><Search className="w-16 h-16 mx-auto" /></div><h3 className="text-xl font-semibold text-gray-600 mb-2">No services found</h3><p className="text-gray-500">Try adjusting your search or filter criteria</p></div>
            )}

          </main>
        </div>
      </div>

      {/* Booking modal */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        baseService={bookingService}
        servicesList={services}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
};

export default ServicesPage;
