'use client';
import { useState, useEffect } from 'react';
import { Calendar, User, Phone, MapPin, DollarSign, Clock, Filter, Search } from 'lucide-react';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all bookings
      const bookingsRes = await fetch('/api/admin/bookings');
      const bookingsData = await bookingsRes.json();
      
      // Fetch all providers (simple format)
      const providersRes = await fetch('/api/admin/providers?simple=true');
      const providersData = await providersRes.json();
      
      if (bookingsData.success) {
        setBookings(bookingsData.bookings || []);
      }
      
      if (providersData.success) {
        setProviders(providersData.providers || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProvidersForService = (serviceName) => {
    return providers.filter(p => p.services.includes(serviceName));
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter !== 'all' && booking.status !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        booking.serviceName.toLowerCase().includes(search) ||
        booking.customerName.toLowerCase().includes(search) ||
        booking.customerPhone.includes(search)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Bookings Panel</h1>
          <p className="text-gray-600">Manage all bookings and view provider assignments</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'accepted', 'completed', 'rejected', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                    filter === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total Bookings</h3>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Pending</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Accepted</h3>
              <User className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total Providers</h3>
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{providers.length}</p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <p className="text-gray-500 text-lg">No bookings found</p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const matchingProviders = getProvidersForService(booking.serviceName);
              
              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{booking.serviceName}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600">Category: <span className="font-semibold">{booking.serviceCategory}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">₹{booking.totalPrice}</p>
                        <p className="text-sm text-gray-500">{booking.paymentMethod}</p>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Customer</p>
                          <p className="font-semibold text-gray-900">{booking.customerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date & Time</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(booking.bookingDate).toLocaleDateString('en-IN')} at {booking.bookingTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold text-gray-900">{booking.customerAddress}</p>
                        </div>
                      </div>
                    </div>

                    {/* Provider Assignment */}
                    <div className="border-t pt-6">
                      <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Provider Assignment ({matchingProviders.length} available)
                      </h4>
                      
                      {booking.assignedProvider ? (
                        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                          <p className="text-green-700 font-semibold">
                            ✓ Assigned to: {booking.providerName || 'Provider'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {matchingProviders.length > 0 ? (
                            <>
                              <p className="text-sm text-gray-600 mb-3">
                                This booking was sent to {matchingProviders.length} provider(s) who offer "{booking.serviceName}":
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {matchingProviders.map(provider => (
                                  <div key={provider._id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-semibold text-gray-900">{provider.name}</p>
                                        <p className="text-sm text-gray-600">{provider.email}</p>
                                        <p className="text-sm text-gray-600">{provider.phone}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          Status: <span className="font-semibold">{provider.status}</span>
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs text-gray-500">Experience</p>
                                        <p className="font-bold text-blue-600">{provider.experience} yrs</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                              <p className="text-red-700 font-semibold">
                                ⚠️ No providers registered for "{booking.serviceName}"
                              </p>
                              <p className="text-sm text-red-600 mt-2">
                                Providers need to add this exact service name in their profile.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {booking.notes && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600">Notes:</p>
                        <p className="text-gray-900">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
