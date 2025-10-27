'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Clock, MapPin, Filter, Heart, ChevronDown, X, CheckCircle, Sparkles, TrendingUp, Award, Shield, Zap, Calendar } from 'lucide-react';

/* ------------------------------ sample data ------------------------------ */
const useServicesData = () => useMemo(() => ([
  { id: 1, name: 'Deep House Cleaning', category: 'cleaning', price: 1200, duration: '3-4 hours', rating: 4.8, reviews: 1247, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Complete deep cleaning of your entire house including bathrooms, kitchen, and all rooms', popular: true, badge: 'Bestseller' },
  { id: 2, name: 'Regular House Cleaning', category: 'cleaning', price: 800, duration: '2-3 hours', rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop', description: 'Regular maintenance cleaning for your home on weekly or monthly basis', popular: true, badge: 'Popular' },
  { id: 3, name: 'Bathroom Deep Clean', category: 'cleaning', price: 400, duration: '1-2 hours', rating: 4.7, reviews: 634, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop', description: 'Specialized bathroom cleaning with sanitization and deep scrubbing' },
  { id: 4, name: 'Kitchen Deep Clean', category: 'cleaning', price: 600, duration: '2-3 hours', rating: 4.5, reviews: 445, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', description: 'Complete kitchen cleaning including appliances, cabinets, and countertops' },
  { id: 5, name: 'Laundry & Ironing', category: 'laundry', price: 300, duration: '2-4 hours', rating: 4.4, reviews: 321, image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=300&fit=crop', description: 'Professional laundry service with washing, drying, and ironing', badge: 'New' },
  { id: 6, name: 'Carpet Cleaning', category: 'specialty', price: 500, duration: '1-2 hours', rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', description: 'Deep carpet cleaning with stain removal and sanitization' },
  { id: 7, name: 'Window Cleaning', category: 'specialty', price: 350, duration: '1-2 hours', rating: 4.3, reviews: 189, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Interior and exterior window cleaning for crystal clear views' },
  { id: 8, name: 'Move-in/Move-out Cleaning', category: 'specialty', price: 1500, duration: '4-6 hours', rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&h=300&fit=crop', description: 'Comprehensive cleaning for moving in or out of a property', badge: 'Premium' }
]), []);

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/* ------------------------------ BookingModal ------------------------------ */
const BookingModal = ({ open, onClose, baseService, servicesList = [], onConfirm }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [months, setMonths] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
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
      const result = onConfirm?.(booking);
      if (result && typeof result.then === 'function') {
        await result;
      }
      setStatus('success');
    } catch (err) {
      console.error('Booking failed:', err);
      setErrorMsg(err?.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md" />

        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center p-8 animate-in zoom-in-95 duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-green-400 blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 rounded-full p-5 mb-4">
              <CheckCircle className="w-20 h-20 text-green-600 animate-in zoom-in duration-500" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">Booking Confirmed!</h3>
          <p className="text-gray-600 text-center mb-6 leading-relaxed">Your booking for <span className="font-semibold text-gray-800">{baseService?.name}</span> on <span className="font-medium text-green-600">{date}</span> at <span className="font-medium text-green-600">{time}</span> has been confirmed.</p>
          
          <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 mb-6 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Amount</span>
              <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{currency.format(totalPrice)}</span>
            </div>
            {notes && <div className="text-sm text-gray-600 mt-3 pt-3 border-t border-green-200">Notes: <span className="text-gray-800 font-medium">{notes}</span></div>}
          </div>

          <div className="w-full flex gap-3">
            <button onClick={() => { setStatus('idle'); onClose?.(); }} className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5">Done</button>
            <button onClick={() => { setStatus('idle'); }} className="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">Book Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md" onClick={() => { if (status === 'idle') onClose?.(); }} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-blue-200 text-sm font-medium">Premium Service</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{baseService?.name ?? 'Service'}</h3>
              <p className="text-blue-100 text-sm">Book your service appointment with confidence</p>
            </div>
            <button 
              aria-label="close booking" 
              onClick={() => { if (status === 'idle') onClose?.(); }} 
              className="p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{baseService?.name}</p>
                    <div className="flex items-center text-sm text-gray-600 mt-2 gap-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{baseService?.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="ml-1 font-medium">{baseService?.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {currency.format(baseService?.price || 0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">per session</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h4 className="text-xl font-bold text-gray-900">Select Date & Time</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <select 
                    value={time} 
                    onChange={e => setTime(e.target.value)} 
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h4 className="text-xl font-bold text-gray-900">Additional Services</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {servicesList.filter(s => s.id !== baseService?.id).map(extra => (
                  <label 
                    key={extra.id} 
                    className={`group flex items-center gap-5 p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      selectedExtras.includes(extra.id) 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedExtras.includes(extra.id)} 
                      onChange={() => toggleExtra(extra.id)}
                      className="w-6 h-6 text-blue-600 rounded-lg focus:ring-blue-500 transition-transform duration-300 hover:scale-110"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg mb-1">{extra.name}</div>
                      <div className="text-sm text-gray-600 mb-3">{extra.description}</div>
                      <div className="flex items-center text-sm text-gray-500 gap-4">
                        <span className="font-bold text-blue-600 text-lg">{currency.format(extra.price)}</span>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{extra.duration}</span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Duration</label>
                <select 
                  value={months} 
                  onChange={e => setMonths(Number(e.target.value))} 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Instructions</label>
                <input 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Any special requests..."
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Base Service</span>
              <span className="font-semibold text-gray-900">{currency.format(basePrice)}</span>
            </div>
            {extrasTotal > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Additional Services</span>
                <span className="font-semibold text-gray-900">{currency.format(extrasTotal)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Duration</span>
              <span className="font-semibold text-gray-900">{months} {months === 1 ? 'month' : 'months'}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currency.format(totalPrice)}</span>
              </div>
            </div>
          </div>

          {status === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">{errorMsg || 'Failed to place booking.'}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { if (status === 'idle') onClose?.(); }} 
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              disabled={status !== 'idle'}
            >
              Cancel
            </button>

            <button 
              onClick={handleConfirm} 
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center justify-center gap-2 hover:-translate-y-0.5"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"></circle>
                    <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                  </svg>
                  <span>Confirming...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Booking</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ ServiceCard ------------------------------ */
const ServiceCard = ({ service, onBook, isFavorite, onToggleFavorite }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={service.image} 
          alt={service.name} 
          className={`w-full h-56 object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`} 
          loading="lazy" 
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {service.badge && (
          <span className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm transition-all duration-300 ${
            service.badge === 'Bestseller' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
            service.badge === 'Popular' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
            service.badge === 'New' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
            'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}>
            {service.badge}
          </span>
        )}
        
        <button 
          aria-label={`favorite ${service.name}`} 
          onClick={() => onToggleFavorite?.(service.id)}
          className={`absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 transition-all duration-300 hover:scale-110 ${
            isFavorite ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{service.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{service.description}</p>

        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-900">{service.rating ?? '-'}</span>
            <span className="text-sm text-gray-500">({service.reviews ?? 0})</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">{service.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currency.format(service.price)}</div>
            <p className="text-xs text-gray-500 mt-0.5">per session</p>
          </div>
          <button 
            onClick={() => onBook(service)} 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------ ServicesPage ------------------------------ */
const ServicesPage = () => {
  const services = useServicesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);

  const handleBook = (service) => {
    setBookingService(service);
    setBookingOpen(true);
  };

  const handleConfirmBooking = async (booking) => {
    console.log('Booking confirmed:', booking);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredServices = useMemo(() => {
    let filtered = services;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }

    if (priceRange !== 'all') {
      if (priceRange === '0-500') filtered = filtered.filter(s => s.price <= 500);
      else if (priceRange === '500-1000') filtered = filtered.filter(s => s.price > 500 && s.price <= 1000);
      else if (priceRange === '1000-1500') filtered = filtered.filter(s => s.price > 1000 && s.price <= 1500);
      else if (priceRange === '1500') filtered = filtered.filter(s => s.price > 1500);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'popular': sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0)); break;
      case 'rating': sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'price-low': sorted.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-high': sorted.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      default: break;
    }
    return sorted;
  }, [services, searchTerm, selectedCategory, sortBy, priceRange]);

  const categories = useMemo(() => ([
    { id: 'all', name: 'All Services', count: services.length, icon: Sparkles },
    { id: 'cleaning', name: 'House Cleaning', count: services.filter(s => s.category === 'cleaning').length, icon: Star },
    { id: 'laundry', name: 'Laundry', count: services.filter(s => s.category === 'laundry').length, icon: Zap },
    { id: 'specialty', name: 'Specialty', count: services.filter(s => s.category === 'specialty').length, icon: Award },
  ]), [services]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl translate-y-48 -translate-x-48" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-blue-200 font-semibold">Premium Services</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">Professional Maid Services</h1>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">Experience exceptional cleaning services delivered right to your doorstep. Trusted by thousands of happy customers.</p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>100% Verified Professionals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Top Rated Services</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>Same Day Booking</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center text-blue-100 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <MapPin className="w-5 h-5 mr-2" />
              <span className="font-medium">Gurugram, Haryana</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-80 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-5 flex items-center gap-2 text-gray-900">
                <Filter className="w-5 h-5 text-blue-600" />
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button 
                      key={cat.id} 
                      onClick={() => setSelectedCategory(cat.id)} 
                      className={`w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 font-medium ${
                        selectedCategory === cat.id 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span>{cat.name}</span>
                        </div>
                        <span className={`text-sm px-2.5 py-1 rounded-full ${
                          selectedCategory === cat.id 
                            ? 'bg-white/20' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {cat.count}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="font-bold text-xl mb-5 text-gray-900">Price Range</h3>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: '0-500', label: '₹0 - ₹500' },
                  { value: '500-1000', label: '₹500 - ₹1,000' },
                  { value: '1000-1500', label: '₹1,000 - ₹1,500' },
                  { value: '1500', label: '₹1,500+' }
                ].map(price => (
                  <button 
                    key={price.value} 
                    onClick={() => setPriceRange(price.value)} 
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      priceRange === price.value 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Badges */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-4 text-gray-900">Why Choose Us?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Verified Professionals</p>
                    <p className="text-gray-600">Background checked staff</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Quality Guaranteed</p>
                    <p className="text-gray-600">100% satisfaction promise</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">Quick Service</p>
                    <p className="text-gray-600">Same day availability</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Search and Sort Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    placeholder="Search for services..." 
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 font-medium"
                  />
                </div>

                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={e => setSortBy(e.target.value)} 
                    className="appearance-none bg-white border-2 border-gray-300 rounded-xl px-5 py-3.5 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 font-medium min-w-[200px]"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  {filteredServices.length} Services Available
                </h2>
                <p className="text-gray-600 mt-1">Find the perfect service for your needs</p>
              </div>
            </div>

            {/* Services Grid */}
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredServices.map(s => (
                  <ServiceCard 
                    key={s.id} 
                    service={s} 
                    onBook={handleBook}
                    isFavorite={favorites.includes(s.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                <div className="text-gray-400 mb-4">
                  <Search className="w-20 h-20 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No services found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setPriceRange('all'); }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Booking Modal */}
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