'use client'
import { useState, useEffect } from 'react';
import {
  Users, Briefcase, ClipboardList, Activity, Menu, X, Search,
  DollarSign, Package, Settings, LogOut, TrendingUp, TrendingDown,
  Calendar, CreditCard, RefreshCw, AlertTriangle, CheckCircle, Clock,
  ArrowUpRight, ArrowDownRight, Filter, Download, Eye, XCircle,
  BarChart3, Star, Bell, Gift, HeadphonesIcon, FileText, Wallet
} from 'lucide-react';

export default function FinancialsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions, refunds, disputes

  // Data states
  const [revenue, setRevenue] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [period, setPeriod] = useState('monthly');

  // Platform Wallet State
  const [platformWallet, setPlatformWallet] = useState(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);

  // Filters
  const [transactionFilter, setTransactionFilter] = useState({ type: '', status: '' });
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [refundModal, setRefundModal] = useState(null);
  const [disputeModal, setDisputeModal] = useState(null);
  const [refundForm, setRefundForm] = useState({ amount: 0, reason: '' });

  useEffect(() => {
    fetchData();
  }, [period, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch revenue data
      const revenueRes = await fetch(`/api/admin/revenue?period=${period}`);
      const revenueData = await revenueRes.json();
      if (revenueData.success) {
        setRevenue(revenueData.data);
      }

      // Fetch transactions
      const transRes = await fetch('/api/admin/transactions');
      const transData = await transRes.json();
      if (transData.success) {
        setTransactions(transData.data.transactions);
      }

      // Fetch disputes
      const disputeRes = await fetch('/api/admin/disputes');
      const disputeData = await disputeRes.json();
      if (disputeData.success) {
        setDisputes(disputeData.data.disputes);
      }

      // Fetch platform wallet data
      try {
        const walletRes = await fetch('/api/admin/wallet');
        const walletData = await walletRes.json();
        if (walletData.success) {
          setPlatformWallet(walletData.data);
        }
      } catch (e) {
        console.log('Platform wallet not available:', e);
      }

      // Fetch withdrawal requests
      try {
        const withdrawRes = await fetch('/api/admin/withdrawals?status=pending');
        const withdrawData = await withdrawRes.json();
        console.log('📊 Withdrawal API Response:', withdrawData);
        if (withdrawData.success) {
          console.log('📊 Withdrawals data:', withdrawData.data);
          setWithdrawalRequests(withdrawData.data || []);
        }
      } catch (e) {
        console.log('Withdrawals not available:', e);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundModal || !refundForm.reason || refundForm.amount <= 0) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: refundModal._id,
          amount: refundForm.amount,
          reason: refundForm.reason,
          processedBy: 'admin'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Refund processed successfully!');
        setRefundModal(null);
        setRefundForm({ amount: 0, reason: '' });
        fetchData();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('❌ Failed to process refund');
    }
  };

  const handleResolveDispute = async (transactionId, resolution, status) => {
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          resolution,
          status,
          processedBy: 'admin'
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Dispute updated!');
        setDisputeModal(null);
        fetchData();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error updating dispute:', error);
    }
  };

  const handleApproveWithdrawal = async (transactionId) => {
    const paymentTransactionId = prompt('Enter the payment transaction ID (e.g., UTR, UPI ref):');
    
    if (!paymentTransactionId || paymentTransactionId.trim() === '') {
      alert('⚠️ Transaction ID is required to approve withdrawal');
      return;
    }
    
    if (!confirm('Are you sure you want to approve this withdrawal? The amount will be deducted from the provider\'s wallet and the transaction ID will be sent to them.')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/withdrawals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          action: 'approve',
          paymentReferenceId: paymentTransactionId.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Withdrawal approved!\n\n' +
          `Transaction ID: ${paymentTransactionId}\n` +
          `Amount transferred: ₹${data.data.netAmount}\n` +
          `The transaction ID has been sent to the provider.`);
        fetchData();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('❌ Failed to approve withdrawal');
    }
  };

  const handleRejectWithdrawal = async (transactionId) => {
    const reason = prompt('Enter rejection reason:');
    
    if (!reason) {
      alert('Please provide a reason for rejection');
      return;
    }

    if (!confirm('Are you sure you want to reject this withdrawal?')) {
      return;
    }

    try {
      const res = await fetch('/api/admin/withdrawals/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          action: 'reject',
          rejectionReason: reason
        })
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Withdrawal rejected. The amount remains in the provider\'s wallet.');
        fetchData();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('❌ Failed to reject withdrawal');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <>
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h2>
            <p className="text-gray-600">Track revenue, transactions, refunds and disputes.</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="yearly">This Year</option>
            </select>
            <button
              onClick={fetchData}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'wallet', label: 'Platform Wallet', icon: Wallet },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'refunds', label: 'Refunds', icon: RefreshCw },
            { id: 'disputes', label: 'Disputes', icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && revenue && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <StatCard
                    title="Total Revenue"
                    value={formatCurrency(revenue.summary.totalRevenue)}
                    subtitle={`${revenue.summary.totalBookings} bookings`}
                    icon={DollarSign}
                    trend={revenue.summary.revenueGrowth}
                    gradient="from-green-500 to-emerald-600"
                  />
                  <StatCard
                    title="Net Revenue"
                    value={formatCurrency(revenue.summary.netRevenue)}
                    subtitle="After refunds"
                    icon={TrendingUp}
                    gradient="from-blue-500 to-blue-600"
                  />
                  <StatCard
                    title="Commission Earned"
                    value={formatCurrency(revenue.summary.totalCommission)}
                    subtitle="Platform fee"
                    icon={CreditCard}
                    gradient="from-purple-500 to-purple-600"
                  />
                  <StatCard
                    title="Total Refunds"
                    value={formatCurrency(revenue.summary.totalRefunds)}
                    subtitle="Processed refunds"
                    icon={RefreshCw}
                    gradient="from-red-500 to-red-600"
                    negative
                  />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Revenue by Category */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Category</h3>
                    <div className="space-y-3">
                      {revenue.charts.revenueByCategory?.map((cat, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 capitalize">{cat._id || 'Other'}</span>
                          <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${(cat.revenue / revenue.summary.totalRevenue) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900 w-24 text-right">
                              {formatCurrency(cat.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Services */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Top Services by Revenue</h3>
                    <div className="space-y-3">
                      {revenue.charts.topServices?.slice(0, 5).map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-medium text-gray-700">{service._id}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">{formatCurrency(service.revenue)}</p>
                            <p className="text-xs text-gray-500">{service.count} bookings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue by Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {revenue.charts.revenueByPaymentMethod?.map((method, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-sm text-gray-600 capitalize mb-1">{method._id || 'Other'}</p>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(method.revenue)}</p>
                        <p className="text-xs text-gray-500">{method.count} transactions</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Platform Wallet Tab */}
            {activeTab === 'wallet' && (
              <>
                {/* Wallet Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <StatCard
                    title="Platform Wallet Balance"
                    value={formatCurrency(platformWallet?.balance || 0)}
                    subtitle="Available for operations"
                    icon={Wallet}
                    gradient="from-indigo-500 to-purple-600"
                  />
                  <StatCard
                    title="Total Commission Earned"
                    value={formatCurrency(platformWallet?.totalCommissionsEarned || 0)}
                    subtitle="From partner withdrawals"
                    icon={TrendingUp}
                    gradient="from-green-500 to-emerald-600"
                  />
                  <StatCard
                    title="Total Volume Processed"
                    value={formatCurrency(platformWallet?.totalVolumeProcessed || 0)}
                    subtitle="All time transactions"
                    icon={CreditCard}
                    gradient="from-blue-500 to-blue-600"
                  />
                </div>

                {/* Pending Withdrawal Requests */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Pending Withdrawal Requests</h3>
                  {withdrawalRequests.filter(w => w.status === 'pending').length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No pending withdrawal requests</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {withdrawalRequests.filter(w => w.status === 'pending').map((req) => (
                        <div key={req._id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            {/* Provider Info */}
                            <div className="flex-1">
                              <div className="mb-4">
                                <h4 className="text-lg font-bold text-gray-900 mb-1">
                                  {req.provider?.name || 'Partner'}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <span>📞 {req.provider?.phone || 'N/A'}</span>
                                  <span>💰 Balance: {formatCurrency(req.provider?.currentBalance || 0)}</span>
                                  <span>⭐ {req.provider?.rating || 'N/A'} rating</span>
                                </div>
                              </div>

                              {/* Bank Details */}
                              <div className="bg-blue-50 p-4 rounded-lg mb-3">
                                <p className="text-xs font-semibold text-blue-900 mb-2">Bank Account Details:</p>
                                {req.provider?.bankDetails ? (
                                  <>
                                    <p className="text-sm text-gray-700">
                                      <strong>A/C:</strong> {req.provider.bankDetails.fullAccountNumber || req.provider.bankDetails.accountNumber}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <strong>IFSC:</strong> {req.provider.bankDetails.ifscCode}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <strong>Bank:</strong> {req.provider.bankDetails.bankName}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-sm text-red-600">⚠️ No bank details available</p>
                                )}
                              </div>

                              {/* Booking Stats */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs font-semibold text-gray-900 mb-2">Booking History:</p>
                                {console.log('Booking stats for withdrawal:', req._id, req.bookingStats)}
                                {req.bookingStats ? (
                                  <div className="flex gap-4 text-sm">
                                    <span className="text-gray-700">
                                      Total: <strong>{req.bookingStats.totalBookings || 0}</strong>
                                    </span>
                                    <span className="text-green-600">
                                      Completed: <strong>{req.bookingStats.completedBookings || 0}</strong>
                                    </span>
                                    <span className="text-blue-600">
                                      Earnings: <strong>{formatCurrency(req.bookingStats.totalEarnings || 0)}</strong>
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">Loading booking data...</p>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 mt-3">
                                Requested: {new Date(req.createdAt).toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>

                            {/* Amount & Actions */}
                            <div className="text-right border-l border-gray-200 pl-6">
                              {(() => {
                                // Calculate commission on frontend to ensure it always displays correctly
                                const requestedAmount = req.amount || 0;
                                const commissionRate = req.commissionPercentage || 15;
                                
                                // Always calculate commission from the amount
                                const calculatedCommission = Math.round(requestedAmount * (commissionRate / 100) * 100) / 100;
                                const calculatedNetAmount = Math.round((requestedAmount - calculatedCommission) * 100) / 100;
                                
                                // Use backend values if they exist, otherwise use calculated
                                const commissionAmount = req.commissionAmount || calculatedCommission;
                                const amountToPay = req.providerAmount || calculatedNetAmount;
                                
                                return (
                                  <>
                                    {/* Breakdown Card - matching mobile app style */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-left">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-700">Amount</span>
                                        <span className="text-base font-semibold text-gray-900">{formatCurrency(requestedAmount)}</span>
                                      </div>
                                      <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-red-600">Commission ({commissionRate}%)</span>
                                        <span className="text-base font-semibold text-red-600">-{formatCurrency(commissionAmount)}</span>
                                      </div>
                                      <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                                        <span className="text-base font-bold text-green-600">You'll Pay</span>
                                        <span className="text-2xl font-bold text-green-600">{formatCurrency(amountToPay)}</span>
                                      </div>
                                    </div>
                                  </>
                                );
                              })()}
                              
                              <div className="flex gap-2">
                                <button
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                                  onClick={() => handleApproveWithdrawal(req._id)}
                                >
                                  Approve
                                </button>
                                <button
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                                  onClick={() => handleRejectWithdrawal(req._id)}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Commission Transactions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Commission History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Partner</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Type</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Withdrawal Amount</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Commission</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(platformWallet?.recentTransactions || []).length === 0 ? (
                          <tr>
                            <td colSpan="5" className="py-12 text-center text-gray-500">
                              No commission transactions yet
                            </td>
                          </tr>
                        ) : (
                          (platformWallet?.recentTransactions || []).slice(0, 10).map((tx) => (
                            <tr key={tx._id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-6 text-sm text-gray-600">
                                {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                              </td>
                              <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                {tx.providerId?.name || 'Partner'}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600 capitalize">
                                {tx.type?.replace(/_/g, ' ') || 'Commission'}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-600">
                                {formatCurrency(tx.withdrawalDetails?.requestedAmount || tx.amount)}
                              </td>
                              <td className="py-4 px-6 text-sm font-bold text-green-600">
                                +{formatCurrency(tx.withdrawalDetails?.commission || tx.amount)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900">All Transactions</h3>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={transactionFilter.status}
                        onChange={(e) => setTransactionFilter({ ...transactionFilter, status: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">ID</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Service</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Amount</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Method</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((trans) => (
                          <tr key={trans._id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                              {trans._id?.slice(-8)}
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {trans.serviceName || 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {trans.customerId?.name || 'Guest'}
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-gray-900">
                              {formatCurrency(trans.amount)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600 capitalize">
                              {trans.paymentMethod}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(trans.status)}`}>
                                {trans.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                              {new Date(trans.createdAt).toLocaleDateString('en-IN')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Refunds Tab */}
            {activeTab === 'refunds' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Refund Management</h3>
                <p className="text-gray-600 mb-6">Process refunds for completed bookings. Go to Bookings page to initiate refund.</p>

                <div className="space-y-4">
                  {transactions.filter(t => t.type === 'refund').length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No refunds processed yet</p>
                    </div>
                  ) : (
                    transactions.filter(t => t.type === 'refund').map((refund) => (
                      <div key={refund._id} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{refund.serviceName}</p>
                            <p className="text-sm text-gray-600">Reason: {refund.refundReason}</p>
                            <p className="text-xs text-gray-500">
                              Processed: {new Date(refund.refundedAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-red-600">-{formatCurrency(refund.refundAmount)}</p>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Disputes Tab */}
            {activeTab === 'disputes' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Disputes</h3>

                <div className="space-y-4">
                  {disputes.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                      <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No disputes found</p>
                    </div>
                  ) : (
                    disputes.map((dispute) => (
                      <div key={dispute._id} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{dispute.serviceName}</p>
                            <p className="text-sm text-gray-600">
                              Raised by: {dispute.dispute?.raisedBy} |
                              Reason: {dispute.dispute?.reason}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(dispute.dispute?.raisedAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${dispute.dispute?.status === 'open' ? 'bg-yellow-100 text-yellow-700' :
                              dispute.dispute?.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                              {dispute.dispute?.status}
                            </span>
                            {dispute.dispute?.status === 'open' && (
                              <button
                                onClick={() => setDisputeModal(dispute)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      {/* Dispute Resolution Modal */}
      {disputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Resolve Dispute</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Service:</strong> {disputeModal.serviceName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Reason:</strong> {disputeModal.dispute?.reason}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
              <textarea
                id="resolution"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter resolution details..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDisputeModal(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const resolution = document.getElementById('resolution').value;
                  handleResolveDispute(disputeModal._id, resolution, 'resolved');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper Components
function StatCard({ title, value, subtitle, icon: Icon, gradient, trend, negative }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className={`text-3xl font-bold mb-1 ${negative ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}
