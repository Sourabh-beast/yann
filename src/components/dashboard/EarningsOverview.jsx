'use client';

import useProviderSession from "@/hooks/useProviderSession";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const payoutSchedule = [
  {
    id: "PY-5602",
    date: "12 Jun 2024",
    amount: 18400,
    status: "Scheduled",
    method: "IMPS",
  },
  {
    id: "PY-5597",
    date: "08 Jun 2024",
    amount: 22150,
    status: "Paid",
    method: "IMPS",
  },
  {
    id: "PY-5591",
    date: "05 Jun 2024",
    amount: 19800,
    status: "Paid",
    method: "IMPS",
  },
];

const revenueSplit = [
  { service: "Luxury Bridal Makeup", share: 38 },
  { service: "Pre-Wedding Shoot", share: 24 },
  { service: "Cocktail Party Styling", share: 19 },
  { service: "Haldi Minimal Glam", share: 11 },
  { service: "Men's Grooming", share: 8 },
];

const monthlyInsights = [
  {
    title: "Conversion uplift",
    detail: "Replying to enquiries within 30 minutes drove a 14% increase in confirmed bookings this fortnight.",
  },
  {
    title: "Repeat clients",
    detail: "26% of this month's revenue is from returning customers – send them loyalty codes before July.",
  },
  {
    title: "Average add-on",
    detail: "Premium product upgrades added an extra ₹1,250 per booking on the top 5 services.",
  },
];

const expenseBreakup = [
  { label: "Product restock", value: 6200 },
  { label: "Travel and logistics", value: 3150 },
  { label: "Assistant fees", value: 4800 },
];

export default function EarningsOverview() {
  const { provider } = useProviderSession({ autoRedirect: true });
  const monthlyRevenue = 48650;
  const pendingClearances = 8200;
  const averageTicket = 4050;
  const firstName = provider?.name?.split(" ")[0];
  const heading = firstName ? `${firstName}'s payout summary` : "Your payout summary";

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
          {[{
            label: "This month",
            value: currencyFormatter.format(monthlyRevenue),
            helper: "Across 12 fulfilled bookings",
          }, {
            label: "Next payout",
            value: currencyFormatter.format(payoutSchedule[0].amount),
            helper: `Scheduled on ${payoutSchedule[0].date}`,
          }, {
            label: "Pending clearance",
            value: currencyFormatter.format(pendingClearances),
            helper: "Awaiting T+3 settlement",
          }, {
            label: "Avg. booking value",
            value: currencyFormatter.format(averageTicket),
            helper: "Incl. add-ons and taxes",
          }].map((card) => (
            <article key={card.label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest">{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <article className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming payouts</h2>
              <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">View settlement report</button>
            </div>
            <div className="space-y-4">
              {payoutSchedule.map((payout) => (
                <div key={payout.id} className="border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{payout.id}</p>
                    <p className="text-sm text-gray-500">{payout.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">{currencyFormatter.format(payout.amount)}</span>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{payout.status}</span>
                    <span className="text-xs text-gray-400">{payout.method}</span>
                  </div>
                  <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Download advice</button>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue by service</h2>
            <ul className="space-y-4">
              {revenueSplit.map((item) => (
                <li key={item.service}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900">{item.service}</p>
                    <span className="text-sm text-gray-500">{item.share}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
                      style={{ width: `${item.share}%` }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly narrative</h2>
            <div className="space-y-4">
              {monthlyInsights.map((insight) => (
                <div key={insight.title} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{insight.detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost tracker</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              {expenseBreakup.map((expense) => (
                <li key={expense.label} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3">
                  <span className="font-semibold text-gray-900">{expense.label}</span>
                  <span>{currencyFormatter.format(expense.value)}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              Log expenses weekly to keep profit margins accurate before tax submissions.
            </p>
          </article>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Compliance & taxes</h2>
              <p className="text-sm text-gray-600">
                Yann generates GST-ready invoices automatically. Download consolidated reports at month-end to simplify filings.
              </p>
            </div>
            <div className="md:col-span-2 grid gap-3">
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">GST Summary</p>
                <p className="text-sm text-gray-500">Output tax collected this month: {currencyFormatter.format(Math.round(monthlyRevenue * 0.18))}</p>
              </div>
              <div className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">Downloads</p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Invoices (.zip)</button>
                  <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">TDS summary</button>
                  <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Expense ledger</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
