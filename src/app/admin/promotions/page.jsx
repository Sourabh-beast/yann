'use client'
import { useState, useEffect } from 'react';
import { 
  Menu, X, LogOut, Settings, Activity, Package, Briefcase, Users, 
  ClipboardList, Star, DollarSign, Bell, BarChart3, Gift, HeadphonesIcon, 
  FileText, Plus, Edit, Trash2, Copy, Check, Search, Filter,
  Tag, Percent, Calendar, Hash, ToggleLeft, ToggleRight, RefreshCw
} from 'lucide-react';

export default function PromotionsPage() {
  const [loading, setLoading] = useState(true);
  
  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, totalUsage: 0, totalDiscount: 0 });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrderValue: 0,
    maximumDiscount: null,
    startDate: '',
    endDate: '',
    usageLimit: null,
    perUserLimit: 1,
    couponType: 'promo',
    applicableTo: { allServices: true, services: [], categories: [] },
    isActive: true
  });
  
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, [page, statusFilter, typeFilter]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('couponType', typeFilter);
      if (search) params.append('search', search);
      
      const res = await fetch(`/api/admin/coupons?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setCoupons(data.data.coupons);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCoupons();
  };

  const resetForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      minimumOrderValue: 0,
      maximumDiscount: null,
      startDate: '',
      endDate: '',
      usageLimit: null,
      perUserLimit: 1,
      couponType: 'promo',
      applicableTo: { allServices: true, services: [], categories: [] },
      isActive: true
    });
    setEditingCoupon(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minimumOrderValue: coupon.minimumOrderValue || 0,
      maximumDiscount: coupon.maximumDiscount,
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit || 1,
      couponType: coupon.couponType || 'promo',
      applicableTo: coupon.applicableTo || { allServices: true },
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!couponForm.code || !couponForm.discountValue) {
      alert('Please fill in required fields');
      return;
    }
    
    try {
      const method = editingCoupon ? 'PUT' : 'POST';
      const body = editingCoupon ? { id: editingCoupon._id, ...couponForm } : couponForm;
      
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowModal(false);
        resetForm();
        fetchCoupons();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        fetchCoupons();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive })
      });
      
      const data = await res.json();
      if (data.success) {
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'YANN';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm({ ...couponForm, code });
  };

  const getCouponTypeBadge = (type) => {
    const colors = {
      promo: 'bg-blue-100 text-blue-700',
      referral: 'bg-green-100 text-green-700',
      loyalty: 'bg-purple-100 text-purple-700',
      seasonal: 'bg-orange-100 text-orange-700',
      special: 'bg-pink-100 text-pink-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    if (!coupon.isActive) return { text: 'Inactive', class: 'bg-gray-100 text-gray-700' };
    if (coupon.endDate && new Date(coupon.endDate) < now) return { text: 'Expired', class: 'bg-red-100 text-red-700' };
    if (coupon.startDate && new Date(coupon.startDate) > now) return { text: 'Scheduled', class: 'bg-yellow-100 text-yellow-700' };
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return { text: 'Exhausted', class: 'bg-orange-100 text-orange-700' };
    return { text: 'Active', class: 'bg-green-100 text-green-700' };
  };

  return (
    <>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Promotions & Coupons</h1>
              <p className="text-gray-600 mt-2">Manage discount codes and promotional offers</p>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Coupon
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Coupons</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
                  <p className="text-sm text-gray-500">Active</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.expired}</p>
                  <p className="text-sm text-gray-500">Expired</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Hash className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalUsage}</p>
                  <p className="text-sm text-gray-500">Total Uses</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">₹{stats.totalDiscount}</p>
                  <p className="text-sm text-gray-500">Total Discount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="promo">Promo</option>
                <option value="referral">Referral</option>
                <option value="loyalty">Loyalty</option>
                <option value="seasonal">Seasonal</option>
                <option value="special">Special</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Search
              </button>
            </form>
          </div>

          {/* Coupons Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Code</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Discount</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Usage</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Validity</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((coupon) => {
                      const status = getStatusBadge(coupon);
                      return (
                        <tr key={coupon._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-800">{coupon.code}</span>
                              <button
                                onClick={() => copyCode(coupon.code)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Copy code"
                              >
                                {copiedCode === coupon.code ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                            {coupon.description && (
                              <p className="text-sm text-gray-500 mt-1">{coupon.description}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-800">
                              {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                            </span>
                            {coupon.maximumDiscount && coupon.discountType === 'percentage' && (
                              <p className="text-sm text-gray-500">Max: ₹{coupon.maximumDiscount}</p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCouponTypeBadge(coupon.couponType)}`}>
                              {coupon.couponType?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-medium text-gray-800">
                              {coupon.usageCount || 0}
                              {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {coupon.startDate && (
                              <p>From: {new Date(coupon.startDate).toLocaleDateString()}</p>
                            )}
                            {coupon.endDate && (
                              <p>To: {new Date(coupon.endDate).toLocaleDateString()}</p>
                            )}
                            {!coupon.startDate && !coupon.endDate && 'No expiry'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.class}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                                className={`p-2 rounded-lg ${coupon.isActive ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={coupon.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {coupon.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                              <button
                                onClick={() => openEditModal(coupon)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(coupon._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {coupons.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No coupons found</div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-4 py-2 rounded-xl ${p === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Code *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 uppercase"
                      placeholder="YANN10OFF"
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Type</label>
                  <select
                    value={couponForm.couponType}
                    onChange={(e) => setCouponForm({...couponForm, couponType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="promo">Promotional</option>
                    <option value="referral">Referral</option>
                    <option value="loyalty">Loyalty</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="special">Special</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="Get 10% off on all services"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount Value *</label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({...couponForm, discountValue: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.maximumDiscount || ''}
                    onChange={(e) => setCouponForm({...couponForm, maximumDiscount: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="No limit"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minimumOrderValue}
                    onChange={(e) => setCouponForm({...couponForm, minimumOrderValue: parseFloat(e.target.value)})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit (Total)</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit || ''}
                    onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                    placeholder="Unlimited"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={couponForm.startDate}
                    onChange={(e) => setCouponForm({...couponForm, startDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={couponForm.endDate}
                    onChange={(e) => setCouponForm({...couponForm, endDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({...couponForm, isActive: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90"
              >
                {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
</>
  );
}
