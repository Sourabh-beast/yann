'use client';

import { useMemo, useState, useEffect } from "react";
import useProviderSession from "@/hooks/useProviderSession";

const filterOptions = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "rejected", label: "Rejected" },
];

const statusMeta = {
  pending: {
    label: "Pending",
    badgeClass: "bg-yellow-50 text-yellow-600 border-yellow-100",
  },
  accepted: {
    label: "Accepted",
    badgeClass: "bg-blue-50 text-blue-600 border-blue-100",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-red-50 text-red-600 border-red-100",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-gray-50 text-gray-600 border-gray-100",
  },
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function BookingsHub() {
  const { provider, loading } = useProviderSession();
  const [activeFilter, setActiveFilter] = useState("accepted");
  const [bookingsData, setBookingsData] = useState([]);
  const [fetchingBookings, setFetchingBookings] = useState(true);
  const [actionState, setActionState] = useState({ bookingId: null, type: null });
  const [negotiationModal, setNegotiationModal] = useState({ open: false, booking: null, amount: "", note: "" });
  const [negotiationError, setNegotiationError] = useState("");
  
  const firstName = provider?.name?.split(" ")[0]?.trim();
  const heading = firstName ? `${firstName}'s booking schedule` : "Your booking schedule";
  const providerIdRaw = provider?._id || provider?.id || null;
  const providerId = providerIdRaw ? providerIdRaw.toString() : null;
  const providerName = provider?.name || "Provider";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setFetchingBookings(true);
      const providerEmail = localStorage.getItem('providerEmail');
      
      if (!providerEmail) {
        console.error('No provider email found');
        return;
      }

      const response = await fetch(`/api/provider/requests?email=${providerEmail}`);
      const data = await response.json();

      if (data.success) {
        // Combine pending and accepted bookings
        const allBookings = [
          ...data.pendingRequests.map(b => ({ ...b, status: 'pending' })),
          ...data.acceptedBookings.map(b => ({ ...b, status: b.status }))
        ];
        setBookingsData(allBookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setFetchingBookings(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookingsData;
    }
    return bookingsData.filter((booking) => booking.status === activeFilter);
  }, [activeFilter, bookingsData]);

  const todaysBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookingsData.filter((booking) => booking.bookingDate?.slice(0, 10) === today);
  }, [bookingsData]);

  const totalRevenue = useMemo(
    () =>
      bookingsData
        .filter((booking) => booking.status === "completed")
        .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
    [bookingsData]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Pending",
        value: bookingsData.filter((b) => b.status === "pending").length,
        helper: "Awaiting response",
      },
      {
        label: "Accepted",
        value: bookingsData.filter((b) => b.status === "accepted").length,
        helper: "Confirmed bookings",
      },
      {
        label: "Completed",
        value: bookingsData.filter((b) => b.status === "completed").length,
        helper: currencyFormatter.format(totalRevenue) + " earned",
      },
      {
        label: "Today",
        value: todaysBookings.length,
        helper: todaysBookings.length ? "Schedule ready" : "No bookings",
      },
    ],
    [bookingsData, todaysBookings.length, totalRevenue]
  );

  const workQueue = useMemo(
    () =>
      bookingsData
        .filter((booking) => booking.status === "pending" || booking.status === "accepted")
        .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))
        .slice(0, 4),
    [bookingsData]
  );

  const setLoadingState = (bookingId, type) => setActionState({ bookingId, type });
  const clearLoadingState = () => setActionState({ bookingId: null, type: null });
  const isActionLoading = (bookingId, type) => actionState.bookingId === bookingId && actionState.type === type;

  const awaitingHomeownerResponse = (booking) => {
    if (!booking.negotiation) return false;
    return (
      booking.negotiation.isActive &&
      booking.negotiation.status === "pending" &&
      booking.negotiation.providerId === providerId
    );
  };

  const negotiationStatusCopy = (booking) => {
    if (!booking.negotiation) return null;
    const { status, isActive, providerId: negotiationProviderId } = booking.negotiation;
    if (status === "idle") return null;

    if (status === "pending" && isActive) {
      if (negotiationProviderId === providerId) {
        return "Waiting for homeowner response";
      }
      return "Homeowner reviewing other offer";
    }

    if (status === "accepted") {
      return negotiationProviderId === providerId ? "Homeowner accepted your offer" : "Offer accepted";
    }

    if (status === "declined") {
      return negotiationProviderId === providerId ? "Homeowner declined your offer" : "Offer declined";
    }

    if (status === "cancelled") {
      return "Negotiation cancelled";
    }

    return null;
  };

  const handleAccept = async (booking) => {
    if (!providerId) {
      alert("Provider session isn't ready. Please refresh or sign in again.");
      return;
    }

    setLoadingState(booking.id, "accept");
    try {
      const response = await fetch("/api/bookings/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookingId: booking.id,
          providerId,
          providerName
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to accept booking");
      }

      await fetchBookings();
    } catch (error) {
      console.error("Booking accept error", error);
      alert(error.message || "Unable to accept booking");
    } finally {
      clearLoadingState();
    }
  };

  const handleReject = async (booking) => {
    if (!providerId) {
      alert("Provider session isn't ready. Please refresh or sign in again.");
      return;
    }

    if (typeof window !== "undefined" && !window.confirm("Reject this booking? It will move to another provider.")) {
      return;
    }

    const reason = typeof window !== "undefined"
      ? window.prompt("Add a short note (optional)", "Not available")
      : "";

    setLoadingState(booking.id, "reject");
    try {
      const response = await fetch("/api/bookings/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookingId: booking.id,
          providerId,
          reason: reason || ""
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to reject booking");
      }

      await fetchBookings();
    } catch (error) {
      console.error("Booking reject error", error);
      alert(error.message || "Unable to reject booking");
    } finally {
      clearLoadingState();
    }
  };

  const handleNegotiateClick = (booking) => {
    if (!providerId) {
      alert("Provider session isn't ready. Please refresh or sign in again.");
      return;
    }

    setNegotiationError("");
    setNegotiationModal({
      open: true,
      booking,
      amount:
        booking.negotiation?.isActive && booking.negotiation?.providerId === providerId
          ? booking.negotiation?.proposedAmount || booking.totalPrice || ""
          : booking.totalPrice || "",
      note:
        booking.negotiation?.isActive && booking.negotiation?.providerId === providerId
          ? booking.negotiation?.note || ""
          : ""
    });
  };

  const closeNegotiationModal = () => {
    setNegotiationModal({ open: false, booking: null, amount: "", note: "" });
    setNegotiationError("");
    clearLoadingState();
  };

  const submitNegotiation = async () => {
    if (!negotiationModal.booking || !providerId) {
      setNegotiationError("Missing booking or provider context.");
      return;
    }

    const normalizedAmount = Number(negotiationModal.amount);
    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      setNegotiationError("Enter a valid proposed amount.");
      return;
    }

    setNegotiationError("");
    setLoadingState(negotiationModal.booking.id, "negotiate");

    try {
      const response = await fetch("/api/bookings/negotiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bookingId: negotiationModal.booking.id,
          providerId,
          providerName,
          proposedAmount: normalizedAmount,
          note: negotiationModal.note
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Negotiation failed");
      }

      closeNegotiationModal();
      await fetchBookings();
    } catch (error) {
      console.error("Negotiation error", error);
      setNegotiationError(error.message || "Failed to submit negotiation");
    } finally {
      clearLoadingState();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Bookings control room</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{heading}</h1>
          <p className="text-gray-600 max-w-3xl">
            Monitor every appointment, confirm time slots, and keep clients informed. Your most important bookings
            surface first so you never miss a prep window.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {summaryCards.map((card) => (
            <article key={card.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-10">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Bookings board</h2>
              <p className="text-sm text-gray-500">Switch views to track upcoming jobs, in-progress sessions, and follow-ups.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                    activeFilter === filter.key
                      ? "bg-blue-600 text-white border-blue-600 shadow"
                      : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {fetchingBookings ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg font-medium">No bookings found</p>
                <p className="text-gray-400 text-sm mt-2">Bookings matching this filter will appear here</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/60">
                  <tr>
                    { ["Booking", "Client", "Service", "Date", "Time", "Value", "Payment", "Status", "Actions"].map((heading) => (
                      <th
                        key={heading}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/70 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900">{booking.id?.toString().slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{booking.customerAddress || 'Address not provided'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-semibold text-gray-900">{booking.customerName}</p>
                        <p className="text-xs text-gray-500">{booking.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{booking.serviceName}</p>
                        {booking.serviceCategory && (
                          <p className="text-xs text-gray-400 capitalize">{booking.serviceCategory}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.formattedDate || formatDate(booking.bookingDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {booking.serviceCategory === 'driver' && booking.driverDetails ? (
                          <div>
                            <p className="font-semibold text-gray-900">
                              {booking.driverDetails.startTime} - {booking.driverDetails.endTime}
                            </p>
                            <p className="text-xs text-gray-500">
                              {booking.driverDetails.totalHours} hrs (OT {booking.driverDetails.overtimeHours} hrs)
                            </p>
                          </div>
                        ) : (
                          booking.bookingTime
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {booking.totalPrice ? currencyFormatter.format(booking.totalPrice) : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                        {booking.paymentMethod || 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full ${
                            statusMeta[booking.status]?.badgeClass || 'bg-gray-50 text-gray-600 border-gray-100'
                          }`}
                        >
                          {statusMeta[booking.status]?.label || booking.status}
                        </span>
                        {negotiationStatusCopy(booking) && (
                          <p className="mt-1 text-xs font-semibold text-blue-600">
                            {negotiationStatusCopy(booking)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {booking.status === 'pending' ? (
                          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleAccept(booking)}
                              disabled={isActionLoading(booking.id, 'accept') || !providerId}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition ${
                                isActionLoading(booking.id, 'accept') || !providerId
                                  ? 'bg-emerald-400 cursor-not-allowed'
                                  : 'bg-emerald-600 hover:bg-emerald-700'
                              }`}
                            >
                              {isActionLoading(booking.id, 'accept') ? 'Accepting...' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleNegotiateClick(booking)}
                              disabled={
                                isActionLoading(booking.id, 'negotiate') ||
                                awaitingHomeownerResponse(booking) ||
                                !providerId
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                isActionLoading(booking.id, 'negotiate') || awaitingHomeownerResponse(booking) || !providerId
                                  ? 'border-amber-100 bg-amber-50 text-amber-400 cursor-not-allowed'
                                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300'
                              }`}
                            >
                              {awaitingHomeownerResponse(booking) ? 'Awaiting reply' : 'Negotiate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(booking)}
                              disabled={isActionLoading(booking.id, 'reject') || !providerId}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                                isActionLoading(booking.id, 'reject') || !providerId
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {isActionLoading(booking.id, 'reject') ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No actions</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming bookings</h3>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Next four bookings</p>
            </div>
            {workQueue.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No upcoming bookings</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {workQueue.map((booking) => (
                  <li key={booking.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {booking.formattedDate || formatDate(booking.bookingDate)} • {booking.serviceCategory === 'driver' && booking.driverDetails
                          ? `${booking.driverDetails.startTime} - ${booking.driverDetails.endTime}`
                          : booking.bookingTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.serviceName} for {booking.customerName}
                      </p>
                      {booking.serviceCategory === 'driver' && booking.driverDetails && (
                        <p className="text-xs text-blue-600 font-semibold">
                          {booking.driverDetails.totalHours} hrs total • OT {booking.driverDetails.overtimeHours} hrs
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{booking.customerAddress}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 md:text-right">
                      <div className="text-sm text-gray-500">
                        <p className="font-semibold text-gray-900">Contact</p>
                        <p>{booking.customerPhone}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p className="font-semibold text-gray-900">Payment</p>
                        <p>{booking.totalPrice ? currencyFormatter.format(booking.totalPrice) : "—"}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Quick stats</h3>
              <p className="text-sm text-gray-500">Overview of your booking performance</p>
            </div>
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{bookingsData.length}</p>
                <p className="text-sm text-gray-600 mt-1">All time bookings</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{currencyFormatter.format(totalRevenue)}</p>
                <p className="text-sm text-gray-600 mt-1">From completed bookings</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Response Rate</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {bookingsData.length > 0 
                    ? Math.round((bookingsData.filter(b => b.status !== 'pending').length / bookingsData.length) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-gray-600 mt-1">Bookings responded to</p>
              </div>
            </div>
          </aside>
        </section>

        {(loading || fetchingBookings) && (
          <div className="mt-10 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading your bookings...</span>
          </div>
        )}

        {negotiationModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Counter offer</p>
                  <h4 className="text-xl font-semibold text-gray-900 mt-1">
                    {negotiationModal.booking?.serviceName}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Booking #{negotiationModal.booking?.id?.toString().slice(-6).toUpperCase()} • {negotiationModal.booking?.customerName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeNegotiationModal}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  aria-label="Close negotiation"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Proposed amount
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={negotiationModal.amount}
                    onChange={(event) =>
                      setNegotiationModal((prev) => ({ ...prev, amount: event.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <label className="block text-sm font-semibold text-gray-700">
                  Note to homeowner
                  <textarea
                    rows={3}
                    value={negotiationModal.note}
                    onChange={(event) =>
                      setNegotiationModal((prev) => ({ ...prev, note: event.target.value.slice(0, 300) }))
                    }
                    className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Share why the new rate is needed"
                  />
                </label>

                {negotiationError && (
                  <p className="text-sm text-red-600 font-medium">{negotiationError}</p>
                )}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeNegotiationModal}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitNegotiation}
                  disabled={isActionLoading(negotiationModal.booking?.id, 'negotiate')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition ${
                    isActionLoading(negotiationModal.booking?.id, 'negotiate')
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isActionLoading(negotiationModal.booking?.id, 'negotiate') ? 'Sending...' : 'Send offer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
