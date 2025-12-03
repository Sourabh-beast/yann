'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, Search, Filter, CheckCircle, XCircle, Clock, LogOut, Eye, Phone, Mail, MapPin, IndianRupee, AlertCircle, Plus } from 'lucide-react';

export default function ProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [searchTerm, statusFilter, serviceFilter, page]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (serviceFilter) params.append('service', serviceFilter);

      const res = await fetch(`/api/admin/providers?${params}`);
      const data = await res.json();
      if (data.success) {
        setProviders(data.data.providers);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProviderStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
        setDetailModalOpen(false);
        setSelectedProvider(null);
      }
    } catch (error) {
      console.error('Error updating provider:', error);
    }
  };

  const approveServiceRequest = async (providerId) => {
    try {
      const res = await fetch('/api/admin/providers/approve-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
        setDetailModalOpen(false);
        setSelectedProvider(null);
      }
    } catch (error) {
      console.error('Error approving service request:', error);
    }
  };

  const rejectServiceRequest = async (providerId) => {
    try {
      const res = await fetch('/api/admin/providers/reject-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
        setDetailModalOpen(false);
        setSelectedProvider(null);
      }
    } catch (error) {
      console.error('Error rejecting service request:', error);
    }
  };

  const openProviderDetail = (provider) => {
    setSelectedProvider(provider);
    setDetailModalOpen(true);
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: Activity },
    { label: 'Service Providers', href: '/admin/providers', icon: Briefcase },
    { label: 'Homeowners', href: '/admin/homeowners', icon: Users },
    { label: 'Requests', href: '/admin/requests', icon: ClipboardList },
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Providers</h2>
          <p className="text-gray-600">Manage and monitor all service providers on the platform.</p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
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
              <option value="active">Active</option>
              <option value="inactive">Coming Soon</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Services</option>
              <option value="Home Cleaning">Home Cleaning</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Carpentry">Carpentry</option>
              <option value="Painting">Painting</option>
              <option value="AC Repair">AC Repair</option>
            </select>
          </div>
        </div>

        {/* Providers Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Services & Pricing</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Experience</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Rating</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map((provider) => (
                    <tr key={provider._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{provider.name}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{provider.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{provider.phone}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <div className="flex flex-col gap-1 max-w-xs">
                          {(provider.serviceRates && provider.serviceRates.length > 0 
                            ? provider.serviceRates.slice(0, 3).map((rate, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 px-2 py-1 bg-blue-50 rounded-lg text-xs">
                                  <span className="text-blue-700 font-medium truncate">{rate.serviceName}</span>
                                  <span className="text-green-600 font-bold whitespace-nowrap">₹{rate.price?.toLocaleString('en-IN')}</span>
                                </div>
                              ))
                            : provider.services.slice(0, 3).map((service, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {service}
                                </span>
                              ))
                          )}
                          {((provider.serviceRates?.length || provider.services?.length || 0) > 3) && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium text-center">
                              +{(provider.serviceRates?.length || provider.services?.length) - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{provider.experience} yrs</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        ⭐ {provider.rating.toFixed(1)} ({provider.totalReviews})
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(provider.status)}`}>
                          {getStatusLabel(provider.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openProviderDetail(provider)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {provider.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateProviderStatus(provider._id, 'active')}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateProviderStatus(provider._id, 'inactive')}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {provider.status === 'active' && (
                            <button
                              onClick={() => updateProviderStatus(provider._id, 'inactive')}
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                              title="Deactivate"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          {provider.status === 'inactive' && (
                            <button
                              onClick={() => updateProviderStatus(provider._id, 'active')}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Activate"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} providers
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Provider Detail Modal */}
      {detailModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedProvider.name}</h3>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedProvider.status === 'active' ? 'bg-green-400/20 text-green-100' :
                  selectedProvider.status === 'pending' ? 'bg-yellow-400/20 text-yellow-100' :
                  'bg-red-400/20 text-red-100'
                }`}>
                  {getStatusLabel(selectedProvider.status)}
                </span>
              </div>
              <button 
                onClick={() => { setDetailModalOpen(false); setSelectedProvider(null); }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProvider.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProvider.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm font-medium text-gray-900">{selectedProvider.experience} years</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Activity className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-xs text-gray-500">Rating</p>
                    <p className="text-sm font-medium text-gray-900">⭐ {selectedProvider.rating?.toFixed(1) || 'N/A'} ({selectedProvider.totalReviews || 0} reviews)</p>
                  </div>
                </div>
              </div>

              {/* Pending Service Request */}
              {selectedProvider.pendingServiceRequest && selectedProvider.pendingServiceRequest.addedServices && selectedProvider.pendingServiceRequest.addedServices.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Pending Service Request
                  </h4>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                    <div className="mb-3 text-sm text-amber-700">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Requested on: {selectedProvider.pendingServiceRequest.requestedAt ? new Date(selectedProvider.pendingServiceRequest.requestedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">New services requesting approval:</p>
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      {selectedProvider.pendingServiceRequest.addedRates?.map((rate, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-amber-200">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-amber-600" />
                            <span className="font-medium text-gray-800">{rate.serviceName}</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">₹{rate.price?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => approveServiceRequest(selectedProvider._id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Services
                      </button>
                      <button
                        onClick={() => rejectServiceRequest(selectedProvider._id)}
                        className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject Services
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Services & Pricing */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  Current Services & Pricing
                </h4>
                {selectedProvider.serviceRates && selectedProvider.serviceRates.length > 0 ? (
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4">
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProvider.serviceRates.map((rate, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                          <span className="font-medium text-gray-800">{rate.serviceName}</span>
                          <span className="text-lg font-bold text-green-600">₹{rate.price?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedProvider.services && selectedProvider.services.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProvider.services.map((service, idx) => (
                      <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        {service}
                      </span>
                    ))}
                    <p className="w-full text-sm text-gray-500 mt-2 italic">Pricing not set by provider</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No services listed</p>
                )}
              </div>

              {/* Address if available */}
              {selectedProvider.address && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Address
                  </h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-xl">{selectedProvider.address}</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              {selectedProvider.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateProviderStatus(selectedProvider._id, 'inactive')}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => updateProviderStatus(selectedProvider._id, 'active')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </>
              )}
              {selectedProvider.status === 'active' && (
                <button
                  onClick={() => updateProviderStatus(selectedProvider._id, 'inactive')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Deactivate
                </button>
              )}
              {selectedProvider.status === 'inactive' && (
                <button
                  onClick={() => updateProviderStatus(selectedProvider._id, 'active')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Activate
                </button>
              )}
              <button
                onClick={() => { setDetailModalOpen(false); setSelectedProvider(null); }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
}

function getStatusLabel(status) {
  if (status === 'inactive') return 'Coming Soon';
  if (status === 'active') return 'Active';
  if (status === 'pending') return 'Pending';
  return status;
}
