'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Search, Star, Clock, MapPin, Filter, Heart, ChevronDown, Sparkles, TrendingUp, Award, Shield, Zap, Calendar, CheckCircle, X, Car } from 'lucide-react';

const servicesData = [
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
  { id: 16, name: 'Ganesh Puja at Home', category: 'pujari', price: 2100, duration: '2-3 hours', rating: 4.9, reviews: 432, image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=400&h=300&fit=crop', description: 'Traditional Ganesh puja conducted by experienced pujari with all rituals and samagri included' },
  { id: 17, name: 'Griha Pravesh Puja', category: 'pujari', price: 3500, duration: '3-4 hours', rating: 4.8, reviews: 287, image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=400&h=300&fit=crop', description: 'Complete housewarming ceremony with Vastu puja and traditional rituals for new home' },
  { id: 18, name: 'Satyanarayan Katha', category: 'pujari', price: 2800, duration: '3-4 hours', rating: 4.9, reviews: 521, image: 'https://images.unsplash.com/photo-1603048674-cfdf1e52ec7f?w=400&h=300&fit=crop', description: 'Sacred Satyanarayan katha with puja, prasad preparation, and complete puja samagri', popular: true },
  { id: 19, name: 'Havan Ceremony', category: 'pujari', price: 4200, duration: '4-5 hours', rating: 4.8, reviews: 198, image: 'https://static.toiimg.com/thumb/msid-116430332,width-1280,height-720,resizemode-4/116430332.jpg', description: 'Traditional havan ceremony for peace, prosperity, and positive energy at your premises' },
  { id: 20, name: 'Lakshmi Puja (Diwali Special)', category: 'pujari', price: 2500, duration: '2-3 hours', rating: 4.9, reviews: 612, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=300&fit=crop', description: 'Auspicious Lakshmi puja for wealth and prosperity, ideal for Diwali and special occasions', popular: true },
  { id: 21, name: 'Rudrabhishek Puja', category: 'pujari', price: 3200, duration: '3-4 hours', rating: 4.7, reviews: 156, image: 'https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=400&h=300&fit=crop', description: 'Sacred Shiva puja with abhishek, mantra chanting, and complete Vedic rituals' },
  { id: 22, name: 'Vastu Shanti Puja', category: 'pujari', price: 3800, duration: '4-5 hours', rating: 4.8, reviews: 234, image: 'https://images.unsplash.com/photo-1606119174478-d2a0a9c2c91f?w=400&h=300&fit=crop', description: 'Comprehensive Vastu Shanti ceremony to remove doshas and bring harmony to your space' },

  // Driver Services (internal only)
  { id: 30, name: 'Full-Day Personal Driver', category: 'driver', price: 1000, duration: '10 hours included', rating: 4.9, reviews: 512, image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=300&fit=crop', description: 'Experienced chauffeur for city travel (10 hours included). Additional hours billed at double rate.', driverConfig: { baseHours: 10, hourlyRate: 100, overtimeMultiplier: 2 } },
];

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const BookingModal = ({ open, onClose, baseService, servicesList = [], onConfirm }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [billingType, setBillingType] = useState(baseService?.category === 'pujari' ? 'cash' : 'one-time');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [driverStartTime, setDriverStartTime] = useState('09:00');
  const [driverEndTime, setDriverEndTime] = useState('19:00');
  const [driverError, setDriverError] = useState('');
  const isDriverService = baseService?.category === 'driver';

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setCurrentStep(1);
      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedExtras([]);
      setBillingType(baseService?.category === 'pujari' ? 'cash' : (isDriverService ? 'hourly' : 'one-time'));
      setQuantity(1);
      setAddress('');
      setPhone('');
      setNotes('');
      setDriverStartTime('09:00');
      setDriverEndTime('19:00');
      setDriverError('');
      setStatus('idle');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open, baseService, isDriverService]);

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const availableDates = generateDates();

  const timeSlots = [
    { time: '08:00 AM', value: '08:00', available: true },
    { time: '09:00 AM', value: '09:00', available: true },
    { time: '10:00 AM', value: '10:00', available: true },
    { time: '11:00 AM', value: '11:00', available: true },
    { time: '12:00 PM', value: '12:00', available: true },
    { time: '01:00 PM', value: '13:00', available: false },
    { time: '02:00 PM', value: '14:00', available: true },
    { time: '03:00 PM', value: '15:00', available: true },
    { time: '04:00 PM', value: '16:00', available: true },
    { time: '05:00 PM', value: '17:00', available: true },
    { time: '06:00 PM', value: '18:00', available: true },
  ];

  const timeToMinutes = (value) => {
    if (!value || typeof value !== 'string' || !value.includes(':')) return null;
    const [hours, minutes] = value.split(':').map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const driverConfig = useMemo(() => {
    if (!isDriverService) return null;
    const baseHours = baseService?.driverConfig?.baseHours ?? 10;
    const hourlyRate = baseService?.driverConfig?.hourlyRate ?? (((baseService?.price || 0) / baseHours) || 0);
    const overtimeMultiplier = baseService?.driverConfig?.overtimeMultiplier ?? 2;
    return { baseHours, hourlyRate, overtimeMultiplier };
  }, [baseService, isDriverService]);

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
  }, [baseService, driverConfig, driverEndTime, driverStartTime, isDriverService]);

  useEffect(() => {
    if (!isDriverService) return;
    setDriverError(driverPricing?.error || '');
  }, [driverPricing, isDriverService]);

  const toggleExtra = (id) => {
    setSelectedExtras(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const extrasTotal = selectedExtras.reduce((acc, id) => {
    const s = servicesList.find(x => x.id === id);
    return acc + (s?.price || 0);
  }, 0);

  const basePrice = baseService?.price || 0;
  const driverBaseAmount = isDriverService && driverPricing && !driverPricing.error ? driverPricing.totalPrice : 0;
  const driverBaseCost = isDriverService && driverPricing && !driverPricing.error ? driverPricing.baseCost : 0;
  const driverOvertimeCost = isDriverService && driverPricing && !driverPricing.error ? driverPricing.overtimeCost : 0;
  const driverSelectedHours = isDriverService && driverPricing && !driverPricing.error ? driverPricing.totalHours : 0;
  const driverOvertimeHours = isDriverService && driverPricing && !driverPricing.error ? driverPricing.overtimeHours : 0;
  const resolvedTimeLabel = !isDriverService ? timeSlots.find(t => t.value === selectedTime)?.time : null;
  const formattedSchedule = isDriverService ? `${driverStartTime} - ${driverEndTime}` : (resolvedTimeLabel || '--');
  const totalPrice = isDriverService
    ? driverBaseAmount + extrasTotal
    : (basePrice + extrasTotal) * (billingType === 'monthly' ? 4 : 1) * quantity;

  const canProceed = () => {
    if (currentStep === 1) {
      if (!selectedDate) return false;
      if (isDriverService) {
        return Boolean(driverPricing && !driverPricing.error);
      }
      return Boolean(selectedTime);
    }
    if (currentStep === 2) return address.trim() && phone.trim();
    return false;
  };

  if (!open) return null;

  const handleConfirm = async () => {
    setStatus('submitting');
    setErrorMsg('');

    if (isDriverService && (!driverPricing || driverPricing.error)) {
      const message = driverPricing?.error || 'Please select valid start and end times';
      setDriverError(message);
      setErrorMsg(message);
      setStatus('idle');
      return;
    }

    const booking = {
      serviceId: baseService?.id || null,
      serviceName: baseService?.name || null,
      serviceCategory: baseService?.category || 'cleaning',
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      bookingDate: selectedDate?.toISOString(),
      bookingTime: isDriverService ? driverStartTime : selectedTime,
      basePrice: basePrice,
      extras: selectedExtras.map(extraId => {
        const extra = servicesList.find(s => s.id === extraId);
        return extra ? {
          serviceId: extra.id,
          serviceName: extra.name,
          price: extra.price
        } : null;
      }).filter(Boolean),
      totalPrice: totalPrice,
      paymentMethod: isDriverService ? 'online' : billingType,
      billingType: isDriverService ? 'hourly' : billingType,
      quantity: isDriverService ? (driverSelectedHours || 1) : quantity,
      notes: notes.trim()
    };

    if (isDriverService && driverPricing && !driverPricing.error) {
      booking.driverDetails = {
        startTime: driverStartTime,
        endTime: driverEndTime,
        baseHours: driverPricing.baseHours,
        hourlyRate: driverPricing.hourlyRate,
        overtimeMultiplier: driverPricing.overtimeMultiplier,
        totalHours: driverPricing.totalHours,
        overtimeHours: driverPricing.overtimeHours,
        baseCost: driverPricing.baseCost,
        overtimeCost: driverPricing.overtimeCost
      };
    }

    try {
      // Save booking to database
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      // Call parent onConfirm if provided
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
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-lg" />

        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative flex flex-col items-center text-white">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Booking Confirmed!</h3>
              <p className="text-green-100 text-center">We've received your booking request</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">Booking Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service</span>
                  <span className="font-semibold text-gray-900">{baseService?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span className="font-semibold text-gray-900">
                    {selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time</span>
                  <span className="font-semibold text-gray-900">{formattedSchedule}</span>
                </div>
                <div className="border-t-2 border-green-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {currency.format(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">📱 Confirmation sent!</span><br />
                Our team will contact you shortly at <span className="font-medium">{phone}</span> to confirm the booking.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setStatus('idle'); onClose?.(); }} 
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:-translate-y-0.5"
              >
                Done
              </button>
              <button 
                onClick={() => { setStatus('idle'); setCurrentStep(1); }} 
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-lg" onClick={() => { if (status === 'idle') onClose?.(); }} />

      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-48 translate-x-48" />
          
          <div className="relative flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100 text-sm font-semibold">Premium Service Booking</span>
              </div>
              <h2 className="text-3xl font-bold">{baseService?.name}</h2>
            </div>
            <button 
              onClick={() => { if (status === 'idle') onClose?.(); }} 
              className="p-2 rounded-full hover:bg-white/20 transition-all backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="relative flex items-center justify-between mt-6">
            {[
              { num: 1, label: 'Date & Time' },
              { num: 2, label: 'Your Details' },
              { num: 3, label: 'Review' }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base transition-all duration-300 ${
                    currentStep >= step.num 
                      ? 'bg-white text-blue-600 shadow-xl ring-4 ring-white/30' 
                      : 'bg-white/20 text-white/50 border-2 border-white/30'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className={`mt-2 text-sm font-semibold ${
                    currentStep >= step.num ? 'text-white drop-shadow-lg' : 'text-white/50'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                    currentStep > step.num ? 'bg-white' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Step 1: Date & Time */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Calendar */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Select Date
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {availableDates.slice(0, 21).map((date, idx) => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const isToday = new Date().toDateString() === date.toDateString();
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(date)}
                        className={`group relative p-3 rounded-xl border-2 transition-all duration-300 ${
                          isSelected
                            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                            : isToday
                            ? 'border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className={`text-xs font-semibold mb-1 ${
                          isSelected ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                        {isToday && !isSelected && (
                          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDate && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <p className="text-sm font-semibold text-blue-900">
                      📅 Selected: {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-purple-600" />
                  {isDriverService ? 'Select Driver Schedule' : 'Select Time Slot'}
                </h3>
                {isDriverService ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={driverStartTime}
                          onChange={(e) => setDriverStartTime(e.target.value)}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-semibold bg-white hover:border-purple-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                        <input
                          type="time"
                          value={driverEndTime}
                          onChange={(e) => setDriverEndTime(e.target.value)}
                          className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-semibold bg-white hover:border-purple-300"
                        />
                      </div>
                    </div>
                    {driverError ? (
                      <p className="text-sm font-semibold text-red-600">{driverError}</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 text-sm font-semibold text-gray-800">
                        <div>
                          <p className="text-xs text-gray-500">Included Hours</p>
                          <p>{driverPricing?.baseHours ?? driverConfig?.baseHours ?? 0} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Selected Hours</p>
                          <p>{driverSelectedHours || 0} hrs</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Overtime</p>
                          <p>{driverOvertimeHours || 0} hrs</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-base font-semibold bg-white hover:border-purple-300"
                  >
                    <option value="">Choose a time slot</option>
                    {timeSlots.map((slot) => (
                      <option 
                        key={slot.value} 
                        value={slot.value}
                        disabled={!slot.available}
                      >
                        {slot.time} {!slot.available ? '(Booked)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">{baseService?.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{baseService?.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {baseService?.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {baseService?.rating}
                      </span>
                      <span className="font-bold text-blue-600">{currency.format(baseService?.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your 10-digit mobile number"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-base font-medium"
                    maxLength="10"
                  />
                </div>

                {baseService?.category === 'pujari' ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setBillingType('cash')}
                        className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                          billingType === 'cash'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-600 text-white shadow-md'
                            : 'border-gray-300 hover:border-green-400 text-gray-700'
                        }`}
                      >
                        Cash After Pooja
                      </button>
                      <button
                        type="button"
                        disabled
                        className="p-4 rounded-xl border-2 border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed relative"
                      >
                        <div className="flex flex-col items-center">
                          <span>UPI</span>
                          <span className="text-xs mt-1 bg-orange-500 text-white px-2 py-0.5 rounded-full">Coming Soon</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : isDriverService ? (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Driver Billing</label>
                    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
                      <p className="text-sm text-gray-700 mb-2">Base coverage includes {driverConfig?.baseHours ?? 10} hours at ₹{driverConfig?.hourlyRate ?? 0}/hr. Additional hours auto-switch to {driverConfig?.overtimeMultiplier ?? 2}x.</p>
                      <div className="text-xs text-gray-500">Billing type locked to hourly for chauffeur bookings.</div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Billing Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'one-time', label: 'One Time' },
                        { value: 'monthly', label: 'Monthly' }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setBillingType(type.value)}
                          className={`p-3 rounded-xl border-2 font-semibold transition-all ${
                            billingType === type.value
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white shadow-md'
                              : 'border-gray-300 hover:border-blue-400 text-gray-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Service Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your complete address with landmark"
                  rows="3"
                  className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-base"
                />
              </div>

              {baseService?.category !== 'pujari' && servicesList.length > 0 && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Add-on Services (Optional)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {servicesList.slice(0, 4).map((service) => {
                      const isSelected = selectedExtras.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          onClick={() => toggleExtra(service.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-50'
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                            }`}>
                              {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-sm">{service.name}</p>
                              <p className="text-emerald-600 font-bold text-sm mt-1">{currency.format(service.price)}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {baseService?.category !== 'pujari' && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Special Instructions (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any specific requirements or instructions for the service provider..."
                    rows="3"
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-base"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6">
                <h3 className="text-2xl font-bold mb-4">Review Your Booking</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-100 mb-1">Service</p>
                    <p className="font-semibold">{baseService?.name}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">Date & Time</p>
                    <p className="font-semibold">
                      {selectedDate?.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} at {formattedSchedule}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">Phone</p>
                    <p className="font-semibold">{phone}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 mb-1">{isDriverService ? 'Billing' : baseService?.category === 'pujari' ? 'Payment Method' : 'Billing'}</p>
                    <p className="font-semibold">
                      {isDriverService
                        ? 'Hourly (auto overtime)'
                        : baseService?.category === 'pujari'
                          ? (billingType === 'cash' ? 'Cash After Pooja' : 'UPI')
                          : billingType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">Address</h4>
                <p className="text-gray-700">{address}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6">
                <h4 className="font-bold text-gray-900 mb-4">{baseService?.category === 'pujari' ? 'Price Details' : 'Price Breakdown'}</h4>
                <div className="space-y-3">
                  {isDriverService ? (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>Included Hours ({driverPricing?.baseHours ?? driverConfig?.baseHours ?? 10}h)</span>
                        <span className="font-semibold">{currency.format(driverBaseCost)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Selected Hours</span>
                        <span className="font-semibold">{driverSelectedHours || 0} hrs</span>
                      </div>
                      {driverOvertimeCost > 0 && (
                        <div className="flex justify-between text-gray-700">
                          <span>Overtime ({driverOvertimeHours || 0}h @ {driverPricing?.overtimeMultiplier ?? 2}x)</span>
                          <span className="font-semibold">{currency.format(driverOvertimeCost)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-700">
                        <span>{baseService?.category === 'pujari' ? 'Pooja Service' : 'Base Service'}</span>
                        <span className="font-semibold">{currency.format(basePrice)}</span>
                      </div>
                      {baseService?.category !== 'pujari' && billingType === 'monthly' && (
                        <div className="flex justify-between text-gray-700">
                          <span>Monthly (x4)</span>
                          <span className="font-semibold">x4</span>
                        </div>
                      )}
                    </>
                  )}
                  {extrasTotal > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Add-ons ({selectedExtras.length})</span>
                      <span className="font-semibold">{currency.format(extrasTotal)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-emerald-300 pt-3 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {currency.format(totalPrice)}
                    </span>
                  </div>
                  {baseService?.category === 'pujari' && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-2">
                      <p className="text-xs text-green-800">Payment will be collected after successful completion of the pooja</p>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-red-700">{errorMsg}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
          <div className="flex items-center justify-between gap-4">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-8 py-4 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                ← Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="ml-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg flex items-center gap-2"
              >
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={status === 'submitting'}
                className="ml-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Booking
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ service, onBook, isFavorite, onToggleFavorite}) => {
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
        
        {service.popular && (
          <span className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm bg-gradient-to-r from-orange-500 to-red-500 text-white">
            Popular
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

export default function MyServicesPage() {
  const { user, loading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingService, setBookingService] = useState(null);

  useEffect(() => {
    // Redirect if not logged in
    if (!loading && !isLoggedIn) {
      router.push('/');
    }
  }, [loading, isLoggedIn, router]);

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
    let filtered = servicesData;
    
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
  }, [searchTerm, selectedCategory, sortBy, priceRange]);

  const categories = useMemo(() => ([
    { id: 'all', name: 'All Services', count: servicesData.length, icon: Sparkles },
    { id: 'cleaning', name: 'House Cleaning', count: servicesData.filter(s => s.category === 'cleaning').length, icon: Star },
    { id: 'deep-clean', name: 'Deep Cleaning', count: servicesData.filter(s => s.category === 'deep-clean').length, icon: Award },
    { id: 'bathroom', name: 'Bathroom Cleaning', count: servicesData.filter(s => s.category === 'bathroom').length, icon: Shield },
    { id: 'kitchen', name: 'Kitchen Cleaning', count: servicesData.filter(s => s.category === 'kitchen').length, icon: Zap },
    { id: 'laundry', name: 'Laundry Services', count: servicesData.filter(s => s.category === 'laundry').length, icon: Heart },
    { id: 'carpet', name: 'Carpet & Upholstery', count: servicesData.filter(s => s.category === 'carpet').length, icon: Star },
    { id: 'window', name: 'Window Cleaning', count: servicesData.filter(s => s.category === 'window').length, icon: Sparkles },
    { id: 'move', name: 'Move In/Out', count: servicesData.filter(s => s.category === 'move').length, icon: Award },
    { id: 'pujari', name: 'Pujari Services', count: servicesData.filter(s => s.category === 'pujari').length, icon: Sparkles },
    { id: 'driver', name: 'Driver Services', count: servicesData.filter(s => s.category === 'driver').length, icon: Car },
    { id: 'specialty', name: 'Specialty Services', count: servicesData.filter(s => s.category === 'specialty').length, icon: Zap },
  ]), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 pt-16">
        <div className="text-center">
          <div className="inline-block relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg mt-6 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

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
                <span className="text-blue-200 font-semibold">Welcome, {user?.name || 'User'}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 leading-tight">Browse All Services</h1>
              <p className="text-xl text-blue-100 mb-6 leading-relaxed">Discover and book from our wide range of professional services tailored for you</p>
              
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
        servicesList={servicesData}
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}
