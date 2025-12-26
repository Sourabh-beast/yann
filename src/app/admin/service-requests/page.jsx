'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, CheckCircle, XCircle, Clock, LogOut, Phone, Mail, IndianRupee, AlertCircle, Plus, Settings, BarChart3, Star, Bell, Gift, HeadphonesIcon, FileText, Package, DollarSign } from 'lucide-react';

export default function ServiceRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/service-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Service request approved!');
        fetchServiceRequests();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (providerId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, reason })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Service request rejected!');
        fetchServiceRequests();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('❌ Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: Activity },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Services', href: '/admin/services', icon: Package },
    { label: 'Service Providers', href: '/admin/providers', icon: Briefcase },
    { label: 'Service Requests', href: '/admin/service-requests', icon: AlertCircle },
    { label: 'Homeowners', href: '/admin/homeowners', icon: Users },
    { label: 'Bookings', href: '/admin/requests', icon: ClipboardList },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Financials', href: '/admin/financials', icon: DollarSign },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Promotions', href: '/admin/promotions', icon: Gift },
    { label: 'Support Tickets', href: '/admin/support', icon: HeadphonesIcon },
    { label: 'Audit Logs', href: '/admin/logs', icon: FileText },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
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
        
        <nav className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/admin/service-requests';
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-600'
                    }`}
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
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Service Requests</h2>
              <p className="text-gray-600">Review and approve provider service additions</p>
            </div>
          </div>
          {requests.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-xl font-medium">
              <Clock className="w-4 h-4" />
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </div>
          )}
        </header>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending service requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.providerId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Request Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.providerName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {request.providerEmail}
                        </div>
                        {request.providerPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {request.providerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <Clock className="w-4 h-4" />
                      {new Date(request.requestedAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Request Body */}
                <div className="p-6">
                  {/* Current Services */}
                  {request.currentServices && request.currentServices.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Current Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {request.currentRates && request.currentRates.length > 0 ? (
                          request.currentRates.map((rate, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                              <span className="text-gray-700 font-medium">{rate.serviceName}</span>
                              <span className="text-green-600 font-bold">₹{rate.price?.toLocaleString('en-IN')}</span>
                            </div>
                          ))
                        ) : (
                          request.currentServices.map((service, idx) => (
                            <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                              {service}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Services Requested */}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Services Requested
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {request.addedRates.map((rate, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">{rate.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                            <IndianRupee className="w-4 h-4" />
                            {rate.price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Info */}
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>
                      Provider status: <span className="font-semibold text-amber-700">{request.currentStatus}</span>
                      {request.previousStatus && request.previousStatus !== request.currentStatus && (
                        <span className="text-gray-500"> (was {request.previousStatus})</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                  <button
                    onClick={() => handleReject(request.providerId)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.providerId)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Services
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
