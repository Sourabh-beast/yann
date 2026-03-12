'use client'
import { useState, useEffect } from 'react';
import { ShieldCheck, ShieldX, Clock, Eye, X, CheckCircle, XCircle, User, Briefcase, FileText, AlertCircle } from 'lucide-react';

const TABS = [
  { label: 'All', value: 'all' },
  { label: 'Providers', value: 'provider' },
  { label: 'Homeowners', value: 'homeowner' },
];

const DOC_LABELS = {
  passport: 'Passport',
  visa: 'Visa Document',
  residential_certificate: 'Proof of Residence',
  oci_card: 'OCI Card',
};

export default function IdentityVerificationPage() {
  const [tab, setTab] = useState('all');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [tab]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/identity/pending?userType=${tab}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.data?.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching identity submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submission) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/identity/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: submission.userId, userType: submission.userType }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Identity verified successfully!');
        setSelected(null);
        fetchSubmissions();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      alert('❌ Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submission) => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch('/api/identity/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: submission.userId, userType: submission.userType, reason: rejectReason }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Verification rejected.');
        setSelected(null);
        setRejectReason('');
        setShowRejectInput(false);
        fetchSubmissions();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (err) {
      alert('❌ Failed to reject');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'pending') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700"><Clock className="w-3 h-3" />Pending</span>;
    if (status === 'approved') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700"><ShieldCheck className="w-3 h-3" />Approved</span>;
    if (status === 'rejected') return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700"><ShieldX className="w-3 h-3" />Rejected</span>;
    return null;
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Identity Verification</h2>
        <p className="text-gray-600">Review and approve identity documents submitted by Foreign Nationals and NRIs.</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${tab === t.value ? 'bg-blue-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={fetchSubmissions}
          className="ml-auto px-4 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-lg text-gray-400 gap-4">
          <ShieldCheck className="w-16 h-16 text-gray-200" />
          <p className="text-lg font-medium">No pending submissions</p>
          <p className="text-sm">All identity verifications are up to date.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Identity Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Documents</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Submitted</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={`${s.userType}-${s.userId}`} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {s.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.userType === 'provider' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {s.userType === 'provider' ? <Briefcase className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {s.userType === 'provider' ? 'Provider' : 'Homeowner'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
                        {s.identityType === 'nri' ? 'NRI / OCI' : s.identityType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {s.identityDocuments?.length || 0} document{(s.identityDocuments?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {s.identitySubmittedAt ? new Date(s.identitySubmittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="py-4 px-6">{statusBadge(s.identityVerificationStatus)}</td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => { setSelected(s); setShowRejectInput(false); setRejectReason(''); }}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Review"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                <p className="text-blue-100 text-sm mt-0.5">{selected.email} · {selected.phone}</p>
              </div>
              <button onClick={() => { setSelected(null); setShowRejectInput(false); setRejectReason(''); }} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Meta */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">User Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selected.userType}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Identity Type</p>
                  <p className="text-sm font-semibold text-gray-900 capitalize">{selected.identityType === 'nri' ? 'NRI / OCI' : selected.identityType}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">Submitted</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selected.identitySubmittedAt ? new Date(selected.identitySubmittedAt).toLocaleDateString('en-IN') : '—'}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700">Current Status:</span>
                {statusBadge(selected.identityVerificationStatus)}
                {selected.identityVerificationStatus === 'rejected' && selected.identityRejectionReason && (
                  <span className="text-xs text-red-600 ml-2">Reason: {selected.identityRejectionReason}</span>
                )}
              </div>

              {/* Documents */}
              <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submitted Documents
              </h4>
              {selected.identityDocuments?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {selected.identityDocuments.map((doc, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {DOC_LABELS[doc.documentType] || doc.documentType}
                        </p>
                      </div>
                      {doc.documentUrl?.startsWith('data:image') ? (
                        <div className="relative group cursor-pointer" onClick={() => setPreviewDoc(doc)}>
                          <img
                            src={doc.documentUrl}
                            alt={doc.documentType}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center bg-gray-50 text-gray-400">
                          <FileText className="w-10 h-10" />
                        </div>
                      )}
                      <p className="text-xs text-gray-400 px-3 py-1.5">
                        Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-400 mb-6 p-4 bg-gray-50 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">No documents found.</p>
                </div>
              )}

              {/* Reject reason input */}
              {showRejectInput && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason <span className="text-red-500">*</span></label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    placeholder="Enter reason for rejection (will be shown to user)..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            {selected.identityVerificationStatus === 'pending' && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
                {!showRejectInput ? (
                  <>
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition font-medium flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selected)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading ? 'Processing...' : 'Approve'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(selected)}
                      disabled={actionLoading || !rejectReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Full Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X className="w-7 h-7" />
            </button>
            <p className="text-white text-center mb-3 font-semibold">
              {DOC_LABELS[previewDoc.documentType] || previewDoc.documentType}
            </p>
            <img
              src={previewDoc.documentUrl}
              alt={previewDoc.documentType}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
