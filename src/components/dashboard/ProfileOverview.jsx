'use client';

import Image from 'next/image';
import useProviderSession from "@/hooks/useProviderSession";

const quickLinks = [
  {
    label: "Manage your services",
    href: "/dashboard/services",
  },
  {
    label: "View earnings",
    href: "/dashboard/earnings",
  },
  {
    label: "Check bookings",
    href: "/dashboard/bookings",
  },
  {
    label: "Provider dashboard",
    href: "/provider-dashboard",
  },
];

export default function ProfileOverview() {
  const { provider, loading } = useProviderSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Partner identity</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                {provider?.name ? `${provider.name}'s profile` : "Your partner profile"}
              </h1>
              <p className="text-gray-600 max-w-3xl">
                Maintain complete, compliant records so payouts stay uninterrupted and clients trust your brand. Update
                credentials, communication preferences, and internal notes right here.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 shadow-sm">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-white shadow">
                {provider?.profileImage ? (
                  <Image
                    src={provider.profileImage}
                    alt={`${provider.name}'s profile`}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-xl font-bold text-white">
                    {provider?.name?.charAt(0)?.toUpperCase() ?? "Y"}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Profile picture</p>
                <p>Update photo from the navbar menu to strengthen trust with clients.</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <article className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-blue-100 shadow">
                  {provider?.profileImage ? (
                    <Image
                      src={provider.profileImage}
                      alt={`${provider.name}'s profile`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-2xl font-bold text-white">
                      {provider?.name?.charAt(0)?.toUpperCase() ?? "Y"}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Primary partner</p>
                  <h2 className="text-2xl font-semibold text-gray-900 mt-2">{provider?.name ?? "—"}</h2>
                  <p className="text-sm text-gray-500">Registered email • {provider?.email ?? "Not available"}</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Account status</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-semibold text-emerald-600 uppercase tracking-widest">
                  {provider?.status ?? "Pending"}
                </span>
                <span>Experience: {provider?.experience ? `${provider.experience} years` : "Update experience"}</span>
                <span>Services live: {provider?.services?.length ?? 0}</span>
              </div>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 text-sm text-gray-600">
              <div>
                <dt className="font-semibold text-gray-900">Phone Number</dt>
                <dd>{provider?.phone || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Experience</dt>
                <dd>{provider?.experience ? `${provider.experience} years` : 'Not specified'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Total Services</dt>
                <dd>{provider?.services?.length || 0} active services</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Working Hours</dt>
                <dd>{provider?.workingHours ? `${provider.workingHours.startTime} - ${provider.workingHours.endTime}` : 'Not set'}</dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full shadow hover:bg-blue-700">
                Edit profile information
              </button>
              <button type="button" className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-full hover:border-blue-300 hover:text-blue-700">
                Update communication preferences
              </button>
            </div>
          </article>

          <aside className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick links</h3>
            <ul className="space-y-3 text-sm text-blue-600">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Services</h3>
          </div>
          {provider?.services && provider.services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {provider.services.map((service) => (
                <div key={service} className="border border-gray-100 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                  <p className="text-sm font-semibold text-gray-900 capitalize">{service}</p>
                  <p className="text-xs text-gray-500 mt-1">Active service</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No services added yet</p>
              <p className="text-sm mt-1">Add services to start receiving bookings</p>
            </div>
          )}
          {loading && (
            <div className="mt-5 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg">
              Loading your profile data…
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-900">Account Status:</span> {provider?.status || 'Pending'}</p>
              <p><span className="font-semibold text-gray-900">Rating:</span> {provider?.rating || 0} / 5</p>
              <p><span className="font-semibold text-gray-900">Total Reviews:</span> {provider?.totalReviews || 0}</p>
              <p><span className="font-semibold text-gray-900">Member Since:</span> {provider?.createdAt ? new Date(provider.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
            <div className="space-y-3">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Need Help?</p>
                <p className="text-sm text-gray-600 mt-1">Contact support for any assistance</p>
                <p className="text-sm text-blue-600 mt-2">support@yann.com</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Quick Actions</p>
                <div className="flex flex-col gap-2 mt-2">
                  <a href="/dashboard/bookings" className="text-sm text-blue-600 hover:underline">View Bookings</a>
                  <a href="/dashboard/earnings" className="text-sm text-blue-600 hover:underline">Check Earnings</a>
                  <a href="/provider-dashboard" className="text-sm text-blue-600 hover:underline">Provider Dashboard</a>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
