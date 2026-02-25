'use client'
import { useState, useEffect } from 'react';
import { 
  Activity, Users, Briefcase, ClipboardList, Menu, X, LogOut, 
  Star, DollarSign, Package, Settings, Search, Filter,
  CheckCircle, XCircle, Flag, Eye, Trash2, BarChart3, Bell,
  ThumbsUp, MessageSquare, AlertTriangle, Gift, HeadphonesIcon, FileText
} from 'lucide-react';

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [page, statusFilter, ratingFilter, searchTerm, flaggedOnly]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      if (statusFilter) params.append('status', statusFilter);
      if (ratingFilter) params.append('rating', ratingFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (flaggedOnly) params.append('flagged', 'true');

      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId, action) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reviewId, action, reason: actionReason })
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        setActionModal(null);
        setSelectedReview(null);
        setActionReason('');
        alert(`✅ Review ${action}ed successfully!`);
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) return;
    
    try {
      const res = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
        alert('✅ Review deleted!');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Delete failed');
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (review) => {
    if (review.isFlagged) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Flagged</span>;
    }
    switch (review.status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">Pending</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">{review.status}</span>;
    }
  };

  return (
    <>
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Reviews & Ratings</h2>
          <p className="text-gray-600">Manage and moderate all customer reviews</p>
        </header>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Avg Rating</p>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{stats.avgRating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Flagged</p>
              <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-gray-600">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        {stats && (
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Rating Distribution</h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = stats[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}Stars`] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium">{rating}★</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-sm text-gray-500 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews..."
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
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="flagged">Flagged</option>
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="w-4 h-4 text-red-600"
              />
              <Flag className="w-4 h-4 text-red-500" />
              <span className="text-sm">Flagged Only</span>
            </label>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Found</h3>
            <p className="text-gray-500">No reviews match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className={`bg-white rounded-2xl p-6 shadow-lg border ${review.isFlagged ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {review.reviewerName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{review.reviewerName || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">
                          for <span className="font-medium text-blue-600">{review.providerName || 'Unknown Provider'}</span>
                        </p>
                      </div>
                      {getStatusBadge(review)}
                      {review.isVerifiedPurchase && (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    {/* Rating & Service */}
                    <div className="flex items-center gap-4 mb-3">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">• {review.service}</span>
                      <span className="text-sm text-gray-500">• {new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Comment */}
                    {review.title && <p className="font-medium text-gray-900 mb-1">{review.title}</p>}
                    <p className="text-gray-600">{review.comment}</p>

                    {/* Flag reason if flagged */}
                    {review.isFlagged && review.flagReason && (
                      <div className="mt-3 p-3 bg-red-100 rounded-lg">
                        <p className="text-sm text-red-700">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          Flag Reason: {review.flagReason}
                        </p>
                      </div>
                    )}

                    {/* Provider Response */}
                    {review.providerResponse?.comment && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 mb-1">Provider Response:</p>
                        <p className="text-sm text-gray-600">{review.providerResponse.comment}</p>
                      </div>
                    )}

                    {/* Helpful count */}
                    {review.helpfulCount > 0 && (
                      <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" /> {review.helpfulCount} found helpful
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {review.status !== 'approved' && !review.isFlagged && (
                      <button
                        onClick={() => handleAction(review._id, 'approve')}
                        className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                    )}
                    {review.status !== 'rejected' && (
                      <button
                        onClick={() => { setSelectedReview(review); setActionModal('reject'); }}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    )}
                    {!review.isFlagged ? (
                      <button
                        onClick={() => { setSelectedReview(review); setActionModal('flag'); }}
                        className="flex items-center gap-1 px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition"
                      >
                        <Flag className="w-4 h-4" /> Flag
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(review._id, 'unflag')}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      >
                        <Flag className="w-4 h-4" /> Unflag
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review._id)}
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
      {/* Action Modal */}
      {actionModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionModal === 'flag' ? 'Flag Review' : 'Reject Review'}
            </h3>
            <p className="text-gray-600 mb-4">
              {actionModal === 'flag' 
                ? 'Please provide a reason for flagging this review:'
                : 'Please provide a reason for rejecting this review:'}
            </p>
            <textarea
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder={actionModal === 'flag' ? 'e.g., Inappropriate content, spam, fake review...' : 'e.g., Violates guidelines, offensive language...'}
              className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setActionModal(null); setSelectedReview(null); setActionReason(''); }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(selectedReview._id, actionModal)}
                disabled={actionLoading}
                className={`flex-1 px-4 py-2 rounded-xl text-white ${
                  actionModal === 'flag' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'
                } disabled:opacity-50`}
              >
                {actionLoading ? 'Processing...' : actionModal === 'flag' ? 'Flag Review' : 'Reject Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
