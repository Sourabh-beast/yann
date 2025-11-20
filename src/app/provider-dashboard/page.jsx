'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Phone, MapPin, Calendar, DollarSign, TrendingUp, Package, AlertCircle, LogOut } from 'lucide-react';

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [providerData, setProviderData] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    // Check if provider is logged in
    const providerEmail = localStorage.getItem('providerEmail');
    if (!providerEmail) {
      router.push('/provider-login');
      return;
    }
    
    fetchProviderData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('providerEmail');
    localStorage.removeItem('providerName');
    localStorage.removeItem('providerId');
    router.push('/provider-login');
  };

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      
      // Get provider email from localStorage (set during registration/login)
      const providerEmail = localStorage.getItem('providerEmail');
      
      if (!providerEmail) {
        console.error('No provider email found. Please login first.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/provider/requests?email=${providerEmail}`);
      const data = await response.json();

      if (data.success) {
        setProviderData(data);
      } else {
        console.error('Failed to fetch provider data:', data.message);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    if (!providerData) return;

    try {
      setProcessingId(bookingId);
      
      const response = await fetch('/api/bookings/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          providerId: providerData.provider.id,
          providerName: providerData.provider.name
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Booking accepted successfully!');
        fetchProviderData(); // Refresh data
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('❌ Failed to accept booking');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    if (!providerData) return;

    const reason = prompt('Please provide a reason for rejection (optional):');

    try {
      setProcessingId(bookingId);
      
      const response = await fetch('/api/bookings/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          providerId: providerData.provider.id,
          reason
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Booking rejected. It will be offered to other providers.');
        fetchProviderData(); // Refresh data
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('❌ Failed to reject booking');
    } finally {
      setProcessingId(null);
    }
  };

  const currency = new Intl.NumberFormat('en-IN', { 
    style: 'currency', 
    currency: 'INR', 
    maximumFractionDigits: 0 
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in as a service provider to access this dashboard.</p>
        </div>
      </div>
    );
  }

  const { provider, stats, pendingRequests, acceptedBookings } = providerData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Provider Dashboard</h1>
              <p className="text-blue-100 text-lg">Welcome back, {provider.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-semibold"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Pending Requests</p>
                  <p className="text-3xl font-bold mt-1">{stats.pendingRequests}</p>
                </div>
                <Clock className="w-10 h-10 text-blue-200" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Accepted</p>
                  <p className="text-3xl font-bold mt-1">{stats.acceptedBookings}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-300" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">This Month</p>
                  <p className="text-2xl font-bold mt-1">{currency.format(stats.monthlyEarnings)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-yellow-300" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Earnings</p>
                  <p className="text-2xl font-bold mt-1">{currency.format(stats.totalEarnings)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-emerald-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Requests ({stats.pendingRequests})
          </button>
          <button
            onClick={() => setActiveTab('accepted')}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === 'accepted'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Bookings ({stats.acceptedBookings})
          </button>
        </div>

        {/* Pending Requests */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Pending Requests</h3>
                <p className="text-gray-600">You're all caught up! New requests will appear here.</p>
              </div>
            ) : (
              pendingRequests.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all border-2 border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-gray-900">{booking.serviceName}</h3>
                        {booking.isPujari && (
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                            Pujari Service
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">{currency.format(booking.totalPrice)}</p>
                      <p className="text-xs text-gray-500 mt-1">{booking.paymentMethod === 'cash' ? 'Cash After Service' : booking.paymentMethod}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Date & Time</p>
                        <p className="font-semibold text-gray-900">{booking.formattedDate}</p>
                        <p className="text-sm text-gray-700">{booking.bookingTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Customer Contact</p>
                        <p className="font-semibold text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-700">{booking.customerPhone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 md:col-span-2">
                      <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Service Address</p>
                        <p className="font-semibold text-gray-900">{booking.customerAddress}</p>
                      </div>
                    </div>
                  </div>

                  {booking.extras && booking.extras.length > 0 && (
                    <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-sm font-bold text-emerald-900 mb-2">Additional Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.extras.map((extra, idx) => (
                          <span key={idx} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                            {extra.serviceName} - {currency.format(extra.price)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.notes && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">Customer Notes:</p>
                      <p className="text-sm text-blue-800">{booking.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(booking.id)}
                      disabled={processingId === booking.id}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {processingId === booking.id ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Accept Booking
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(booking.id)}
                      disabled={processingId === booking.id}
                      className="flex-1 px-6 py-4 border-2 border-red-300 text-red-700 rounded-xl font-bold hover:bg-red-50 hover:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Accepted Bookings */}
        {activeTab === 'accepted' && (
          <div className="space-y-4">
            {acceptedBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Accepted Bookings</h3>
                <p className="text-gray-600">Accept some pending requests to see them here.</p>
              </div>
            ) : (
              acceptedBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl p-6 shadow-md border-2 border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{booking.serviceName}</h3>
                      <p className="text-sm text-gray-600 mb-3">{booking.customerName} - {booking.customerPhone}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-gray-700">
                          <Calendar className="w-4 h-4" />
                          {booking.formattedDate} at {booking.bookingTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{currency.format(booking.totalPrice)}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                        booking.status === 'completed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
