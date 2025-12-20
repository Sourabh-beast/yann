'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, LogOut, Settings, Activity, Package, Briefcase, Users, 
  ClipboardList, Star, DollarSign, Bell, BarChart3, Gift, HeadphonesIcon, 
  FileText, Search, Filter, AlertCircle, Clock, CheckCircle, XCircle,
  MessageSquare, Send, User, ArrowUp, ChevronDown, ChevronUp, RefreshCw,
  AlertTriangle, Eye, UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Tickets state
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0, urgent: 0, high: 0, escalated: 0 });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  
  // Selected ticket for detail view
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

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

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, priorityFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (search) params.append('search', search);
      
      const res = await fetch(`/api/admin/tickets?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTickets(data.data.tickets);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_message',
          ticketId: selectedTicket._id,
          message: newMessage,
          sender: 'admin',
          senderName: 'Admin',
          isInternal
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.data);
        setNewMessage('');
        setIsInternal(false);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleTicketAction = async (action, extraData = {}) => {
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTicket._id,
          action,
          adminName: 'Admin',
          ...extraData
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.data);
        fetchTickets();
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      in_progress: { class: 'bg-yellow-100 text-yellow-700', icon: Clock },
      waiting_customer: { class: 'bg-orange-100 text-orange-700', icon: Clock },
      resolved: { class: 'bg-green-100 text-green-700', icon: CheckCircle },
      closed: { class: 'bg-gray-100 text-gray-700', icon: XCircle }
    };
    return badges[status] || badges.open;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return badges[priority] || badges.medium;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      booking: 'Booking Issue',
      payment: 'Payment',
      service: 'Service Quality',
      provider: 'Provider Issue',
      refund: 'Refund Request',
      account: 'Account',
      technical: 'Technical',
      other: 'Other'
    };
    return labels[category] || category;
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
              const isActive = item.href === '/admin/support';
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
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
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Support Tickets</h1>
            <p className="text-gray-600 mt-2">Manage customer complaints and support requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.open}</p>
                  <p className="text-sm text-gray-500">Open</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.urgent + stats.high}</p>
                  <p className="text-sm text-gray-500">High Priority</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.resolved}</p>
                  <p className="text-sm text-gray-500">Resolved</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2">
              {/* Filters */}
              <div className="bg-white rounded-2xl p-4 shadow-lg mb-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
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
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_customer">Waiting Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select
                    value={priorityFilter}
                    onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Priority</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </form>
              </div>

              {/* Tickets Table */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {loading ? (
                  <div className="p-8 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {tickets.map((ticket) => {
                      const statusBadge = getStatusBadge(ticket.status);
                      const StatusIcon = statusBadge.icon;
                      return (
                        <div
                          key={ticket._id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${selectedTicket?._id === ticket._id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm text-gray-500">{ticket.ticketId}</span>
                                {ticket.isEscalated && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                                    <ArrowUp className="w-3 h-3" />
                                    Escalated
                                  </span>
                                )}
                              </div>
                              <h3 className="font-medium text-gray-800 truncate">{ticket.subject}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {ticket.requester?.name || 'Guest'} • {getCategoryLabel(ticket.category)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.class}`}>
                                <StatusIcon className="w-3 h-3" />
                                {ticket.status.replace('_', ' ')}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(ticket.createdAt).toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                    {tickets.length === 0 && (
                      <div className="p-8 text-center text-gray-500">No tickets found</div>
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

            {/* Ticket Detail Panel */}
            <div className="lg:col-span-1">
              {selectedTicket ? (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-4">
                  {/* Ticket Header */}
                  <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm opacity-80">{selectedTicket.ticketId}</span>
                      <button
                        onClick={() => setSelectedTicket(null)}
                        className="p-1 hover:bg-white/20 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold mt-2">{selectedTicket.subject}</h3>
                  </div>

                  {/* Ticket Info */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTicket.status).class}`}>
                          {selectedTicket.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Priority</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(selectedTicket.priority)}`}>
                          {selectedTicket.priority}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-500">Category</p>
                        <p className="font-medium text-gray-800">{getCategoryLabel(selectedTicket.category)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Customer</p>
                        <p className="font-medium text-gray-800">{selectedTicket.requester?.name || 'Guest'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedTicket.status === 'open' && (
                        <button
                          onClick={() => handleTicketAction('assign')}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <UserCheck className="w-4 h-4" />
                          Assign to Me
                        </button>
                      )}
                      {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                        <button
                          onClick={() => handleTicketAction('resolve', { resolutionNote: 'Issue resolved' })}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Resolve
                        </button>
                      )}
                      {!selectedTicket.isEscalated && selectedTicket.status !== 'closed' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Enter escalation reason:');
                            if (reason) handleTicketAction('escalate', { escalationReason: reason });
                          }}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center gap-1"
                        >
                          <ArrowUp className="w-4 h-4" />
                          Escalate
                        </button>
                      )}
                      {selectedTicket.status === 'resolved' && (
                        <button
                          onClick={() => handleTicketAction('close')}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                        >
                          Close Ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-4 max-h-64 overflow-y-auto space-y-3">
                    {selectedTicket.messages?.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.sender === 'admin' 
                            ? msg.isInternal 
                              ? 'bg-yellow-50 border border-yellow-200' 
                              : 'bg-blue-50' 
                            : 'bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{msg.senderName}</span>
                          {msg.isInternal && (
                            <span className="text-xs bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded">Internal</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{msg.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Box */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="p-4 border-t border-gray-200">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="3"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="w-4 h-4 text-yellow-600 rounded"
                          />
                          Internal Note
                        </label>
                        <button
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !newMessage.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          {sendingMessage ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <HeadphonesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select a ticket to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
