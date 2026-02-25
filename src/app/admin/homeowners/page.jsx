'use client'
import { useState, useEffect } from 'react';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, Search, Mail, Phone, MapPin, LogOut, Ban, Trash2, ShieldCheck, Download, Eye, DollarSign, Package, Settings, BarChart3, Star, Bell, Gift, HeadphonesIcon, FileText } from 'lucide-react';

export default function HomeownersPage() {
  const [homeowners, setHomeowners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  
  // Modal states
  const [blockModal, setBlockModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [blockReason, setBlockReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchHomeowners();
  }, [searchTerm, page]);

  const fetchHomeowners = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (searchTerm) params.append('search', searchTerm);

      const res = await fetch(`/api/admin/homeowners?${params}`);
      const data = await res.json();
      if (data.success) {
        setHomeowners(data.data.homeowners);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching homeowners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockHomeowner = async (homeowner) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/homeowners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: homeowner._id, 
          action: homeowner.isBlocked ? 'unblock' : 'block',
          reason: blockReason
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchHomeowners();
        setBlockModal(null);
        setBlockReason('');
        alert(homeowner.isBlocked ? '✅ Homeowner unblocked!' : '✅ Homeowner blocked!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error blocking homeowner:', error);
      alert('❌ Failed to update homeowner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteHomeowner = async (homeowner) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/homeowners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: homeowner._id, action: 'delete' })
      });
      const data = await res.json();
      if (data.success) {
        fetchHomeowners();
        setDeleteModal(null);
        alert('✅ Homeowner deleted!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error deleting homeowner:', error);
      alert('❌ Failed to delete homeowner');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyHomeowner = async (homeowner) => {
    try {
      const res = await fetch('/api/admin/homeowners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: homeowner._id, action: 'verify' })
      });
      const data = await res.json();
      if (data.success) {
        fetchHomeowners();
        alert('✅ Homeowner verified!');
      }
    } catch (error) {
      console.error('Error verifying homeowner:', error);
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/admin/export?type=homeowners&format=csv');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `homeowners_export_${new Date().toISOString().split('T')[0]}.csv`;
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Homeowners</h2>
            <p className="text-gray-600">View and manage all registered homeowners on the platform.</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </header>

        {/* Search */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
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
        </div>

        {/* Homeowners Grid/Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : homeowners.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No homeowners found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {homeowners.map((homeowner) => (
              <div 
                key={homeowner._id} 
                className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  homeowner.isBlocked ? 'border-red-200 bg-red-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                      homeowner.isBlocked 
                        ? 'bg-red-500' 
                        : 'bg-gradient-to-br from-blue-500 to-purple-500'
                    }`}>
                      {homeowner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {homeowner.name}
                        {homeowner.isVerified && (
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(homeowner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {homeowner.isBlocked && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                      Blocked
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{homeowner.email}</span>
                  </div>
                  {homeowner.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{homeowner.phone}</span>
                    </div>
                  )}
                  {homeowner.addressBook && homeowner.addressBook.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{homeowner.addressBook[0].city || 'No city'}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{homeowner.savedProviders?.length || 0}</p>
                    <p className="text-xs text-gray-500">Saved Providers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{homeowner.addressBook?.length || 0}</p>
                    <p className="text-xs text-gray-500">Addresses</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDetailModal(homeowner)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!homeowner.isVerified && (
                      <button
                        onClick={() => handleVerifyHomeowner(homeowner)}
                        className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
                        title="Verify"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBlockModal(homeowner)}
                      className={`p-2 rounded-lg transition ${
                        homeowner.isBlocked 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                      title={homeowner.isBlocked ? 'Unblock' : 'Block'}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal(homeowner)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} homeowners
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      {/* Detail Modal */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{detailModal.name}</h3>
              <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{detailModal.email}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{detailModal.phone || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Status</p>
                  <p className={`font-medium ${detailModal.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                    {detailModal.isBlocked ? 'Blocked' : 'Active'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Verified</p>
                  <p className={`font-medium ${detailModal.isVerified ? 'text-green-600' : 'text-gray-600'}`}>
                    {detailModal.isVerified ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              
              {detailModal.addressBook && detailModal.addressBook.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Addresses</p>
                  <div className="space-y-2">
                    {detailModal.addressBook.map((addr, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl text-sm">
                        <p className="font-medium">{addr.label}</p>
                        <p className="text-gray-600">{addr.fullAddress || addr.street}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailModal.blockedReason && (
                <div className="p-3 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600">Blocked Reason</p>
                  <p className="font-medium text-red-700">{detailModal.blockedReason}</p>
                </div>
              )}
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
                  {blockModal.isBlocked ? 'Unblock Homeowner' : 'Block Homeowner'}
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
                onClick={() => handleBlockHomeowner(blockModal)}
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl transition font-medium ${
                  blockModal.isBlocked 
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
                <h3 className="text-lg font-semibold text-gray-900">Delete Homeowner</h3>
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
                onClick={() => handleDeleteHomeowner(deleteModal)}
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
