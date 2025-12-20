'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, Users, Briefcase, ClipboardList, Menu, X, LogOut, 
  Star, DollarSign, Package, Settings, Search, Bell, BarChart3,
  Send, Mail, MessageSquare, Megaphone, Clock, CheckCircle,
  XCircle, Trash2, Eye, Plus, Calendar, Filter, AlertCircle, Gift, HeadphonesIcon, FileText
} from 'lucide-react';

export default function NotificationsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'push',
    targetAudience: 'all',
    title: '',
    message: '',
    category: 'announcement',
    priority: 'normal',
    scheduledFor: '',
    sendNow: true
  });

  useEffect(() => {
    fetchNotifications();
  }, [page, typeFilter, statusFilter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);

      const res = await fetch(`/api/admin/notifications?${params}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.message) {
      alert('Please fill in title and message');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        fetchNotifications();
        setShowCreateModal(false);
        setFormData({
          type: 'push',
          targetAudience: 'all',
          title: '',
          message: '',
          category: 'announcement',
          priority: 'normal',
          scheduledFor: '',
          sendNow: true
        });
        alert(formData.sendNow ? '✅ Notification sent successfully!' : '✅ Notification created!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to create notification');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchNotifications();
        alert(`✅ Notification ${action}ed!`);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchNotifications();
        alert('✅ Notification deleted!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Delete failed');
    }
  };

  const sidebarItems = [
    { label: 'Dashboard', href: '/admin', icon: Activity },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Services', href: '/admin/services', icon: Package },
    { label: 'Service Providers', href: '/admin/providers', icon: Briefcase },
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'push': return <Bell className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <MessageSquare className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Sent</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>;
      case 'draft':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Draft</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Urgent</span>;
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700">High</span>;
      case 'normal':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Normal</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Low</span>;
      default:
        return null;
    }
  };

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
              const isActive = item.href === '/admin/notifications';
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
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
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Notifications & Communications</h2>
            <p className="text-gray-600">Send push notifications, emails, SMS and announcements</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            <Plus className="w-5 h-5" /> Create Notification
          </button>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Total Delivered</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalDelivered}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="push">Push Notification</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="announcement">Announcement</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="failed">Failed</option>
            </select>
            <button
              onClick={fetchNotifications}
              className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <Filter className="w-4 h-4" /> Apply Filters
            </button>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-500 mb-4">Create your first notification to get started.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition"
            >
              Create Notification
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div key={notification._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'push' ? 'bg-blue-100 text-blue-600' :
                        notification.type === 'email' ? 'bg-green-100 text-green-600' :
                        notification.type === 'sms' ? 'bg-purple-100 text-purple-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {getTypeIcon(notification.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500 capitalize">{notification.type} • {notification.targetAudience}</p>
                      </div>
                      {getStatusBadge(notification.status)}
                      {getPriorityBadge(notification.priority)}
                    </div>

                    {/* Message */}
                    <p className="text-gray-600 mb-3">{notification.message}</p>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📤 {notification.stats?.sent || 0} sent</span>
                      <span>✅ {notification.stats?.delivered || 0} delivered</span>
                      <span>👁️ {notification.stats?.opened || 0} opened</span>
                      <span>👆 {notification.stats?.clicked || 0} clicked</span>
                    </div>

                    {/* Schedule Info */}
                    {notification.isScheduled && notification.scheduledFor && (
                      <p className="mt-2 text-sm text-blue-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Scheduled for: {new Date(notification.scheduledFor).toLocaleString()}
                      </p>
                    )}

                    {/* Sent date */}
                    {notification.sentAt && (
                      <p className="mt-2 text-sm text-gray-500">
                        Sent: {new Date(notification.sentAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {notification.status === 'draft' && (
                      <button
                        onClick={() => handleAction(notification._id, 'send')}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      >
                        <Send className="w-4 h-4" /> Send Now
                      </button>
                    )}
                    {notification.status === 'scheduled' && (
                      <button
                        onClick={() => handleAction(notification._id, 'cancel')}
                        className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Notification</h3>
            
            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { value: 'push', label: 'Push', icon: Bell },
                    { value: 'email', label: 'Email', icon: Mail },
                    { value: 'sms', label: 'SMS', icon: MessageSquare },
                    { value: 'announcement', label: 'Announcement', icon: Megaphone },
                  ].map(type => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setFormData({ ...formData, type: type.value })}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition ${
                          formData.type === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="providers">Service Providers Only</option>
                  <option value="homeowners">Homeowners Only</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notification title..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter notification message..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="promotional">Promotional</option>
                    <option value="transactional">Transactional</option>
                    <option value="reminder">Reminder</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Send Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Options</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.sendNow}
                      onChange={() => setFormData({ ...formData, sendNow: true, scheduledFor: '' })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Send Immediately</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.sendNow}
                      onChange={() => setFormData({ ...formData, sendNow: false })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Schedule for Later</span>
                  </label>
                </div>
              </div>

              {/* Schedule Date */}
              {!formData.sendNow && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={createLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : formData.sendNow ? (
                  <>
                    <Send className="w-5 h-5" /> Send Now
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" /> Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
