'use client';
import { useState, useEffect } from 'react';
import {
    PhoneCall,
    Calendar,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock
} from 'lucide-react';

export default function CallRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/call-requests');
            const data = await res.json();
            if (data.success) {
                setRequests(data.data);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch('/api/admin/call-requests', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                setRequests(requests.map(req =>
                    req._id === id ? { ...req, status: newStatus } : req
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.phoneNumber.includes(searchTerm);
        const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'called':
            case 'resolved':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" /> Resolved
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                        <XCircle className="w-3 h-3" /> Cancelled
                    </span>
                );
            default:
                return (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                );
        }
    };

    return (
        <>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Call Requests</h1>
                    <p className="text-gray-600">Manage callback requests from users</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search phone number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                            {['all', 'pending', 'called', 'resolved', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterStatus === status
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User / Phone</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requested At</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRequests.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                                No requests found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRequests.map((req) => (
                                            <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                            <PhoneCall className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{req.phoneNumber}</p>
                                                            <p className="text-xs text-gray-500">USER ID: {req._id.slice(-6)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(req.createdAt).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(req.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-end gap-2">
                                                        {req.status === 'pending' && (
                                                            <button
                                                                onClick={() => updateStatus(req._id, 'called')}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                            >
                                                                Mark Called
                                                            </button>
                                                        )}
                                                        {req.status !== 'resolved' && req.status !== 'cancelled' && (
                                                            <button
                                                                onClick={() => updateStatus(req._id, 'resolved')}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                            >
                                                                Resolve
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
