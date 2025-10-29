const contacts = [
  {
    title: "Priority phone line",
    detail: "+91 80106 55660",
    hours: "Daily 08:00 – 22:00",
    description: "Speak with a partner success specialist for urgent booking or payout queries.",
  },
  {
    title: "Dedicated email desk",
    detail: "partners@yannsupport.com",
    hours: "Replies within 4 business hours",
    description: "Share documents, payout proofs, or feedback and receive tracked email responses.",
  },
  {
    title: "Live chat",
    detail: "Chat via dashboard footer",
    hours: "Weekdays 10:00 – 19:00",
    description: "Instant answers for availability changes, OTP issues, or customer escalations.",
  },
];

const faqItems = [
  {
    question: "How do I reschedule a confirmed booking?",
    answer:
      "Open the booking card in your dashboard, choose 'Suggest new time', and select alternate slots. The customer receives an SMS/WhatsApp prompt to approve. If they do not respond within 2 hours, call the priority line and we will assist.",
  },
  {
    question: "When will I receive my payout?",
    answer:
      "Payouts are processed every Tuesday and Friday. Bookings completed before 23:59 IST on the previous day are included. Track upcoming transfers from Earnings → Upcoming payouts.",
  },
  {
    question: "A customer marked me as no-show. What should I do?",
    answer:
      "Raise a ticket within 12 hours from the Bookings page. Attach proof of arrival (call log, GPS screenshot). Our dispute team reviews within one business day.",
  },
];

const resourceArticles = [
  {
    title: "Optimise your response time",
    summary: "Best practices to reply to enquiries under 30 minutes and improve conversion by 20%.",
    url: "#",
  },
  {
    title: "GST and invoicing guide",
    summary: "Learn how Yann auto-generates GST-ready invoices and how to download bulk statements.",
    url: "#",
  },
  {
    title: "Partner etiquette for on-site gigs",
    summary: "Checklists and templates for confirming addresses, setup requirements, and settlement modes.",
    url: "#",
  },
];

const ticketSteps = [
  "Navigate to Support → Raise a ticket",
  "Select category (Booking, Payout, Technical, Feedback)",
  "Add booking ID or payout ID for faster resolution",
  "Attach supporting screenshots or documents",
  "Choose your preferred contact channel and submit",
];

export const metadata = {
  title: "Yann Partner Support",
  description: "Find answers, raise tickets, and contact the Yann support crew.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">We are here for partners</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Support &amp; Help Center</h1>
          <p className="text-gray-600 max-w-3xl">
            Connect with the Yann crew, browse detailed guides, and raise tickets that stay on a tracked SLA. Bookmark
            this workspace whenever you need a quick resolution.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3 mb-10">
          {contacts.map((contact) => (
            <article key={contact.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900">{contact.title}</h2>
              <p className="text-sm font-semibold text-blue-600 mt-2">{contact.detail}</p>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mt-1">{contact.hours}</p>
              <p className="text-sm text-gray-600 mt-3">{contact.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2 mb-10">
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Ticket desk</h2>
              <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">Open ticket</a>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              {ticketSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <div className="mt-4 text-xs text-gray-500">
              Expected resolution: <span className="font-semibold text-gray-700">Priority 2 hours · Standard 24 hours</span>
            </div>
          </article>

          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top FAQs</h2>
            <div className="space-y-4">
              {faqItems.map((faq) => (
                <div key={faq.question} className="border border-gray-100 rounded-xl p-4">
                  <p className="text-sm font-semibold text-gray-900">{faq.question}</p>
                  <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Knowledge base picks</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {resourceArticles.map((article) => (
              <article key={article.title} className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900">{article.title}</p>
                <p className="text-sm text-gray-600 mt-2">{article.summary}</p>
                <a href={article.url} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
                  Read guide
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <article>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Operational updates</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li>• OTP delivery improvements rolled out for Gmail users – no more spam folder issues.</li>
                <li>• Delhi NCR partners get surge incentives for weekday morning slots (June pilot).</li>
                <li>• New payout dashboard sync ensures bank transfers are visible within 10 minutes.</li>
              </ul>
            </article>
            <article>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Community hours</h2>
              <p className="text-sm text-gray-600">
                Join our weekly Zoom huddle every Friday at 19:30 IST, where senior artists share tips and we answer open
                partner questions live. Registration link is emailed every Thursday morning.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
