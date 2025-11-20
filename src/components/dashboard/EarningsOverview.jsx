'use client';

import { useState, useEffect } from "react";
import useProviderSession from "@/hooks/useProviderSession";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function EarningsOverview() {
  const { provider, loading } = useProviderSession({ autoRedirect: true });
  const [earningsData, setEarningsData] = useState(null);
  const [fetchingEarnings, setFetchingEarnings] = useState(true);
  
  const firstName = provider?.name?.split(" ")[0];
  const heading = firstName ? `${firstName}'s payout summary` : "Your payout summary";

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setFetchingEarnings(true);
      const providerEmail = localStorage.getItem('providerEmail');
      
      if (!providerEmail) {
        console.error('No provider email found');
        return;
      }

      const response = await fetch(`/api/provider/requests?email=${providerEmail}`);
      const data = await response.json();

      if (data.success) {
        setEarningsData(data.stats);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setFetchingEarnings(false);
    }
  };

  const monthlyRevenue = earningsData?.monthlyEarnings || 0;
  const totalRevenue = earningsData?.totalEarnings || 0;
  const completedCount = earningsData?.completedBookings || 0;
  const averageTicket = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Earnings dashboard</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{heading}</h1>
          <p className="text-gray-600 max-w-3xl">
            Stay on top of every rupee earned, understand which services drive revenue, and keep payouts aligned with
            your cash flow needs.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {fetchingEarnings ? (
            <div className="lg:col-span-4 flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            [{
              label: "This month",
              value: currencyFormatter.format(monthlyRevenue),
              helper: completedCount > 0 ? `From ${completedCount} completed bookings` : "No completed bookings yet",
            }, {
              label: "Total earnings",
              value: currencyFormatter.format(totalRevenue),
              helper: `Lifetime revenue`,
            }, {
              label: "Pending",
              value: earningsData?.pendingRequests || 0,
              helper: "Awaiting your response",
            }, {
              label: "Avg. booking value",
              value: currencyFormatter.format(averageTicket),
              helper: averageTicket > 0 ? "Per completed booking" : "Complete bookings to see average",
            }].map((card) => (
              <article key={card.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">{card.helper}</p>
              </article>
            ))
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <article className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Earnings Summary</h2>
            </div>
            <div className="space-y-6">
              <div className="border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-green-50">
                <p className="text-sm font-medium text-gray-600 mb-2">Total Revenue (All Time)</p>
                <p className="text-4xl font-bold text-emerald-600 mb-3">{currencyFormatter.format(totalRevenue)}</p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Completed Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{completedCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{currencyFormatter.format(monthlyRevenue)}</p>
                  </div>
                </div>
              </div>

              {totalRevenue === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="font-medium">No earnings yet</p>
                  <p className="text-sm mt-1">Complete bookings to start earning</p>
                </div>
              )}
            </div>
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Stats</h2>
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-500">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{earningsData?.pendingRequests || 0}</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-500">Accepted Bookings</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{earningsData?.acceptedBookings || 0}</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Information</h2>
              <p className="text-sm text-gray-600">
                Payments are collected from customers at the time of service. Track your earnings here.
              </p>
            </div>
            <div className="md:col-span-2 grid gap-3">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Average Booking Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{currencyFormatter.format(averageTicket)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {completedCount > 0 ? `Based on ${completedCount} completed bookings` : 'Complete your first booking'}
                </p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Growth Metrics</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-xs text-gray-500">Response Rate</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {earningsData ? 
                        Math.round(((earningsData.acceptedBookings + earningsData.completedBookings) / 
                        (earningsData.pendingRequests + earningsData.acceptedBookings + earningsData.completedBookings || 1)) * 100) 
                        : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Completion Rate</p>
                    <p className="text-lg font-bold text-blue-600">
                      {earningsData?.acceptedBookings > 0 ? 
                        Math.round((completedCount / earningsData.acceptedBookings) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(loading || fetchingEarnings) && (
          <div className="mt-10 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading your earnings data...</span>
          </div>
        )}
      </div>
    </div>
  );
}
