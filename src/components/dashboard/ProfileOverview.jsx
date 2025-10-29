'use client';

import useProviderSession from "@/hooks/useProviderSession";

const verificationSteps = [
  {
    title: "Identity verification",
    detail: "Aadhaar/KYC on file and matched with GST details.",
    status: "Completed",
  },
  {
    title: "Address proof",
    detail: "Upload latest utility bill for studio location.",
    status: "Pending",
  },
  {
    title: "Bank account",
    detail: "IFSC and beneficiary name verified on 03 Jun 2024.",
    status: "Active",
  },
  {
    title: "Portfolio quality",
    detail: "Need five recent before/after uploads for premium badge.",
    status: "Action required",
  },
];

const supportContacts = [
  {
    name: "Account Manager",
    contact: "Sakshi Rao",
    email: "sakshi@yannsupport.com",
    phone: "+91 98102 33445",
  },
  {
    name: "Escalations",
    contact: "Partner Success Desk",
    email: "partners@yannsupport.com",
    phone: "+91 93152 77890",
  },
];

const quickLinks = [
  {
    label: "Update availability calendar",
    href: "/dashboard/services",
  },
  {
    label: "Download latest invoices",
    href: "/dashboard/earnings",
  },
  {
    label: "Edit team access",
    href: "#",
  },
  {
    label: "View rating insights",
    href: "#",
  },
];

export default function ProfileOverview() {
  const { provider, loading } = useProviderSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Partner identity</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            {provider?.name ? `${provider.name}'s profile` : "Your partner profile"}
          </h1>
          <p className="text-gray-600 max-w-3xl">
            Maintain complete, compliant records so payouts stay uninterrupted and clients trust your brand. Update
            credentials, communication preferences, and internal notes right here.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <article className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Primary partner</p>
                <h2 className="text-2xl font-semibold text-gray-900 mt-2">{provider?.name ?? "—"}</h2>
                <p className="text-sm text-gray-500">Registered email • {provider?.email ?? "Not available"}</p>
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
                <dt className="font-semibold text-gray-900">Primary city</dt>
                <dd>Delhi NCR • Update for hyperlocal promos</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Languages you serve in</dt>
                <dd>English, Hindi • Add Punjabi to attract more bookings</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">GST / Business ID</dt>
                <dd>27AAACX1234R1Z7 • Verified on 02 May 2024</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-900">Emergency contact</dt>
                <dd>Rohit Malhotra (+91 98998 44122)</dd>
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
            <h3 className="text-lg font-semibold text-gray-900">Verification checklist</h3>
            <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Refresh status</button>
          </div>
          <ul className="space-y-4">
            {verificationSteps.map((step) => (
              <li key={step.title} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="text-sm text-gray-500">{step.detail}</p>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{step.status}</span>
              </li>
            ))}
          </ul>
          {loading && (
            <div className="mt-5 p-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg">
              Revalidating compliance details with your latest session…
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank & payouts</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p><span className="font-semibold text-gray-900">Bank name:</span> Axis Bank</p>
              <p><span className="font-semibold text-gray-900">Account ending:</span> 8842</p>
              <p><span className="font-semibold text-gray-900">Settlement cadence:</span> Every Tuesday & Friday</p>
              <p><span className="font-semibold text-gray-900">Payout notifications:</span> Email & SMS enabled</p>
            </div>
            <button type="button" className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700">
              Update payout destination
            </button>
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner success contacts</h3>
            <ul className="space-y-4 text-sm text-gray-600">
              {supportContacts.map((contact) => (
                <li key={contact.name} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                  <p>{contact.contact}</p>
                  <p>{contact.email}</p>
                  <p>{contact.phone}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    </div>
  );
}
