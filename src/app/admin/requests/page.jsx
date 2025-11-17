'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, Search, Filter, CheckCircle, XCircle, Clock, AlertCircle, LogOut } from 'lucide-react';

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [searchTerm, statusFilter, priorityFilter, page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);

      const res = await fetch(`/api/admin/requests?${params}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Requests</h2>
          <p className="text-gray-600">Monitor and manage all service requests on the platform.</p>
        </header>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
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
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priority</option>
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
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
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Title</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Service Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Location</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Priority</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Created</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.title}</p>
                          {request.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-1">{request.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{request.serviceType}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.homeowner?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{request.homeowner?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{request.locationLabel || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${request.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                          {request.priority === 'urgent' && <AlertCircle className="w-3 h-3" />}
                          {request.priority}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={request.status}
                          onChange={(e) => updateRequestStatus(request._id, e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
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
                  Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} requests
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
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function getStatusClass(status) {
  const classes = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    scheduled: 'bg-purple-100 text-purple-700',
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
}
