'use client';

import { useMemo, useState } from "react";
import useProviderSession from "@/hooks/useProviderSession";

const bookingsDataset = [
  {
    id: "BK-1032",
    customer: "Anjali Sharma",
    service: "Luxury Bridal Makeup",
    date: "2024-06-18",
    slot: "10:00 AM – 12:00 PM",
    status: "upcoming",
    value: 4800,
    address: "DLF Phase 3, Gurugram",
    channel: "App",
    notes: "Allergic to standard foundation – carry hypoallergenic kit",
  },
  {
    id: "BK-1031",
    customer: "Mehul Rao",
    service: "Men's Sangeet Styling",
    date: "2024-06-17",
    slot: "05:00 PM – 07:00 PM",
    status: "in_progress",
    value: 2200,
    address: "Sector 46, Gurugram",
    channel: "Web",
    notes: "Add express hairstyling add-on",
  },
  {
    id: "BK-1027",
    customer: "Sana Iqbal",
    service: "Pre-Wedding Shoot Makeup",
    date: "2024-06-15",
    slot: "07:00 AM – 09:00 AM",
    status: "completed",
    value: 3600,
    address: "Noida Film City",
    channel: "Partner",
    notes: "Completed – add portfolio photos",
  },
  {
    id: "BK-1025",
    customer: "Ritika Jain",
    service: "Haldi Minimal Glam",
    date: "2024-06-14",
    slot: "08:30 AM – 10:00 AM",
    status: "completed",
    value: 1900,
    address: "Dwarka Sector 10",
    channel: "App",
    notes: "Customer tipped ₹250 in cash",
  },
  {
    id: "BK-1024",
    customer: "Kabir Malhotra",
    service: "Cocktail Party Styling",
    date: "2024-06-13",
    slot: "06:00 PM – 08:30 PM",
    status: "cancelled",
    value: 0,
    address: "Saket, New Delhi",
    channel: "Web",
    notes: "Cancelled – requested refund (processed)",
  },
  {
    id: "BK-1020",
    customer: "Tanya Khanna",
    service: "Reception Grand Makeover",
    date: "2024-06-22",
    slot: "03:00 PM – 05:30 PM",
    status: "upcoming",
    value: 5250,
    address: "Punjabi Bagh, New Delhi",
    channel: "App",
    notes: "Arrange travel buffer of 45 minutes",
  },
];

const filterOptions = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const statusMeta = {
  upcoming: {
    label: "Upcoming",
    badgeClass: "bg-blue-50 text-blue-600 border-blue-100",
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-purple-50 text-purple-600 border-purple-100",
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-red-50 text-red-600 border-red-100",
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
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const firstName = provider?.name?.split(" ")[0]?.trim();
  const heading = firstName ? `${firstName}'s booking schedule` : "Your booking schedule";

  const filteredBookings = useMemo(() => {
    if (activeFilter === "all") {
      return bookingsDataset;
    }
    return bookingsDataset.filter((booking) => booking.status === activeFilter);
  }, [activeFilter]);

  const todaysBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return bookingsDataset.filter((booking) => booking.date === today);
  }, []);

  const totalRevenue = useMemo(
    () =>
      bookingsDataset
        .filter((booking) => booking.status === "completed")
        .reduce((sum, booking) => sum + booking.value, 0),
    []
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Upcoming",
        value: bookingsDataset.filter((b) => b.status === "upcoming").length,
        helper: "Next 7 days",
      },
      {
        label: "In Progress",
        value: bookingsDataset.filter((b) => b.status === "in_progress").length,
        helper: "Currently active",
      },
      {
        label: "Completed this week",
        value: bookingsDataset.filter((b) => b.status === "completed").length,
        helper: currencyFormatter.format(totalRevenue) + " collected",
      },
      {
        label: "Today",
        value: todaysBookings.length,
        helper: todaysBookings.length ? "Prep kit ready" : "No bookings",
      },
    ],
    [todaysBookings.length, totalRevenue]
  );

  const workQueue = useMemo(
    () =>
      bookingsDataset
        .filter((booking) => booking.status === "upcoming" || booking.status === "in_progress")
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4),
    []
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
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/60">
                <tr>
                  {["Booking", "Client", "Service", "Date", "Slot", "Value", "Channel", "Status"].map((heading) => (
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
                      <p className="text-sm font-semibold text-gray-900">{booking.id}</p>
                      <p className="text-xs text-gray-500">{booking.address}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900">{booking.customer}</p>
                      <p className="text-xs text-gray-500">{booking.notes}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(booking.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.slot}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {booking.value ? currencyFormatter.format(booking.value) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{booking.channel}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full ${
                          statusMeta[booking.status].badgeClass
                        }`}
                      >
                        {statusMeta[booking.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Prep queue</h3>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Next four engagements</p>
            </div>
            <ul className="space-y-4">
              {workQueue.map((booking) => (
                <li key={booking.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-gray-100 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(booking.date)} • {booking.slot}
                    </p>
                    <p className="text-sm text-gray-600">
                      {booking.service} for {booking.customer}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 md:text-right">
                    <div className="text-sm text-gray-500">
                      <p className="font-semibold text-gray-900">Kit checklist</p>
                      <p>{booking.notes}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      <p className="font-semibold text-gray-900">Payment</p>
                      <p>{booking.value ? currencyFormatter.format(booking.value) : "Collect on site"}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Smart actions</h3>
              <p className="text-sm text-gray-500">Quick tools to keep bookings healthy and clients reassured.</p>
            </div>
            <div className="space-y-4">
              {[{
                title: "Confirm tomorrow's schedule",
                description: "Send auto-confirmation to clients booked in the next 24 hours.",
                action: "Send confirmations",
              }, {
                title: "Update travel buffer",
                description: "Block transit time between Sector 46 and Punjabi Bagh appointments.",
                action: "Add buffer",
              }, {
                title: "Log additional payment",
                description: "Record the cash tip received for Haldi Minimal Glam.",
                action: "Record now",
              }].map((item) => (
                <div key={item.title} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {item.action}
                  </button>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {loading && (
          <div className="mt-10 p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800">
            Syncing live data… this view will refresh automatically once your session is verified.
          </div>
        )}
      </div>
    </div>
  );
}
