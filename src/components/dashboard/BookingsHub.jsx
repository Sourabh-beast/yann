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
  
  const firstName = provider?.name?.split(" ")[0]?.trim();
  const heading = firstName ? `${firstName}'s booking schedule` : "Your booking schedule";

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
                    {["Booking", "Client", "Service", "Date", "Time", "Value", "Payment", "Status"].map((heading) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.bookingTime}</td>
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
                        {booking.formattedDate || formatDate(booking.bookingDate)} • {booking.bookingTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.serviceName} for {booking.customerName}
                      </p>
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
      </div>
    </div>
  );
}
