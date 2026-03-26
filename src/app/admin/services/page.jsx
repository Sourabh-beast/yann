'use client'
import { useState, useEffect } from 'react';
import { 
  Users, Briefcase, ClipboardList, Activity, Menu, X, Search, 
  Plus, Edit2, Trash2, CheckCircle, XCircle, LogOut, Settings,
  DollarSign, Package, ToggleLeft, ToggleRight, Save, ChevronDown,
  BarChart3, Star, Bell, Gift, HeadphonesIcon, FileText
} from 'lucide-react';

export default function ServicesManagementPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const EXPERIENCE_RANGES = [
    { label: '0-5', minYears: 0, maxYears: 5 },
    { label: '5-10', minYears: 5, maxYears: 10 },
    { label: '10-15', minYears: 10, maxYears: 15 },
    { label: '15-20', minYears: 15, maxYears: 20 },
    { label: '20-25', minYears: 20, maxYears: 25 },
    { label: '25-30', minYears: 25, maxYears: 30 },
    { label: '30+', minYears: 30, maxYears: null },
  ];

  const buildExperienceLimits = (existing = []) => {
    return EXPERIENCE_RANGES.map(range => {
      const match = existing.find(limit => {
        const minMatches = Number(limit.minYears) === range.minYears;
        const maxIsNull = limit.maxYears === null || limit.maxYears === undefined;
        const maxMatches = maxIsNull ? range.maxYears === null : Number(limit.maxYears) === range.maxYears;
        return minMatches && maxMatches;
      });
      return {
        minYears: range.minYears,
        maxYears: range.maxYears,
        maxPrice: String(match ? Number(match.maxPrice) || 0 : 0),
        label: range.label,
      };
    });
  };

  const sanitizeNumericInput = (value) => {
    const digitsOnly = String(value ?? '').replace(/\D/g, '');
    if (!digitsOnly) return '';
    return digitsOnly.replace(/^0+(?=\d)/, '');
  };

  const blockInvalidNumericKeys = (e) => {
    if (['-', '+', 'e', 'E', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    basePrice: 0,
    minPrice: 0,
    maxPrice: 0,
    experiencePriceLimits: [],
    features: '',
    icon: '🏠',
    popular: false,
    isActive: true,
    estimatedDuration: 60,
    tags: ''
  });

  const pushNotice = (type, message) => {
    setNotice({ type, message });
  };

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    fetchServices();
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/services?${params}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      const data = await res.json();
      if (data.success) {
        setServices(data.data.services);
        setCategories(data.data.categories);
      } else {
        pushNotice('error', data.message || 'Unable to load services');
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      pushNotice('error', 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      price: '',
      basePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      experiencePriceLimits: buildExperienceLimits(),
      features: '',
      icon: '🏠',
      popular: false,
      isActive: true,
      estimatedDuration: 60,
      tags: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      category: service.category,
      price: service.price,
      basePrice: service.basePrice || 0,
      minPrice: service.minPrice || 0,
      maxPrice: service.maxPrice || 0,
      experiencePriceLimits: buildExperienceLimits(service.experiencePriceLimits || []),
      features: service.features?.join('\n') || '',
      icon: service.icon || '🏠',
      popular: service.popular || false,
      isActive: service.isActive !== false,
      estimatedDuration: service.estimatedDuration || 60,
      tags: service.tags?.join(', ') || ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        features: formData.features.split('\n').map(f => f.trim()).filter(Boolean),
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        experiencePriceLimits: (formData.experiencePriceLimits || []).map(limit => ({
          minYears: Number(limit.minYears) || 0,
          maxYears: limit.maxYears === null || limit.maxYears === undefined ? null : Number(limit.maxYears),
          maxPrice: Number(sanitizeNumericInput(limit.maxPrice)) || 0
        }))
      };

      if (editingService) {
        payload.id = editingService._id;
      }

      const res = await fetch('/api/admin/services', {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        const savedService = data.data;

        if (editingService && savedService?._id) {
          setServices(prev => prev.map(service => service._id === savedService._id ? savedService : service));
        } else if (savedService?._id) {
          setServices(prev => [savedService, ...prev]);
        }

        if (savedService?.category) {
          setCategories(prev => {
            if (prev.includes(savedService.category)) return prev;
            return [...prev, savedService.category].sort();
          });
        }

        setModalOpen(false);
        setEditingService(null);
        pushNotice('success', editingService ? 'Service updated successfully' : 'Service created successfully');
        fetchServices();
      } else {
        pushNotice('error', data.message || 'Failed to save service');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      pushNotice('error', 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/services?id=${id}`, {
        method: 'DELETE',
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.success) {
        setDeleteConfirm(null);
        setServices(prev => prev.filter(service => service._id !== id));
        fetchServices();
        pushNotice('success', 'Service deleted successfully');
      } else {
        pushNotice('error', data.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      pushNotice('error', 'Failed to delete service');
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ id: service._id, isActive: !service.isActive })
      });
      const data = await res.json();
      if (data.success) {
        if (data.data?._id) {
          setServices(prev => prev.map(item => item._id === data.data._id ? data.data : item));
        }
        fetchServices();
        pushNotice('success', `Service ${data.data?.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      pushNotice('error', 'Failed to update service status');
    }
  };

  return (
    <>
        {notice && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4">
            <div className={`w-max max-w-[calc(100vw-2rem)] rounded-2xl px-4 py-3 shadow-xl border backdrop-blur-sm ${
              notice.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800'
                : 'bg-red-50/95 border-red-200 text-red-800'
            }`}>
              <p className="text-sm font-semibold">{notice.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Services Management</h2>
            <p className="text-gray-600">Add, edit, and manage all services on the platform.</p>
            <p className="text-xs text-gray-500 mt-1">Edits are saved directly to database and reflected instantly.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Service
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No services found</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add Your First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div 
                key={service._id} 
                className={`bg-white rounded-2xl p-6 shadow-lg border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  service.isActive ? 'border-gray-100' : 'border-red-200 bg-red-50/30'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{service.icon}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{service.title}</h3>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  {service.popular && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-semibold text-gray-900">{service.price}</span>
                  </div>
                  {service.basePrice > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Base Price:</span>
                      <span className="font-semibold text-green-600">₹{service.basePrice}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="text-gray-700">{service.estimatedDuration} mins</span>
                  </div>
                </div>

                {service.features?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.features.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {f}
                        </span>
                      ))}
                      {service.features.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{service.features.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      service.isActive 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {service.isActive ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(service)}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Home Cleaning"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. cleaning"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the service..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Price</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Starting from ₹499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="🏠"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.basePrice}
                    onKeyDown={blockInvalidNumericKeys}
                    onChange={(e) => {
                      const value = sanitizeNumericInput(e.target.value);
                      setFormData({ ...formData, basePrice: value === '' ? '' : value });
                    }}
                    onBlur={() => {
                      const safeValue = Number(sanitizeNumericInput(formData.basePrice)) || 0;
                      setFormData({ ...formData, basePrice: safeValue });
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price by Experience (₹)</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-2 bg-gray-50 text-xs font-semibold text-gray-600">
                      <div className="px-4 py-2">Experience Range (yrs)</div>
                      <div className="px-4 py-2">Max Price (₹)</div>
                    </div>
                    {(formData.experiencePriceLimits || []).map((limit, idx) => (
                      <div key={`${limit.minYears}-${limit.maxYears}-${idx}`} className="grid grid-cols-2 border-t border-gray-200">
                        <div className="px-4 py-2 text-sm text-gray-700">
                          {limit.label || `${limit.minYears}-${limit.maxYears ?? '+'}`}
                        </div>
                        <div className="px-4 py-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={sanitizeNumericInput(limit.maxPrice)}
                            onKeyDown={blockInvalidNumericKeys}
                            onChange={(e) => {
                              const value = sanitizeNumericInput(e.target.value);
                              const updated = [...(formData.experiencePriceLimits || [])];
                              updated[idx] = { ...updated[idx], maxPrice: value };
                              setFormData({ ...formData, experiencePriceLimits: updated });
                            }}
                            onBlur={() => {
                              const updated = [...(formData.experiencePriceLimits || [])];
                              const current = sanitizeNumericInput(updated[idx]?.maxPrice);
                              updated[idx] = { ...updated[idx], maxPrice: current === '' ? '0' : current };
                              setFormData({ ...formData, experiencePriceLimits: updated });
                            }}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Providers cannot set prices above these limits for their experience range.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.estimatedDuration}
                  onKeyDown={blockInvalidNumericKeys}
                  onChange={(e) => {
                    const value = sanitizeNumericInput(e.target.value);
                    setFormData({ ...formData, estimatedDuration: value === '' ? '' : value });
                  }}
                  onBlur={() => {
                    const safeValue = Number(sanitizeNumericInput(formData.estimatedDuration)) || 60;
                    setFormData({ ...formData, estimatedDuration: safeValue });
                  }}
                  onWheel={(e) => e.currentTarget.blur()}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Professional cleaning&#10;All equipment included&#10;Eco-friendly products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cleaning, home, professional"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.popular}
                    onChange={(e) => setFormData({...formData, popular: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.title || !formData.description || !formData.category}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Service</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete "{deleteConfirm.title}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
