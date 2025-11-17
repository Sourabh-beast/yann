'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, Search, Mail, Phone, MapPin, LogOut } from 'lucide-react';

export default function HomeownersPage() {
  const router = useRouter();
  const [homeowners, setHomeowners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Homeowners</h2>
          <p className="text-gray-600">View and manage all registered homeowners on the platform.</p>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {homeowners.map((homeowner) => (
              <div key={homeowner._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {homeowner.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{homeowner.name}</h3>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(homeowner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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

                {homeowner.preferences && homeowner.preferences.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Preferences:</p>
                    <div className="flex flex-wrap gap-1">
                      {homeowner.preferences.slice(0, 3).map((pref, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          {pref}
                        </span>
                      ))}
                      {homeowner.preferences.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{homeowner.preferences.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {homeowner.lastLoginAt && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Last login: {new Date(homeowner.lastLoginAt).toLocaleString()}
                    </p>
                  </div>
                )}
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
      </main>
    </div>
  );
}
