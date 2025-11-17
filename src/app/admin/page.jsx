'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Briefcase, ClipboardList, TrendingUp, Activity, CheckCircle, Clock, XCircle, Menu, X, LogOut, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    handleLogout();
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

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => setShowLogoutConfirm(true)}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Welcome back! Here's what's happening with your platform today.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Providers"
                value={stats?.overview?.totalProviders || 0}
                subtitle={`${stats?.overview?.activeProviders || 0} active`}
                icon={Briefcase}
                gradient="from-blue-500 to-blue-600"
              />
              <StatCard
                title="Total Homeowners"
                value={stats?.overview?.totalHomeowners || 0}
                subtitle="Registered users"
                icon={Users}
                gradient="from-purple-500 to-purple-600"
              />
              <StatCard
                title="Total Requests"
                value={stats?.overview?.totalRequests || 0}
                subtitle={`${stats?.overview?.pendingRequests || 0} pending`}
                icon={ClipboardList}
                gradient="from-green-500 to-green-600"
              />
              <StatCard
                title="Completed"
                value={stats?.overview?.completedRequests || 0}
                subtitle="Successfully done"
                icon={CheckCircle}
                gradient="from-orange-500 to-orange-600"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Service Distribution */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Top Services</h3>
                <div className="space-y-3">
                  {stats?.charts?.serviceDistribution?.slice(0, 5).map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{service._id}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${(service.count / stats?.overview?.totalProviders) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8 text-right">{service.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Request Status */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Request Status</h3>
                <div className="space-y-4">
                  {stats?.charts?.requestStatusDistribution?.map((status, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status._id)}
                        <span className="font-medium text-gray-700 capitalize">{status._id}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Service Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recentActivity?.requests?.map((request) => (
                      <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{request.title}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{request.serviceType}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{request.homeowner?.name || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${request.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                            {request.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Logout Confirmation</h3>
                <p className="mt-1 text-sm text-gray-600">Are you sure you want to logout from admin panel?</p>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="rounded-full bg-red-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

function getStatusIcon(status) {
  const icons = {
    pending: <Clock className="w-5 h-5 text-yellow-500" />,
    completed: <CheckCircle className="w-5 h-5 text-green-500" />,
    cancelled: <XCircle className="w-5 h-5 text-red-500" />,
    ongoing: <Activity className="w-5 h-5 text-blue-500" />,
    scheduled: <Clock className="w-5 h-5 text-purple-500" />
  };
  return icons[status] || <Clock className="w-5 h-5 text-gray-500" />;
}

function getStatusBadgeClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    ongoing: 'bg-blue-100 text-blue-700',
    scheduled: 'bg-purple-100 text-purple-700',
    draft: 'bg-gray-100 text-gray-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
}
