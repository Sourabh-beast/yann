'use client';

import { useState } from 'react';
import { X, Plus, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, IndianRupee } from 'lucide-react';
import useProviderSession from "@/hooks/useProviderSession";

// All available services categorized
const categorizedServices = {
  'Cleaning Services': [
    'Deep House Cleaning',
    'Regular House Cleaning',
    'Bathroom Deep Clean',
    'Kitchen Deep Clean',
    'Carpet Cleaning',
    'Sofa & Upholstery Clean',
    'Window Cleaning',
    'Move-in/Move-out Cleaning',
    'Office Cleaning',
    'Post-Construction Cleaning',
    'Balcony Cleaning',
    'Chimney & Exhaust Cleaning',
    'Water Tank Cleaning',
  ],
  'Laundry Services': [
    'Laundry & Ironing',
    'Dry Cleaning Service',
  ],
  'Pujari Services': [
    'Ganesh Puja at Home',
    'Griha Pravesh Puja',
    'Satyanarayan Katha',
    'Havan Ceremony',
    'Lakshmi Puja',
    'Rudrabhishek Puja',
    'Vastu Shanti Puja',
    'Vivah (Wedding Ceremony)',
    'Ring Ceremony',
    'Ramayan Path',
    'Mahamrityunjay Jaap',
    'Gayatri Jaap',
    'Pitra Shanti Puja',
    'Nav Graha Shanti',
    'Bhoomi Poojan',
    'Vaahan Poojan',
    'Shraadh Karm',
    'Janmadin Poojan',
    'Sundarkand Path',
  ],
  'Driver Services': [
    'Full-Day Personal Driver',
    'Outstation Driving Service'
  ],
  'Other Services': [
    'Other',
  ]
};

// Add Service Modal Component
function AddServiceModal({ isOpen, onClose, existingServices, providerId, onSuccess }) {
  const [step, setStep] = useState(1);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [servicePricing, setServicePricing] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const toggleCategory = (category) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleServiceSelect = (service) => {
    if (existingServices.includes(service)) return;
    
    setSelectedServices(prev => {
      if (prev.includes(service)) {
        const { [service]: _removed, ...restPricing } = servicePricing;
        setServicePricing(restPricing);
        return prev.filter(s => s !== service);
      }
      return [...prev, service];
    });
  };

  const handlePriceChange = (service, value) => {
    setServicePricing(prev => ({
      ...prev,
      [service]: value === '' ? '' : Math.max(0, Number(value))
    }));
  };

  const handleNext = () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async () => {
    const missingPrice = selectedServices.find(service => {
      const priceValue = Number(servicePricing[service]);
      return Number.isNaN(priceValue) || priceValue <= 0;
    });

    if (missingPrice) {
      setError(`Please enter a valid price for ${missingPrice}`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const serviceRates = selectedServices.map(serviceName => ({
        serviceName,
        price: Number(servicePricing[serviceName])
      }));

      const res = await fetch('/api/provider/add-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId,
          services: selectedServices,
          serviceRates
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          // Reset modal state
          setStep(1);
          setSelectedServices([]);
          setServicePricing({});
          setSubmitted(false);
        }, 3000);
      } else {
        setError(data.message || 'Failed to add services');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="relative p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50" />
            <div className="relative">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-amber-500/50">
                <Clock className="w-14 h-14 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Request Submitted!</h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-2">
                Your new service request has been sent for admin approval.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                We'll review your request within 24 hours. Your account status is now pending until approval.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Note:</span>
                </div>
                <p className="text-sm text-amber-600 mt-1">
                  Your existing services will continue to work normally during the review period.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-amber-600">
                <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Redirecting...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
          <div className="relative flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Add New Service</h2>
              <p className="text-purple-200">
                {step === 1 ? 'Select services you want to offer' : 'Set your pricing for each service'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-all"
            >
              <X size={24} />
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`} />
            <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Select the services you want to add. Services you already offer are disabled.
              </p>
              {Object.entries(categorizedServices).map(([category, services]) => (
                <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{category}</span>
                    {expandedCategories.includes(category) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {expandedCategories.includes(category) && (
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {services.map(service => {
                        const isExisting = existingServices.includes(service);
                        const isSelected = selectedServices.includes(service);
                        return (
                          <button
                            key={service}
                            type="button"
                            disabled={isExisting}
                            onClick={() => handleServiceSelect(service)}
                            className={`p-3 rounded-xl text-left text-sm transition-all ${
                              isExisting
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : isSelected
                                ? 'bg-purple-100 border-2 border-purple-500 text-purple-900'
                                : 'bg-white border border-gray-200 hover:border-purple-300 text-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isSelected && <CheckCircle className="w-4 h-4 text-purple-600" />}
                              {isExisting && <span className="text-xs text-gray-400">(Already added)</span>}
                              <span className={isExisting ? 'line-through' : ''}>{service}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Enter your rate for each selected service.
              </p>
              {selectedServices.map(service => (
                <div key={service} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{service}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <IndianRupee className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      placeholder="Enter rate"
                      value={servicePricing[service] || ''}
                      onChange={(e) => handlePriceChange(service, e.target.value)}
                      className="w-32 pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              ))}

              {/* 24hr notice */}
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-800">24-Hour Review Period</p>
                    <p className="text-sm text-amber-700 mt-1">
                      After submission, our admin team will review your new service request within 24 hours. 
                      Your account status will change to "pending" until approval. Your existing services 
                      will remain active during this period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
              >
                Next: Set Pricing
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Submit for Approval
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ServicesManager() {
  const { provider, loading, refresh } = useProviderSession();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const activeServices = provider?.services?.length ? provider.services : [];
  const serviceRates = provider?.serviceRates || [];
  const firstName = provider?.name?.split(" ")[0];
  const heading = firstName ? `${firstName}'s offerings` : "Your service catalogue";
  const ratingValue = typeof provider?.rating === "number" ? provider.rating.toFixed(1) : "0.0";
  const reviewsTotal = typeof provider?.totalReviews === "number" ? provider.totalReviews : 0;

  const getServiceRate = (serviceName) => {
    const rate = serviceRates.find(r => r.serviceName === serviceName);
    return rate ? rate.price : null;
  };

  const handleAddServiceSuccess = () => {
    // Refetch provider data to get updated services
    refresh?.();
    // Force page refresh to get latest data
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Services command centre</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{heading}</h1>
          <p className="text-gray-600 max-w-3xl">
            Review every package you provide, refine pricing, and keep availability aligned with demand. Update your
            listings in one place and watch them sync across the Yann marketplace.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[{
            label: "Active services",
            value: activeServices.length,
            helper: "Published services",
          }, {
            label: "Average rating",
            value: ratingValue,
            helper: reviewsTotal > 0 ? `${reviewsTotal} reviews` : "No reviews yet",
          }, {
            label: "Account Status",
            value: provider?.status || "Pending",
            helper: provider?.status === 'pending' ? 'Under review' : "Current status",
            highlight: provider?.status === 'pending'
          }, {
            label: "Experience",
            value: provider?.experience ? `${provider.experience}Y` : "0Y",
            helper: "Years of experience",
          }].map((card) => (
            <article key={card.label} className={`bg-white border rounded-2xl shadow-sm p-6 ${card.highlight ? 'border-amber-300 bg-amber-50' : 'border-gray-100'}`}>
              <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
              <p className={`text-3xl font-bold mb-1 capitalize ${card.highlight ? 'text-amber-600' : 'text-gray-900'}`}>{card.value}</p>
              <p className={`text-xs font-semibold uppercase tracking-widest ${card.highlight ? 'text-amber-500' : 'text-purple-600'}`}>{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-10">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your active services</h2>
              <p className="text-sm text-gray-500">Services you registered to provide</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Add New Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {activeServices.length === 0 && (
              <div className="md:col-span-3 p-12 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500">
                <p className="font-semibold text-lg mb-2">No services added yet</p>
                <p className="mb-4">Register services to start receiving booking requests</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Service
                </button>
              </div>
            )}

            {activeServices.map((serviceName) => {
              const rate = getServiceRate(serviceName);
              return (
                <article key={serviceName} className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">{serviceName}</h3>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                  </div>
                  {rate !== null && (
                    <div className="flex items-center gap-1 text-purple-700 font-bold text-xl mb-2">
                      <IndianRupee className="w-5 h-5" />
                      {rate}
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-4">Professional service offering</p>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Available for booking</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
            </div>
            {provider?.workingHours ? (
              <div className="border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-green-50">
                <p className="text-sm text-gray-600 mb-2">Daily Schedule</p>
                <p className="text-3xl font-bold text-gray-900">
                  {provider.workingHours.startTime} - {provider.workingHours.endTime}
                </p>
                <p className="text-sm text-gray-500 mt-2">Your availability window</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No working hours set</p>
              </div>
            )}
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Categories</h3>
            </div>
            {provider?.selectedCategories && provider.selectedCategories.length > 0 ? (
              <div className="space-y-2">
                {provider.selectedCategories.map((category) => (
                  <div key={category} className="border border-purple-100 rounded-xl px-4 py-3 bg-purple-50">
                    <p className="text-sm font-semibold text-purple-900">{category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No categories selected</p>
              </div>
            )}
          </article>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Information</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-gray-900">Email:</span> {provider?.email}</p>
                <p><span className="font-semibold text-gray-900">Phone:</span> {provider?.phone}</p>
                <p><span className="font-semibold text-gray-900">Experience:</span> {provider?.experience || 0} years</p>
                <p><span className="font-semibold text-gray-900">Status:</span> <span className="capitalize">{provider?.status || 'pending'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Links</h3>
              <div className="space-y-2">
                <a href="/dashboard/bookings" className="block text-sm text-blue-600 hover:underline">View Bookings</a>
                <a href="/dashboard/earnings" className="text-sm text-blue-600 hover:underline block">Check Earnings</a>
                <a href="/provider-dashboard" className="text-sm text-blue-600 hover:underline block">Provider Dashboard</a>
                <a href="/dashboard/profile" className="text-sm text-blue-600 hover:underline block">Edit Profile</a>
              </div>
            </div>
          </div>
          {loading && (
            <div className="mt-6 p-3 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading your service data...</span>
            </div>
          )}
        </section>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingServices={activeServices}
        providerId={provider?._id}
        onSuccess={handleAddServiceSuccess}
      />
    </div>
  );
}
