'use client';
import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Clock } from 'lucide-react';

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
    'Home Cleaning', 'Plumbing', 'Electrical', 'Carpentry', 'Painting',
    'AC Repair', 'Appliance Repair', 'Pest Control', 'Beauty & Wellness',
    'Tutoring', 'Photography', 'Catering', 'Other'
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
        alert('✅ Registration submitted successfully!');
        onClose();

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          experience: '',
          services: [],
          startTime: '09:00',
          endTime: '17:00'
        });
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

  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold">Service Provider Registration</h2>
          <p className="text-blue-100 mt-1">Join our network of trusted service providers</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-186px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Work Experience</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter years of experience"
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Briefcase className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Services You Provide</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {serviceOptions.map(service => (
                  <label key={service} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Selected: {formData.services.length} service(s)
              </p>
            </div>

            {/* Working Hours */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="text-blue-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-800">Working Hours</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Working Hours:</strong> {formData.startTime} - {formData.endTime}
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-semibold disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Register Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}