'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { Search, Star, Clock, MapPin, Filter, Heart, ChevronDown, X, CheckCircle, Sparkles, TrendingUp, Award, Shield, Zap, Calendar, Lock, Car } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '@/components/LoginModal';

/* ------------------------------ sample data ------------------------------ */
const useServicesData = () => useMemo(() => ([
  // Cleaning Services
  { id: 1, name: 'Deep House Cleaning', category: 'deep-clean', price: 1200, duration: '3-4 hours', rating: 4.8, reviews: 1247, image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400&h=300&fit=crop', description: 'Complete deep cleaning of your entire house including bathrooms, kitchen, and all rooms', popular: true },
  { id: 2, name: 'Regular House Cleaning', category: 'cleaning', price: 800, duration: '2-3 hours', rating: 4.6, reviews: 892, image: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&h=300&fit=crop', description: 'Regular maintenance cleaning for your home on weekly or monthly basis', popular: true },
  { id: 3, name: 'Bathroom Deep Clean', category: 'bathroom', price: 400, duration: '1-2 hours', rating: 4.7, reviews: 634, image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=300&fit=crop', description: 'Specialized bathroom cleaning with sanitization and deep scrubbing' },
  { id: 4, name: 'Kitchen Deep Clean', category: 'kitchen', price: 600, duration: '2-3 hours', rating: 4.5, reviews: 445, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop', description: 'Complete kitchen cleaning including appliances, cabinets, and countertops' },
  
  // Laundry Services
  { id: 5, name: 'Laundry & Ironing', category: 'laundry', price: 300, duration: '2-4 hours', rating: 4.4, reviews: 321, image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=300&fit=crop', description: 'Professional laundry service with washing, drying, and ironing' },
  { id: 6, name: 'Dry Cleaning Service', category: 'laundry', price: 450, duration: '1 day', rating: 4.5, reviews: 278, image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=300&fit=crop', description: 'Professional dry cleaning for delicate and formal wear' },
  
  // Carpet & Window Services
  { id: 7, name: 'Carpet Cleaning', category: 'carpet', price: 500, duration: '1-2 hours', rating: 4.6, reviews: 278, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', description: 'Deep carpet cleaning with stain removal and sanitization' },
  { id: 8, name: 'Sofa & Upholstery Clean', category: 'carpet', price: 650, duration: '2-3 hours', rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', description: 'Professional sofa and upholstery deep cleaning service' },
  { id: 9, name: 'Window Cleaning', category: 'window', price: 350, duration: '1-2 hours', rating: 4.3, reviews: 189, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Interior and exterior window cleaning for crystal clear views' },
  
  // Specialty Services
  { id: 10, name: 'Move-in/Move-out Cleaning', category: 'move', price: 1500, duration: '4-6 hours', rating: 4.9, reviews: 567, image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&h=300&fit=crop', description: 'Comprehensive cleaning for moving in or out of a property' },
  { id: 11, name: 'Office Cleaning', category: 'specialty', price: 900, duration: '2-4 hours', rating: 4.6, reviews: 423, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop', description: 'Professional office and commercial space cleaning services' },
  { id: 12, name: 'Post-Construction Cleaning', category: 'specialty', price: 1800, duration: '5-7 hours', rating: 4.8, reviews: 289, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop', description: 'Detailed cleaning after construction or renovation work' },
  { id: 13, name: 'Balcony Cleaning', category: 'specialty', price: 250, duration: '1 hour', rating: 4.4, reviews: 156, image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop', description: 'Complete balcony and terrace cleaning service' },
  { id: 14, name: 'Chimney & Exhaust Cleaning', category: 'kitchen', price: 550, duration: '1-2 hours', rating: 4.5, reviews: 234, image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400&h=300&fit=crop', description: 'Deep cleaning of kitchen chimneys and exhaust systems' },
  { id: 15, name: 'Water Tank Cleaning', category: 'specialty', price: 800, duration: '2-3 hours', rating: 4.7, reviews: 198, image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop', description: 'Professional water tank cleaning and sanitization' },

  // Pujari Services
  { id: 16, name: 'Ganesh Puja at Home', category: 'pujari', price: 2100, duration: '2-3 hours', rating: 4.9, reviews: 432, image: 'https://cdn.shopify.com/s/files/1/2090/3151/files/MPB6116_a2e0c5a8-7c1a-4755-ae54-1b2cc7eaeab2_480x480.jpg?v=1715581380', description: 'Traditional Ganesh puja conducted by experienced pujari with all rituals and samagri included' },
  { id: 17, name: 'Griha Pravesh Puja', category: 'pujari', price: 3500, duration: '3-4 hours', rating: 4.8, reviews: 287, image: 'data:image/jpeg;base64,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', description: 'Complete housewarming ceremony with Vastu puja and traditional rituals for new home' },
  { id: 18, name: 'Satyanarayan Katha', category: 'pujari', price: 2800, duration: '3-4 hours', rating: 4.9, reviews: 521, image: 'https://wiralfeed.wordpress.com/wp-content/uploads/2015/10/satyanarayana_swamy_pooja.jpg', description: 'Sacred Satyanarayan katha with puja, prasad preparation, and complete puja samagri', popular: true },
  { id: 19, name: 'Havan Ceremony', category: 'pujari', price: 4200, duration: '4-5 hours', rating: 4.8, reviews: 198, image: 'https://sanity-admin.rudraksha-ratna.com/static/images/blogs/havan%2Bkund.jpg', description: 'Traditional havan ceremony for peace, prosperity, and positive energy at your premises' },
  { id: 20, name: 'Lakshmi Puja', category: 'pujari', price: 2500, duration: '2-3 hours', rating: 4.9, reviews: 612, image: 'https://resources.ganeshaspeaks.com/wp-content/uploads/2024/06/Laxmi-Puja_1-2-1024x1024.webp', description: 'Auspicious Lakshmi puja for wealth and prosperity, ideal for Diwali and special occasions', popular: true },
  { id: 21, name: 'Rudrabhishek Puja', category: 'pujari', price: 3200, duration: '3-4 hours', rating: 4.7, reviews: 156, image: 'https://temple.yatradham.org/public/Product/puja-rituals/puja-rituals_NhFBvsos_202508122106500.webp', description: 'Sacred Shiva puja with abhishek, mantra chanting, and complete Vedic rituals' },
  { id: 22, name: 'Vastu Shanti Puja', category: 'pujari', price: 3800, duration: '4-5 hours', rating: 4.8, reviews: 234, image: 'https://www.harivara.com/wp-content/uploads/2017/04/Vastu-Shanti-Puja-Harivara-Hindi.jpg', description: 'Comprehensive Vastu Shanti ceremony to remove doshas and bring harmony to your space' },

  // Driver Services
  { id: 30, name: 'Full-Day Personal Driver', category: 'driver', price: 1000, duration: '10 hrs included', rating: 4.9, reviews: 512, image: 'https://img3.exportersindia.com/product_images/bc-full/2020/4/6825337/personal-driver-hire-services-1587207037-5379171.jpg', description: 'Hire a verified personal driver for full-day city commutes with transparent overtime billing.', badge: 'Premium', driverConfig: { baseHours: 10, hourlyRate: 100, overtimeMultiplier: 2 } },
  { id: 31, name: 'Outstation Driving Service', category: 'driver', price: 1600, duration: '12 hrs included', rating: 4.8, reviews: 341, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU7Cv46ra4TewB-zaeZSKaOcOoDQ92Viqhw0eRUpNvttweH1eY24iDrRp03t9H0AhVFF8&usqp=CAU', description: 'Experienced highway drivers for weekend getaways or business trips outside the city. Night halt friendly.', driverConfig: { baseHours: 12, hourlyRate: 130, overtimeMultiplier: 1.75 } },


]), []);

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/* ------------------------------ BookingModal ------------------------------ */
const BookingModal = ({ open, onClose, baseService, servicesList = [], onConfirm }) => {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [billingType, setBillingType] = useState('hourly');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [driverStartTime, setDriverStartTime] = useState('09:00');
  const [driverEndTime, setDriverEndTime] = useState('19:00');
  const [driverError, setDriverError] = useState('');

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().slice(0, 10));
      setTime('09:00');
      setSelectedExtras([]);
      setBillingType('hourly');
      setQuantity(1);
      setNotes('');
      setStatus('idle');
      setErrorMsg('');
      setDriverStartTime('09:00');
      setDriverEndTime('19:00');
      setDriverError('');
    }
  }, [open]);

  if (!open) return null;

  const isDriverService = baseService?.category === 'driver';

  const driverConfig = useMemo(() => {
    if (!isDriverService) return null;
    const baseHours = baseService?.driverConfig?.baseHours ?? 10;
    const hourlyRate = baseService?.driverConfig?.hourlyRate ?? (((baseService?.price || 0) / baseHours) || 0);
    const overtimeMultiplier = baseService?.driverConfig?.overtimeMultiplier ?? 2;
    return { baseHours, hourlyRate, overtimeMultiplier };
  }, [baseService, isDriverService]);

  const timeToMinutes = (value) => {
    if (!value || typeof value !== 'string' || !value.includes(':')) return null;
    const [hours, minutes] = value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const driverPricing = useMemo(() => {
    if (!isDriverService) return null;
    const startMinutes = timeToMinutes(driverStartTime);
    const endMinutes = timeToMinutes(driverEndTime);
    if (startMinutes === null || endMinutes === null) {
      return { error: 'Please select valid start and end times' };
    }
    if (endMinutes <= startMinutes) {
      return { error: 'End time must be later than start time' };
    }

    const totalMinutes = endMinutes - startMinutes;
    const totalHours = totalMinutes / 60;
    const baseHours = driverConfig?.baseHours ?? 10;
    const hourlyRate = driverConfig?.hourlyRate ?? (((baseService?.price || 0) / baseHours) || 0);
    const overtimeMultiplier = driverConfig?.overtimeMultiplier ?? 2;
    const overtimeHours = Math.max(0, totalHours - baseHours);
    const billableBaseHours = Math.min(totalHours, baseHours);
    const baseCost = billableBaseHours * hourlyRate;
    const overtimeRate = hourlyRate * overtimeMultiplier;
    const overtimeCost = overtimeHours * overtimeRate;

    return {
      totalPrice: baseCost + overtimeCost,
      totalHours: Number(totalHours.toFixed(2)),
      overtimeHours: Number(overtimeHours.toFixed(2)),
      baseHours,
      hourlyRate,
      overtimeMultiplier,
      overtimeRate,
      baseCost,
      overtimeCost
    };
  }, [baseService?.price, driverConfig, driverEndTime, driverStartTime, isDriverService]);

  useEffect(() => {
    if (!isDriverService) return;
    if (driverPricing?.error) {
      setDriverError(driverPricing.error);
    } else {
      setDriverError('');
    }
  }, [driverPricing, isDriverService]);

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
  const unitPrice = basePrice + extrasTotal;
  const multiplier = billingType === 'hourly' ? quantity : billingType === 'daily' ? quantity : quantity;
  const driverBaseAmount = isDriverService && driverPricing && !driverPricing.error ? driverPricing.totalPrice : 0;
  const totalPrice = isDriverService ? driverBaseAmount + extrasTotal : unitPrice * multiplier;
  const scheduleDisplay = isDriverService ? `${driverStartTime} - ${driverEndTime}` : time;
  const driverBaseCost = isDriverService && driverPricing && !driverPricing.error ? driverPricing.baseCost : 0;
  const driverOvertimeCost = isDriverService && driverPricing && !driverPricing.error ? driverPricing.overtimeCost : 0;

  const handleConfirm = async () => {
    setStatus('submitting');
    setErrorMsg('');

    if (isDriverService) {
      if (!driverPricing || driverPricing.error) {
        const message = driverPricing?.error || 'Please select valid driver schedule';
        setDriverError(message);
        setErrorMsg(message);
        setStatus('error');
        return;
      }
    }

    const booking = {
      serviceId: baseService?.id || null,
      serviceName: baseService?.name || null,
      date,
      time: isDriverService ? driverStartTime : time,
      billingType: isDriverService ? 'hourly' : billingType,
      quantity: isDriverService ? (driverPricing?.totalHours || 1) : quantity,
      extras: selectedExtras,
      notes,
      totalPrice,
      ...(isDriverService && driverPricing && !driverPricing.error ? {
        driverDetails: {
          startTime: driverStartTime,
          endTime: driverEndTime,
          baseHours: driverPricing.baseHours,
          hourlyRate: driverPricing.hourlyRate,
          overtimeMultiplier: driverPricing.overtimeMultiplier,
          totalHours: driverPricing.totalHours,
          overtimeHours: driverPricing.overtimeHours
        }
      } : {})
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
          <p className="text-gray-600 text-center mb-6 leading-relaxed">Your booking for <span className="font-semibold text-gray-800">{baseService?.name}</span> on <span className="font-medium text-green-600">{date}</span> at <span className="font-medium text-green-600">{scheduleDisplay}</span> has been confirmed.</p>
          
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
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                  />
                </div>
                {isDriverService ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={driverStartTime}
                        onChange={(e) => setDriverStartTime(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={driverEndTime}
                        onChange={(e) => setDriverEndTime(e.target.value)}
                        className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                      />
                    </div>
                  </div>
                ) : (
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
                )}
                {isDriverService && driverError && (
                  <p className="text-sm text-red-600 font-medium">{driverError}</p>
                )}
              </div>
            </div>

            {!isDriverService && (
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
            )}

            {!isDriverService && (
              <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Billing Type</label>
                <div className="grid grid-cols-3 gap-3">
                  {['hourly', 'daily', 'monthly'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBillingType(type)}
                      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        billingType === type
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                          : 'border-2 border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity ({billingType === 'hourly' ? 'Hours' : billingType === 'daily' ? 'Days' : 'Months'})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={billingType === 'hourly' ? '24' : billingType === 'daily' ? '90' : '12'}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                  />
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
            )}
          </div>
        </div>

        <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-medium">Base Service</span>
              <span className="font-semibold text-gray-900">
                {isDriverService ? currency.format(driverBaseCost) : currency.format(basePrice)}
              </span>
            </div>
            {isDriverService ? (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Included Hours</span>
                  <span className="font-semibold text-gray-900">{driverPricing?.baseHours ?? driverConfig?.baseHours ?? 0} hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Selected Hours</span>
                  <span className="font-semibold text-gray-900">{driverPricing?.totalHours ?? 0} hrs</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Overtime Hours</span>
                  <span className="font-semibold text-gray-900">{driverPricing?.overtimeHours ?? 0} hrs</span>
                </div>
                {driverOvertimeCost > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Overtime ({driverPricing?.overtimeMultiplier ?? 2}x)</span>
                    <span className="font-semibold text-gray-900">{currency.format(driverOvertimeCost)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {extrasTotal > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Additional Services</span>
                    <span className="font-semibold text-gray-900">{currency.format(extrasTotal)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Billing Type</span>
                  <span className="font-semibold text-gray-900">{billingType.charAt(0).toUpperCase() + billingType.slice(1)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Quantity</span>
                  <span className="font-semibold text-gray-900">{quantity} {billingType === 'hourly' ? (quantity === 1 ? 'hour' : 'hours') : billingType === 'daily' ? (quantity === 1 ? 'day' : 'days') : (quantity === 1 ? 'month' : 'months')}</span>
                </div>
              </>
            )}
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
const ServiceCard = ({ service, onBook, isFavorite, onToggleFavorite, isLoggedIn }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = service.category === 'driver' || service.category === 'pujari';

  const handleBookClick = () => {
    if (!isActive) return;
    onBook?.(service);
  };

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-md overflow-hidden transition-all duration-500 hover:-translate-y-2 ${isActive ? 'hover:shadow-2xl' : 'opacity-80'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={service.image} 
          alt={service.name} 
          className={`w-full h-56 object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'} ${isActive ? '' : 'filter grayscale'}`} 
          loading="lazy" 
        />
        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        {service.badge && isActive && (
          <span className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm transition-all duration-300 ${
            service.badge === 'Bestseller' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
            service.badge === 'Popular' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
            service.badge === 'New' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
            'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}>
            {service.badge}
          </span>
        )}

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="px-4 py-1.5 rounded-full bg-black/70 text-white text-xs font-semibold uppercase tracking-wider">Inactive</span>
          </div>
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

        {isLoggedIn ? (
          <>
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
                onClick={handleBookClick}
                disabled={!isActive}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5'
                    : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isActive ? 'Book Now' : 'Inactive'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900">{service.rating ?? '-'}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Login for details</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-600">Starting from</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currency.format(service.price)}</div>
              </div>
              <button
                onClick={handleBookClick}
                disabled={!isActive}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg ${
                  isActive 
                    ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                    : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                }`}
              >
                {isActive ? 'Login to Book' : 'Inactive'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ------------------------------ ServicesPage ------------------------------ */
const ServicesPage = () => {
  const { isLoggedIn, user } = useAuth();
  const services = useServicesData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('gurugram');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingBookingService, setPendingBookingService] = useState(null);

  const handleBook = (service) => {
    if (!isLoggedIn) {
      // Store the service for booking after login
      setPendingBookingService(service);
      setLoginModalOpen(true);
    } else {
      setBookingService(service);
      setBookingOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    // After successful login, open booking modal with the pending service
    if (pendingBookingService) {
      setBookingService(pendingBookingService);
      setBookingOpen(true);
      setPendingBookingService(null);
    }
  };

  const handleConfirmBooking = async (booking) => {
    try {
      // Get customer phone from auth or prompt
      const customerPhone = prompt('Please enter your contact number (10 digits):');
      
      if (!customerPhone || !/^[0-9]{10}$/.test(customerPhone)) {
        throw new Error('Please enter a valid 10-digit phone number');
      }

      const customerAddress = prompt('Please enter your complete address:');
      
      if (!customerAddress || customerAddress.trim().length < 10) {
        throw new Error('Please enter a complete address');
      }

      // Prepare booking data
      const bookingPayload = {
        serviceId: booking.serviceId,
        serviceName: booking.serviceName,
        serviceCategory: bookingService?.category || 'general',
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        bookingDate: booking.date,
        bookingTime: booking.time,
        basePrice: bookingService?.price || 0,
        extras: booking.extras || [],
        totalPrice: booking.totalPrice,
        paymentMethod: bookingService?.category === 'pujari' ? 'cash' : 'online',
        billingType: booking.billingType || 'one-time',
        quantity: booking.quantity || 1,
        notes: booking.notes || '',
        customerName: user?.role === 'homeowner' ? user?.name || 'Guest' : 'Guest'
      };

      if (user?.role === 'homeowner' && user?.id) {
        bookingPayload.customerId = user.id;
      }

      if (booking.driverDetails) {
        bookingPayload.driverDetails = booking.driverDetails;
      }

      console.log('Creating booking:', bookingPayload);

      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      console.log('Booking created successfully:', data);
      alert(`Booking confirmed! ${data.notifiedProviders} service providers have been notified.`);
      
    } catch (error) {
      console.error('Booking error:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleLocationChange = (newLocation) => {
    setSelectedLocation(newLocation);
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('popular');
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

    const activeServices = [];
    const inactiveServices = [];
    sorted.forEach(service => {
      if (service.category === 'driver' || service.category === 'pujari') {
        activeServices.push(service);
      } else {
        inactiveServices.push(service);
      }
    });

    return [...activeServices, ...inactiveServices];
  }, [services, searchTerm, selectedCategory, sortBy, priceRange]);

  const categories = useMemo(() => ([
    { id: 'all', name: 'All Services', count: services.length, icon: Sparkles },
    { id: 'cleaning', name: 'House Cleaning', count: services.filter(s => s.category === 'cleaning').length, icon: Star },
    { id: 'deep-clean', name: 'Deep Cleaning', count: services.filter(s => s.category === 'deep-clean').length, icon: Award },
    { id: 'bathroom', name: 'Bathroom Cleaning', count: services.filter(s => s.category === 'bathroom').length, icon: Shield },
    { id: 'kitchen', name: 'Kitchen Cleaning', count: services.filter(s => s.category === 'kitchen').length, icon: Zap },
    { id: 'laundry', name: 'Laundry Services', count: services.filter(s => s.category === 'laundry').length, icon: Heart },
    { id: 'carpet', name: 'Carpet & Upholstery', count: services.filter(s => s.category === 'carpet').length, icon: Star },
    { id: 'window', name: 'Window Cleaning', count: services.filter(s => s.category === 'window').length, icon: Sparkles },
    { id: 'move', name: 'Move In/Out', count: services.filter(s => s.category === 'move').length, icon: Award },
    { id: 'pujari', name: 'Pujari Services', count: services.filter(s => s.category === 'pujari').length, icon: Sparkles },
    { id: 'driver', name: 'Personal Drivers', count: services.filter(s => s.category === 'driver').length, icon: Car },
    { id: 'specialty', name: 'Specialty Services', count: services.filter(s => s.category === 'specialty').length, icon: Zap },
  ]), [services]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 pt-16">
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
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">Home Care & Personal Drivers</h1>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">From spotless homes to verified daily drivers, experience hotel-grade convenience delivered right to your doorstep.</p>
              
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
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  <span>Licensed Personal Drivers</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={e => handleLocationChange(e.target.value)}
                className="w-full appearance-none text-blue-100 bg-white/10 backdrop-blur-sm rounded-2xl pl-12 pr-12 py-4 border border-white/20 font-medium cursor-pointer hover:bg-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="gurugram" className="bg-blue-700 text-white">Gurugram, Haryana</option>
                <option value="delhi" className="bg-blue-700 text-white">Delhi NCR</option>
                <option value="noida" className="bg-blue-700 text-white">Noida, UP</option>
                <option value="ghaziabad" className="bg-blue-700 text-white">Ghaziabad, UP</option>
                <option value="faridabad" className="bg-blue-700 text-white">Faridabad, Haryana</option>
              </select>
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-100 pointer-events-none" />
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-100 pointer-events-none" />
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
                    isLoggedIn={isLoggedIn}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          setPendingBookingService(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        defaultPanel="resident"
      />
    </div>
  );
};

export default ServicesPage;