'use client'
import { useState, useEffect } from 'react';
import { Users, Briefcase, ClipboardList, Activity, Menu, X, CheckCircle, XCircle, Clock, LogOut, Phone, Mail, IndianRupee, AlertCircle, Plus, Settings, BarChart3, Star, Bell, Gift, HeadphonesIcon, FileText, Package, DollarSign } from 'lucide-react';

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchServiceRequests();
  }, []);

  const fetchServiceRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/service-requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (providerId) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-requests/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Service request approved!');
        fetchServiceRequests();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('❌ Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (providerId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/service-requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, reason })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Service request rejected!');
        fetchServiceRequests();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('❌ Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Service Requests</h2>
              <p className="text-gray-600">Review and approve provider service additions</p>
            </div>
          </div>
          {requests.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-xl font-medium">
              <Clock className="w-4 h-4" />
              {requests.length} pending request{requests.length !== 1 ? 's' : ''}
            </div>
          )}
        </header>

        {/* Requests List */}
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-gray-600">No pending service requests at the moment.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div key={request.providerId} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                {/* Request Header */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-amber-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.providerName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {request.providerEmail}
                        </div>
                        {request.providerPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {request.providerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-700">
                      <Clock className="w-4 h-4" />
                      {new Date(request.requestedAt).toLocaleDateString('en-IN', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Request Body */}
                <div className="p-6">
                  {/* Current Services */}
                  {request.currentServices && request.currentServices.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Current Services</h4>
                      <div className="flex flex-wrap gap-2">
                        {request.currentRates && request.currentRates.length > 0 ? (
                          request.currentRates.map((rate, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                              <span className="text-gray-700 font-medium">{rate.serviceName}</span>
                              <span className="text-green-600 font-bold">₹{rate.price?.toLocaleString('en-IN')}</span>
                            </div>
                          ))
                        ) : (
                          request.currentServices.map((service, idx) => (
                            <span key={idx} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                              {service}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Services Requested */}
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      New Services Requested
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {request.addedRates.map((rate, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-semibold text-gray-800">{rate.serviceName}</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                            <IndianRupee className="w-4 h-4" />
                            {rate.price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Driver License Images + Police Verification */}
                  {request.driverServiceDetails && (request.driverServiceDetails.licenseFrontImage || request.driverServiceDetails.licenseBackImage || request.driverServiceDetails.policeVerificationDoc) && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                         <span className="text-lg">🪪</span>
                         Driver Documents
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {request.driverServiceDetails.licenseFrontImage && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-2">
                            <p className="text-xs text-gray-500 font-medium mb-2 uppercase text-center tracking-wider">Front Photo</p>
                            <img src={request.driverServiceDetails.licenseFrontImage} alt="License Front" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                          </div>
                        )}
                        {request.driverServiceDetails.licenseBackImage && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-2">
                            <p className="text-xs text-gray-500 font-medium mb-2 uppercase text-center tracking-wider">Back Photo</p>
                            <img src={request.driverServiceDetails.licenseBackImage} alt="License Back" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                          </div>
                        )}
                        {request.driverServiceDetails.policeVerificationDoc && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-2">
                            <p className="text-xs text-gray-500 font-medium mb-2 uppercase text-center tracking-wider">Police Verification</p>
                            <img src={request.driverServiceDetails.policeVerificationDoc} alt="Police Verification" className="w-full h-40 object-cover rounded-lg shadow-sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Info */}
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>
                      Provider status: <span className="font-semibold text-amber-700">{request.currentStatus}</span>
                      {request.previousStatus && request.previousStatus !== request.currentStatus && (
                        <span className="text-gray-500"> (was {request.previousStatus})</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                  <button
                    onClick={() => handleReject(request.providerId)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.providerId)}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Services
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}
