'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, Search, Filter, CheckCircle, XCircle, Clock, AlertCircle, LogOut, Calendar, Phone, MapPin, DollarSign, User, Car } from 'lucide-react';

export default function RequestsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalTab, setModalTab] = useState('booking'); // 'booking' or 'customer'
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all bookings
      const bookingsRes = await fetch('/api/admin/bookings');
      const bookingsData = await bookingsRes.json();
      
      // Fetch all providers
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

  const handleReviewBooking = (booking) => {
    setSelectedBooking(booking);
    setModalTab('booking');
    setReviewModalOpen(true);
  };

  const handleAcceptBooking = async () => {
    if (!selectedBooking) return;
    
    const providerEmail = prompt('Enter provider email to assign this booking:');
    if (!providerEmail) return;

    const provider = providers.find(p => p.email === providerEmail);
    if (!provider) {
      alert('Provider not found!');
      return;
    }

    try {
      setProcessingAction(true);
      
      const response = await fetch('/api/bookings/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          providerId: provider._id,
          providerName: provider.name
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Booking assigned successfully!');
        setReviewModalOpen(false);
        fetchData();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('❌ Failed to accept booking');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!selectedBooking) return;
    
    const reason = prompt('Enter reason for rejection:');
    if (!reason) return;

    try {
      setProcessingAction(true);
      
      const response = await fetch('/api/bookings/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          providerId: 'admin',
          rejectionReason: reason
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Booking rejected!');
        setReviewModalOpen(false);
        fetchData();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('❌ Failed to reject booking');
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter && booking.status !== statusFilter) return false;
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

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: Activity },
    { label: 'Service Providers', href: '/admin/providers', icon: Briefcase },
    { label: 'Homeowners', href: '/admin/homeowners', icon: Users },
    { label: 'Bookings', href: '/admin/requests', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-xl z-40 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            YANN Admin
          </h1>
          <p className="text-sm text-gray-500 mt-1">Management Panel</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600 transition-all duration-300 font-medium"
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={async () => {
              await fetch('/api/admin/logout', { method: 'POST' });
              router.push('/admin/login');
              router.refresh();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Bookings</h2>
              <p className="text-gray-600">Monitor all service bookings and provider assignments</p>
            </div>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'accepted').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-semibold">Total Providers</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{providers.length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by service, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => {
              const matchingProviders = getProvidersForService(booking.serviceName);
              
              return (
                <div key={booking._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <div className="p-6">
                    {/* Booking Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{booking.serviceName}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(booking.status)}`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600">Category: <span className="font-semibold capitalize">{booking.serviceCategory}</span></p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-blue-600">₹{booking.totalPrice}</p>
                        <p className="text-sm text-gray-500 capitalize">{booking.paymentMethod}</p>
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
                          {booking.serviceCategory === 'driver' && booking.driverDetails ? (
                            <div>
                              <p className="font-semibold text-gray-900">
                                {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
                              </p>
                              <p className="text-sm text-blue-600 font-semibold">
                                {booking.driverDetails.startTime} - {booking.driverDetails.endTime}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.driverDetails.totalHours} hrs • Overtime {booking.driverDetails.overtimeHours} hrs
                              </p>
                            </div>
                          ) : (
                            <p className="font-semibold text-gray-900">
                              {new Date(booking.bookingDate).toLocaleDateString('en-IN')} at {booking.bookingTime}
                            </p>
                          )}
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

                    {booking.serviceCategory === 'driver' && booking.driverDetails && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-2">
                          <Car className="w-4 h-4" /> Driver Pricing Summary
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                          <div>
                            <p className="text-gray-500">Included Hours</p>
                            <p className="font-semibold">{booking.driverDetails.baseHours} hrs</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Selected Hours</p>
                            <p className="font-semibold">{booking.driverDetails.totalHours} hrs</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Overtime Hours</p>
                            <p className="font-semibold">{booking.driverDetails.overtimeHours} hrs</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Overtime Rate</p>
                            <p className="font-semibold">₹{Number(booking.driverDetails.overtimeRate || 0).toFixed(2)}/hr</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Provider Assignment */}
                    <div className="border-t pt-6">
                      <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
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
                                          Status: <span className={`font-semibold ${provider.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>{provider.status}</span>
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

                    <div className="mt-4 text-xs text-gray-500">
                      Booking ID: {booking._id} • Created: {new Date(booking.createdAt).toLocaleString('en-IN')}
                    </div>

                    {/* Review Button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => handleReviewBooking(booking)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <ClipboardList className="w-5 h-5" />
                        Review Booking
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {reviewModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">Review Booking</h3>
                    <p className="text-blue-100 text-sm mt-1">Booking ID: {selectedBooking._id}</p>
                  </div>
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="flex">
                  <button
                    onClick={() => setModalTab('booking')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      modalTab === 'booking'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    📋 Booking Details
                  </button>
                  <button
                    onClick={() => setModalTab('customer')}
                    className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                      modalTab === 'customer'
                        ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    👤 Customer Details
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-280px)]">
                {modalTab === 'booking' ? (
                  <div className="space-y-6">
                    {/* Service Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                      <h4 className="font-bold text-xl text-gray-900 mb-4">Service Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Service Name</p>
                          <p className="font-bold text-lg text-gray-900">{selectedBooking.serviceName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Category</p>
                          <p className="font-bold text-lg text-gray-900 capitalize">{selectedBooking.serviceCategory}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Price</p>
                          <p className="font-bold text-2xl text-blue-600">₹{selectedBooking.totalPrice}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-bold text-lg text-gray-900 capitalize">{selectedBooking.paymentMethod}</p>
                        </div>
                      </div>
                      {selectedBooking.serviceCategory === 'driver' && selectedBooking.driverDetails && (
                        <div className="grid grid-cols-2 gap-4 mt-6">
                          <div>
                            <p className="text-sm text-gray-600">Included Hours</p>
                            <p className="font-bold text-lg text-gray-900">{selectedBooking.driverDetails.baseHours} hrs</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Overtime Multiplier</p>
                            <p className="font-bold text-lg text-gray-900">{selectedBooking.driverDetails.overtimeMultiplier}x</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Hourly Rate</p>
                            <p className="font-bold text-lg text-gray-900">₹{Number(selectedBooking.driverDetails.hourlyRate || 0).toFixed(2)}/hr</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Overtime Rate</p>
                            <p className="font-bold text-lg text-gray-900">₹{Number(selectedBooking.driverDetails.overtimeRate || 0).toFixed(2)}/hr</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Schedule */}
                    <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                      <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Schedule
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-bold text-lg text-gray-900">
                            {new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          {selectedBooking.serviceCategory === 'driver' && selectedBooking.driverDetails ? (
                            <div>
                              <p className="font-bold text-lg text-gray-900">
                                {selectedBooking.driverDetails.startTime} - {selectedBooking.driverDetails.endTime}
                              </p>
                              <p className="text-sm text-gray-600">{selectedBooking.driverDetails.totalHours} hrs total</p>
                              <p className="text-xs text-gray-500">Overtime {selectedBooking.driverDetails.overtimeHours} hrs</p>
                            </div>
                          ) : (
                            <p className="font-bold text-lg text-gray-900">{selectedBooking.bookingTime}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                      <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-600" />
                        Service Address
                      </h4>
                      <p className="text-gray-900 text-lg">{selectedBooking.customerAddress}</p>
                    </div>

                    {/* Notes */}
                    {selectedBooking.notes && (
                      <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                        <h4 className="font-bold text-xl text-gray-900 mb-4">Special Notes</h4>
                        <p className="text-gray-900">{selectedBooking.notes}</p>
                      </div>
                    )}

                    {/* Providers */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-600" />
                        Available Providers ({getProvidersForService(selectedBooking.serviceName).length})
                      </h4>
                      {getProvidersForService(selectedBooking.serviceName).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {getProvidersForService(selectedBooking.serviceName).map(provider => (
                            <div key={provider._id} className="bg-white border border-gray-200 rounded-xl p-4">
                              <p className="font-bold text-gray-900">{provider.name}</p>
                              <p className="text-sm text-gray-600">{provider.email}</p>
                              <p className="text-sm text-gray-600">{provider.phone}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{provider.experience} yrs exp</span>
                                <span className={`text-xs font-semibold ${provider.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                                  {provider.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-red-600">No providers available for this service</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                      <h4 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" />
                        Customer Information
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-bold text-lg text-gray-900">{selectedBooking.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-600" />
                            {selectedBooking.customerPhone}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-bold text-lg text-gray-900 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                            {selectedBooking.customerAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                      <h4 className="font-bold text-xl text-gray-900 mb-4">Booking Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Booking ID</span>
                          <span className="font-mono text-sm text-gray-900">{selectedBooking._id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(selectedBooking.status)}`}>
                            {selectedBooking.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Created At</span>
                          <span className="text-gray-900">{new Date(selectedBooking.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex gap-4">
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                    disabled={processingAction}
                  >
                    Cancel
                  </button>
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={handleRejectBooking}
                        className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={processingAction}
                      >
                        {processingAction ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            Reject
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleAcceptBooking}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        disabled={processingAction}
                      >
                        {processingAction ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Accept & Assign
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}