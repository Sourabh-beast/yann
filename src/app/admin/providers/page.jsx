'use client'
import { useState, useEffect } from 'react';
import { Users, Briefcase, ClipboardList, Activity, Search, Filter, CheckCircle, XCircle, Clock, Eye, Phone, Mail, MapPin, IndianRupee, AlertCircle, Plus, Ban, Trash2, ShieldCheck, Download, X } from 'lucide-react';

export default function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [blockModal, setBlockModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleBlockProvider = async (provider) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: provider._id,
          action: provider.isBlocked ? 'unblock' : 'block',
          reason: blockReason
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
        setBlockModal(null);
        setBlockReason('');
        alert(provider.isBlocked ? '✅ Provider unblocked!' : '✅ Provider blocked!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error blocking provider:', error);
      alert('❌ Failed to update provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProvider = async (provider) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: provider._id, action: 'delete' })
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
        setDeleteModal(null);
        alert('✅ Provider deleted!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('❌ Failed to delete provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyProvider = async (provider) => {
    try {
      const res = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: provider._id, action: 'verify' })
      });
      const data = await res.json();
      if (data.success) {
        fetchProviders();
        alert('✅ Provider verified!');
      }
    } catch (error) {
      console.error('Error verifying provider:', error);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/export?type=providers&format=csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `providers_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('❌ Failed to export');
    }
  };



  return (
    <>
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Providers</h2>
          <p className="text-gray-600">Manage and monitor all service providers on the platform.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
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
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      <div className="flex flex-col gap-1">
                        <span>{provider.name}</span>
                        {provider.isBlocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold w-fit">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </div>
                    </td>
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
                      ⭐ {provider.rating?.toFixed(1) ?? 'N/A'} ({provider.totalReviews ?? 0})
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
                        {!provider.isVerified && (
                          <button
                            onClick={() => handleVerifyProvider(provider)}
                            className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            title="Verify"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setBlockModal(provider)}
                          className={`p-2 rounded-lg transition-colors ${provider.isBlocked
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                          title={provider.isBlocked ? 'Unblock' : 'Block'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteModal(provider)}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Provider Detail Modal */}
      {detailModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedProvider.name}</h3>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${selectedProvider.status === 'active' ? 'bg-green-400/20 text-green-100' :
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

              {/* Blocked Banner */}
              {selectedProvider.isBlocked && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 overflow-hidden">
                  <div className="flex items-center gap-3 px-5 py-3 bg-red-600">
                    <Ban className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-white font-bold text-sm tracking-wide uppercase">Account Blocked</span>
                  </div>
                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Reason</p>
                      <p className="text-sm font-medium text-red-800">
                        {selectedProvider.blockedReason || 'No reason provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">Blocked On</p>
                      <p className="text-sm font-medium text-red-800">
                        {selectedProvider.blockedAt
                          ? new Date(selectedProvider.blockedAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
      
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
      
              {/* Driver Details */}
              {selectedProvider.driverServiceDetails && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🚗</span>
                    Driver Preference Details
                  </h4>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Trip Preference */}
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Trip Preference</p>
                        <p className="font-semibold text-gray-800 capitalize">
                          {selectedProvider.driverServiceDetails.tripPreference || 'Not specified'}
                        </p>
                      </div>
                      {/* Transmissions */}
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Transmission Types</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedProvider.driverServiceDetails.transmissionTypes && selectedProvider.driverServiceDetails.transmissionTypes.length > 0 ? (
                            selectedProvider.driverServiceDetails.transmissionTypes.map((type, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100 font-medium capitalize">
                                {type}
                              </span>
                            ))
                          ) : <span className="text-sm text-gray-400">None</span>}
                        </div>
                      </div>
                      {/* Vehicle Types */}
                      <div className="col-span-1 md:col-span-2 bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Vehicle Types</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedProvider.driverServiceDetails.vehicleTypes && selectedProvider.driverServiceDetails.vehicleTypes.length > 0 ? (
                            selectedProvider.driverServiceDetails.vehicleTypes.map((type, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-100 font-medium capitalize">
                                {type}
                              </span>
                            ))
                          ) : <span className="text-sm text-gray-400">None</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
      
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

      {/* Block/Unblock Modal */}
      {blockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${blockModal.isBlocked ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                  <Ban className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {blockModal.isBlocked ? 'Unblock Provider' : 'Block Provider'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {blockModal.isBlocked
                      ? `Are you sure you want to unblock ${blockModal.name}?`
                      : `Are you sure you want to block ${blockModal.name}?`
                    }
                  </p>
                </div>
              </div>
              {!blockModal.isBlocked && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for blocking</label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reason..."
                  />
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => { setBlockModal(null); setBlockReason(''); }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBlockProvider(blockModal)}
                  disabled={actionLoading}
                  className={`px-5 py-2.5 rounded-xl transition font-medium ${blockModal.isBlocked
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                    } disabled:opacity-50`}
                >
                  {actionLoading ? 'Processing...' : blockModal.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>
      )}

      {/* Delete Modal */}
      {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Provider</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Are you sure you want to delete {deleteModal.name}? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setDeleteModal(null)}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProvider(deleteModal)}
                  disabled={actionLoading}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
      )}
    </>
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
