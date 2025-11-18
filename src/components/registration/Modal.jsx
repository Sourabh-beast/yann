'use client';
import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Clock, CheckCircle, Award, Shield, Sparkles } from 'lucide-react';

/**
 * @typedef {Object} ServiceProviderRegistrationProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 */

/**
 * @param {ServiceProviderRegistrationProps} props
 */
export default function ServiceProviderRegistration({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    services: [],
    startTime: '09:00',
    endTime: '17:00'
  });

  const serviceOptions = [
    'Deep House Cleaning',
    'Regular House Cleaning', 
    'Bathroom Deep Clean',
    'Kitchen Deep Clean',
    'Laundry & Ironing',
    'Dry Cleaning Service',
    'Carpet Cleaning',
    'Sofa & Upholstery Clean',
    'Window Cleaning',
    'Move-in/Move-out Cleaning',
    'Office Cleaning',
    'Post-Construction Cleaning',
    'Balcony Cleaning',
    'Chimney & Exhaust Cleaning',
    'Water Tank Cleaning',
    'Ganesh Puja at Home',
    'Griha Pravesh Puja',
    'Satyanarayan Katha',
    'Havan / Yagna Ceremony',
    'Lakshmi Puja (Diwali Special)',
    'Rudrabhishek Puja',
    'Vastu Shanti Puja',
    'Other'
  ];

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.services.length === 0) {
      alert('Please select at least one service');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            experience: '',
            services: [],
            startTime: '09:00',
            endTime: '17:00'
          });
          setSubmitted(false);
          onClose();
        }, 3000);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert('❌ Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  // Success State
  if (submitted) {
    return (
      <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="relative p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50" />
            <div className="relative">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-green-500/50">
                <CheckCircle className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Registration Successful!</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-2">
                Thank you for joining our network of trusted service providers.
              </p>
              <p className="text-sm text-gray-500">
                We'll review your application and get back to you within 24-48 hours.
              </p>
              
              <div className="mt-8 flex items-center justify-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-gradient-to-br from-black/60 via-black/50 to-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-3xl" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6" />
                <span className="text-blue-200 font-semibold text-sm">Join Our Network</span>
              </div>
              <h2 className="text-4xl font-bold mb-2">Service Provider Registration</h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                Become part of our trusted network and grow your business with thousands of customers
              </p>
              
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Verified Badge</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Award className="w-4 h-4" />
                  <span className="text-sm">Premium Support</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-350px)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="text-white" size={20} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Work Experience</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                  placeholder="Enter years of experience"
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>

            {/* Services */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">Services You Provide</h3>
                  <p className="text-sm text-gray-600 mt-1">Select all services you can offer to customers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceOptions.map(service => (
                  <label 
                    key={service} 
                    className={`group flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                      formData.services.includes(service)
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md shadow-blue-500/20'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                      className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-transform duration-300 hover:scale-110"
                    />
                    <span className={`text-sm font-medium ${
                      formData.services.includes(service) ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {service}
                    </span>
                  </label>
                ))}
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm font-semibold text-blue-700">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Selected: <span className="text-lg">{formData.services.length}</span> service(s)
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                  <Clock className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">Working Hours</h3>
                  <p className="text-sm text-gray-600 mt-1">Set your daily availability schedule</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-gray-400"
                    required
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-semibold text-orange-700">
                    Working Hours: <span className="text-base">{formData.startTime} - {formData.endTime}</span>
                    {(() => {
                      const start = formData.startTime.split(':').map(Number);
                      const end = formData.endTime.split(':').map(Number);
                      const startMinutes = start[0] * 60 + start[1];
                      const endMinutes = end[0] * 60 + end[1];
                      const diffMinutes = endMinutes - startMinutes;
                      
                      if (diffMinutes > 0) {
                        const hours = Math.floor(diffMinutes / 60);
                        const minutes = diffMinutes % 60;
                        return (
                          <span className="ml-2 text-orange-900 font-bold">
                            ({hours} hour{hours !== 1 ? 's' : ''}{minutes > 0 ? ` ${minutes} min` : ''})
                          </span>
                        );
                      }
                      return '';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              By registering, you agree to our terms and conditions
            </p>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2"></circle>
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Register Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}