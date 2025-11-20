'use client';

import useProviderSession from "@/hooks/useProviderSession";

export default function ServicesManager() {
  const { provider, loading } = useProviderSession();
  const activeServices = provider?.services?.length ? provider.services : [];
  const firstName = provider?.name?.split(" ")[0];
  const heading = firstName ? `${firstName}'s offerings` : "Your service catalogue";
  const ratingValue = typeof provider?.rating === "number" ? provider.rating.toFixed(1) : "0.0";
  const reviewsTotal = typeof provider?.totalReviews === "number" ? provider.totalReviews : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Services command centre</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{heading}</h1>
          <p className="text-gray-600 max-w-3xl">
            Review every package you provide, refine pricing, and keep availability aligned with demand. Update your
            listings in one place and watch them sync across the Yann marketplace.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[{
            label: "Active services",
            value: activeServices.length,
            helper: "Published services",
          }, {
            label: "Average rating",
            value: ratingValue,
            helper: reviewsTotal > 0 ? `${reviewsTotal} reviews` : "No reviews yet",
          }, {
            label: "Account Status",
            value: provider?.status || "Pending",
            helper: "Current status",
          }, {
            label: "Experience",
            value: provider?.experience ? `${provider.experience}Y` : "0Y",
            helper: "Years of experience",
          }].map((card) => (
            <article key={card.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1 capitalize">{card.value}</p>
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-widest">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-10">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your active services</h2>
              <p className="text-sm text-gray-500">Services you registered to provide</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {activeServices.length === 0 && (
              <div className="md:col-span-3 p-12 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500">
                <p className="font-semibold text-lg mb-2">No services added yet</p>
                <p>Register services to start receiving booking requests</p>
              </div>
            )}

            {activeServices.map((serviceName) => (
              <article key={serviceName} className="border border-gray-100 rounded-2xl p-6 shadow-sm bg-gradient-to-br from-white to-purple-50 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{serviceName}</h3>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Active</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Professional service offering</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Available for booking</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Working Hours</h3>
            </div>
            {provider?.workingHours ? (
              <div className="border border-gray-100 rounded-xl p-6 bg-gradient-to-br from-emerald-50 to-green-50">
                <p className="text-sm text-gray-600 mb-2">Daily Schedule</p>
                <p className="text-3xl font-bold text-gray-900">
                  {provider.workingHours.startTime} - {provider.workingHours.endTime}
                </p>
                <p className="text-sm text-gray-500 mt-2">Your availability window</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No working hours set</p>
              </div>
            )}
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Categories</h3>
            </div>
            {provider?.selectedCategories && provider.selectedCategories.length > 0 ? (
              <div className="space-y-2">
                {provider.selectedCategories.map((category) => (
                  <div key={category} className="border border-purple-100 rounded-xl px-4 py-3 bg-purple-50">
                    <p className="text-sm font-semibold text-purple-900">{category}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No categories selected</p>
              </div>
            )}
          </article>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Provider Information</h3>
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-gray-900">Email:</span> {provider?.email}</p>
                <p><span className="font-semibold text-gray-900">Phone:</span> {provider?.phone}</p>
                <p><span className="font-semibold text-gray-900">Experience:</span> {provider?.experience || 0} years</p>
                <p><span className="font-semibold text-gray-900">Status:</span> <span className="capitalize">{provider?.status || 'pending'}</span></p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Links</h3>
              <div className="space-y-2">
                <a href="/dashboard/bookings" className="block text-sm text-blue-600 hover:underline">View Bookings</a>
                <a href="/dashboard/earnings" className="text-sm text-blue-600 hover:underline block">Check Earnings</a>
                <a href="/provider-dashboard" className="text-sm text-blue-600 hover:underline block">Provider Dashboard</a>
                <a href="/dashboard/profile" className="text-sm text-blue-600 hover:underline block">Edit Profile</a>
              </div>
            </div>
          </div>
          {loading && (
            <div className="mt-6 p-3 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading your service data...</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
