'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Activity, Users, Briefcase, ClipboardList, Menu, X, LogOut, 
  TrendingUp, TrendingDown, DollarSign, Package, Settings,
  BarChart3, PieChart, LineChart, Download, Calendar, Filter,
  Star, Bell, ArrowUp, ArrowDown, Minus, Gift, HeadphonesIcon, FileText
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('30days');
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [activeTab, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?type=${activeTab}&period=${period}`);
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'csv') => {
    try {
      // Create CSV from current data
      let csvContent = '';
      
      if (activeTab === 'overview' && data) {
        csvContent = 'Metric,Value\n';
        csvContent += `Total Bookings,${data.bookings?.total || 0}\n`;
        csvContent += `Completed Bookings,${data.bookings?.completed || 0}\n`;
        csvContent += `Completion Rate,${data.bookings?.completionRate || 0}%\n`;
        csvContent += `Total Revenue,₹${data.revenue?.total || 0}\n`;
        csvContent += `Total Providers,${data.users?.totalProviders || 0}\n`;
        csvContent += `Total Homeowners,${data.users?.totalHomeowners || 0}\n`;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${activeTab}_${period}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'users', label: 'User Growth', icon: Users },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'providers', label: 'Provider Performance', icon: Briefcase },
    { id: 'comparison', label: 'Comparisons', icon: BarChart3 },
  ];

  const periods = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '1year', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
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
              const isActive = item.href === '/admin/analytics';
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
            <p className="text-gray-600">Comprehensive insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {periods.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <button
              onClick={() => exportReport()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-x-auto">
          <div className="flex p-2 min-w-max">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && data && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Bookings"
                    value={data.bookings?.total || 0}
                    subtitle={`${data.bookings?.completionRate || 0}% completion rate`}
                    icon={ClipboardList}
                    gradient="from-blue-500 to-blue-600"
                  />
                  <StatCard
                    title="Total Revenue"
                    value={`₹${(data.revenue?.total || 0).toLocaleString()}`}
                    subtitle={`₹${(data.revenue?.commission || 0).toLocaleString()} commission`}
                    icon={DollarSign}
                    gradient="from-green-500 to-green-600"
                  />
                  <StatCard
                    title="Total Users"
                    value={(data.users?.totalProviders || 0) + (data.users?.totalHomeowners || 0)}
                    subtitle={`${data.users?.totalProviders || 0} providers, ${data.users?.totalHomeowners || 0} homeowners`}
                    icon={Users}
                    gradient="from-purple-500 to-purple-600"
                  />
                  <StatCard
                    title="Avg Rating"
                    value={data.ratings?.average || 'N/A'}
                    subtitle={`${data.ratings?.total || 0} total reviews`}
                    icon={Star}
                    gradient="from-orange-500 to-orange-600"
                  />
                </div>

                {/* Booking Status Breakdown */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Status Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-3xl font-bold text-green-600">{data.bookings?.completed || 0}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                      <p className="text-3xl font-bold text-yellow-600">{data.bookings?.pending || 0}</p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl">
                      <p className="text-3xl font-bold text-red-600">{data.bookings?.cancelled || 0}</p>
                      <p className="text-sm text-gray-600">Cancelled</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-3xl font-bold text-blue-600">{data.bookings?.completionRate || 0}%</p>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && data && (
              <div className="space-y-6">
                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h3>
                  {data.trend && data.trend.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Revenue</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Commission</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Transactions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.trend.slice(0, 15).map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{item.date}</td>
                              <td className="py-3 px-4 text-right text-green-600 font-semibold">₹{item.revenue?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right text-blue-600">₹{item.commission?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">{item.transactions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No revenue data available for this period</p>
                  )}
                </div>

                {/* Revenue by Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Category</h3>
                    {data.byCategory && data.byCategory.length > 0 ? (
                      <div className="space-y-3">
                        {data.byCategory.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium">{item.category}</span>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">₹{item.revenue?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{item.bookings} bookings</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No data available</p>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Payment Method</h3>
                    {data.byPaymentMethod && data.byPaymentMethod.length > 0 ? (
                      <div className="space-y-3">
                        {data.byPaymentMethod.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <span className="font-medium capitalize">{item.method}</span>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">₹{item.revenue?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{item.count} transactions</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* User Growth Tab */}
            {activeTab === 'users' && data && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">New Providers</h3>
                    <p className="text-4xl font-bold mt-2">{data.summary?.newProviders || 0}</p>
                    <p className="text-sm opacity-75 mt-1">in selected period</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">New Homeowners</h3>
                    <p className="text-4xl font-bold mt-2">{data.summary?.newHomeowners || 0}</p>
                    <p className="text-sm opacity-75 mt-1">in selected period</p>
                  </div>
                </div>

                {/* Growth Trend Table */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">User Growth Trend</h3>
                  {data.trend && data.trend.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">New Providers</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">New Homeowners</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Total Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.trend.slice(-15).map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{item.date}</td>
                              <td className="py-3 px-4 text-right text-blue-600">{item.providers}</td>
                              <td className="py-3 px-4 text-right text-purple-600">{item.homeowners}</td>
                              <td className="py-3 px-4 text-right font-semibold">{item.cumulativeTotal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No growth data available for this period</p>
                  )}
                </div>
              </div>
            )}

            {/* Services Popularity Tab */}
            {activeTab === 'services' && data && (
              <div className="space-y-6">
                {/* Top Service */}
                {data.topService && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <h3 className="text-lg font-medium opacity-90">Most Popular Service</h3>
                    <p className="text-3xl font-bold mt-2">{data.topService.service}</p>
                    <p className="text-sm opacity-75 mt-1">
                      {data.topService.bookings} bookings • ₹{data.topService.revenue?.toLocaleString()} revenue
                    </p>
                  </div>
                )}

                {/* Services Table */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Service Performance</h3>
                  {data.services && data.services.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Service</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Bookings</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Completed</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Success Rate</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Revenue</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Avg Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.services.map((service, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{service.service}</td>
                              <td className="py-3 px-4 text-right">{service.bookings}</td>
                              <td className="py-3 px-4 text-right text-green-600">{service.completed}</td>
                              <td className="py-3 px-4 text-right">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  parseFloat(service.completionRate) >= 80 ? 'bg-green-100 text-green-700' :
                                  parseFloat(service.completionRate) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {service.completionRate}%
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-semibold">₹{service.revenue?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">
                                <span className="flex items-center justify-end gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  {service.avgRating}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No service data available</p>
                  )}
                </div>
              </div>
            )}

            {/* Provider Performance Tab */}
            {activeTab === 'providers' && data && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Top Performing Providers</h3>
                  {data.topProviders && data.topProviders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Rank</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Provider</th>
                            <th className="text-left py-3 px-4 text-gray-600 font-medium">Service</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Completed</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Revenue</th>
                            <th className="text-right py-3 px-4 text-gray-600 font-medium">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topProviders.map((provider, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <span className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-300'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium">{provider.name}</p>
                                <p className="text-xs text-gray-500">{provider.phone}</p>
                              </td>
                              <td className="py-3 px-4">{provider.service}</td>
                              <td className="py-3 px-4 text-right font-semibold">{provider.completedBookings}</td>
                              <td className="py-3 px-4 text-right text-green-600 font-semibold">₹{provider.totalRevenue?.toLocaleString()}</td>
                              <td className="py-3 px-4 text-right">
                                <span className="flex items-center justify-end gap-1">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  {provider.avgRating}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No provider performance data available</p>
                  )}
                </div>
              </div>
            )}

            {/* Comparison Tab */}
            {activeTab === 'comparison' && data && (
              <div className="space-y-6">
                {/* Monthly Comparison */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Month-over-Month Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ComparisonCard
                      title="Bookings"
                      current={data.monthly?.bookings?.current || 0}
                      previous={data.monthly?.bookings?.previous || 0}
                      change={data.monthly?.bookings?.change || 0}
                    />
                    <ComparisonCard
                      title="Revenue"
                      current={`₹${(data.monthly?.revenue?.current || 0).toLocaleString()}`}
                      previous={`₹${(data.monthly?.revenue?.previous || 0).toLocaleString()}`}
                      change={data.monthly?.revenue?.change || 0}
                      isCurrency
                    />
                    <ComparisonCard
                      title="New Users"
                      current={data.monthly?.newUsers?.current || 0}
                      previous={data.monthly?.newUsers?.previous || 0}
                      change={data.monthly?.newUsers?.change || 0}
                    />
                  </div>
                </div>

                {/* Yearly Comparison */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Year-over-Year Comparison</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ComparisonCard
                      title="Total Bookings"
                      current={data.yearly?.bookings?.current || 0}
                      previous={data.yearly?.bookings?.previous || 0}
                      change={data.yearly?.bookings?.change || 0}
                      label="This Year vs Last Year"
                    />
                    <ComparisonCard
                      title="Total Revenue"
                      current={`₹${(data.yearly?.revenue?.current || 0).toLocaleString()}`}
                      previous={`₹${(data.yearly?.revenue?.previous || 0).toLocaleString()}`}
                      change={data.yearly?.revenue?.change || 0}
                      label="This Year vs Last Year"
                      isCurrency
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, gradient }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({ title, current, previous, change, label, isCurrency }) {
  const changeNum = parseFloat(change);
  const isPositive = changeNum > 0;
  const isNeutral = changeNum === 0;
  
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{current}</p>
          <p className="text-xs text-gray-500">vs {previous} {label || 'last period'}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
          isNeutral ? 'bg-gray-100 text-gray-600' :
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(changeNum)}%
        </div>
      </div>
    </div>
  );
}
