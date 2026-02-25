'use client'
import { useState, useEffect } from 'react';
import { Users, Briefcase, ClipboardList, TrendingUp, Activity, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
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
    </>
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
