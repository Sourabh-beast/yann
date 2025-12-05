import Footer from '@/components/Footer';

export const metadata = {
  title: "Refund & Cancellation Policy | YANN - Home Services Platform",
  description: "YANN's refund and cancellation policy. Learn about our cancellation windows, refund timelines, and dispute resolution process.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wide">
                Legal Document
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Refund & Cancellation Policy</h1>
            <p className="text-gray-500 text-sm">Last Updated: December 5, 2025 | Effective Date: December 5, 2025</p>
          </header>

          {/* Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="prose prose-gray max-w-none">

              {/* Introduction */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  At YANN, we strive to provide you with the best home services experience. We understand that plans can change, and we have designed our refund and cancellation policy to be fair to both our Customers and Service Partners.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  This policy applies to all services booked through the YANN platform, including but not limited to cleaning, cooking, driver, security, gardening, plumbing, electrical, and religious (Pujari) services.
                </p>
              </section>

              {/* Quick Summary */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Quick Summary</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Cancellation Time</th>
                        <th className="border border-gray-200 px-4 py-3 text-left font-semibold">Refund Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-green-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-green-800">24+ hours before service</td>
                        <td className="border border-gray-200 px-4 py-3 text-green-700 font-bold">100% Refund</td>
                      </tr>
                      <tr className="bg-yellow-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-yellow-800">12-24 hours before service</td>
                        <td className="border border-gray-200 px-4 py-3 text-yellow-700 font-bold">50% Refund</td>
                      </tr>
                      <tr className="bg-orange-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-orange-800">6-12 hours before service</td>
                        <td className="border border-gray-200 px-4 py-3 text-orange-700 font-bold">25% Refund</td>
                      </tr>
                      <tr className="bg-red-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-red-800">Less than 6 hours</td>
                        <td className="border border-gray-200 px-4 py-3 text-red-700 font-bold">No Refund</td>
                      </tr>
                      <tr className="bg-red-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-red-800">After service has started</td>
                        <td className="border border-gray-200 px-4 py-3 text-red-700 font-bold">No Refund</td>
                      </tr>
                      <tr className="bg-blue-50">
                        <td className="border border-gray-200 px-4 py-3 font-medium text-blue-800">Service Partner cancels</td>
                        <td className="border border-gray-200 px-4 py-3 text-blue-700 font-bold">100% Refund + ₹100 Credit</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Customer Cancellation */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Customer Cancellation Policy</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 How to Cancel</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You can cancel your booking through:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>YANN mobile app → My Bookings → Cancel</li>
                  <li>YANN website → Dashboard → Bookings → Cancel</li>
                  <li>Contacting customer support via phone or email</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Cancellation Windows</h3>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                    <h4 className="font-bold text-green-900 mb-2">✓ Full Refund (100%)</h4>
                    <p className="text-green-800 text-sm">
                      Cancel <strong>24 hours or more</strong> before the scheduled service time. You will receive a complete refund to your original payment method.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <h4 className="font-bold text-yellow-900 mb-2">⚡ Partial Refund (50%)</h4>
                    <p className="text-yellow-800 text-sm">
                      Cancel <strong>12-24 hours</strong> before the scheduled service time. 50% will be refunded, and 50% will be retained as a cancellation fee.
                    </p>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                    <h4 className="font-bold text-orange-900 mb-2">⏰ Late Cancellation (25%)</h4>
                    <p className="text-orange-800 text-sm">
                      Cancel <strong>6-12 hours</strong> before the scheduled service time. Only 25% will be refunded.
                    </p>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <h4 className="font-bold text-red-900 mb-2">✗ No Refund</h4>
                    <p className="text-red-800 text-sm">
                      Cancellations made <strong>less than 6 hours</strong> before service or <strong>after service has begun</strong> are not eligible for refunds.
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 Rescheduling</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Instead of canceling, you may reschedule your booking:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li><strong>Free rescheduling:</strong> 12+ hours before service (subject to Partner availability)</li>
                  <li><strong>One free reschedule per booking</strong> is allowed</li>
                  <li>Additional reschedules may incur a ₹50 fee</li>
                </ul>
              </section>

              {/* Service Partner Cancellation */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Service Partner Cancellation</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 When Partner Cancels</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If a Service Partner cancels your confirmed booking:
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <ul className="space-y-2 text-blue-800">
                    <li>✓ <strong>100% refund</strong> to your original payment method</li>
                    <li>✓ <strong>₹100 YANN credit</strong> for your next booking</li>
                    <li>✓ <strong>Priority rebooking</strong> with another available Partner</li>
                    <li>✓ Option to choose a replacement Partner at the same rate</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Partner No-Show</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If a Service Partner does not arrive within 30 minutes of the scheduled time without prior notice:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>You will receive a <strong>full refund (100%)</strong></li>
                  <li>Additional <strong>₹200 YANN credit</strong> as compensation</li>
                  <li>The Partner will be penalized on our platform</li>
                </ul>
              </section>

              {/* Customer No-Show */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Customer No-Show Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If the Service Partner arrives at the scheduled time and location but you are unavailable:
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <ul className="space-y-2 text-amber-800">
                    <li>• Partner will wait for <strong>15 minutes</strong></li>
                    <li>• If unreachable, booking will be marked as <strong>"Customer No-Show"</strong></li>
                    <li>• <strong>No refund</strong> will be provided</li>
                    <li>• Repeated no-shows may result in account restrictions</li>
                  </ul>
                </div>
              </section>

              {/* Service-Specific Policies */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Service-Specific Policies</h2>
                
                <div className="space-y-6">
                  {/* Pujari Services */}
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-orange-900 mb-3">🙏 Pujari (Religious) Services</h3>
                    <ul className="text-orange-800 text-sm space-y-2">
                      <li>• Payment is typically collected <strong>after the pooja/service completion</strong></li>
                      <li>• For advance bookings with deposits, standard cancellation policy applies</li>
                      <li>• <strong>No cancellation charges</strong> for religious holidays/muhurat changes</li>
                      <li>• Materials/samagri purchased are non-refundable</li>
                    </ul>
                  </div>

                  {/* Driver Services */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-blue-900 mb-3">🚗 Personal Driver Services</h3>
                    <ul className="text-blue-800 text-sm space-y-2">
                      <li>• <strong>Hourly bookings:</strong> Pro-rated refund for unused hours if cancelled mid-service</li>
                      <li>• <strong>Full-day bookings:</strong> Standard cancellation policy applies</li>
                      <li>• <strong>Multi-day bookings:</strong> Cancel individual days 24 hours in advance for full refund</li>
                      <li>• <strong>Overtime charges</strong> are non-refundable once incurred</li>
                    </ul>
                  </div>

                  {/* Monthly Services */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-green-900 mb-3">📅 Monthly/Subscription Services</h3>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li>• Cancel anytime before the next billing cycle</li>
                      <li>• <strong>Pro-rated refund</strong> for unused days in current cycle (if cancelled within first 7 days)</li>
                      <li>• After 7 days, no refund for current cycle but service continues until cycle end</li>
                      <li>• No cancellation fees for monthly subscriptions</li>
                    </ul>
                  </div>

                  {/* Emergency Services */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                    <h3 className="text-lg font-bold text-red-900 mb-3">⚡ Emergency/Express Services</h3>
                    <ul className="text-red-800 text-sm space-y-2">
                      <li>• Emergency bookings may have <strong>shorter cancellation windows</strong></li>
                      <li>• Express fee is <strong>non-refundable</strong> once Partner is dispatched</li>
                      <li>• Standard service charge is refundable as per policy</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Unsatisfactory Service */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Service Quality Issues</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.1 Reporting Issues</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are unsatisfied with the service quality, you must report the issue within:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>24 hours</strong> of service completion for cleaning/household services</li>
                  <li><strong>Immediately</strong> for safety or conduct issues</li>
                  <li><strong>7 days</strong> for damages discovered later</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.2 Resolution Options</h3>
                <p className="text-gray-700 leading-relaxed mb-3">Based on investigation, we may offer:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🔄 Free Re-Service</h4>
                    <p className="text-gray-700 text-sm">Same or different Partner to redo the service at no cost.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💰 Partial Refund</h4>
                    <p className="text-gray-700 text-sm">Refund proportional to the unsatisfactory portion of service.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💵 Full Refund</h4>
                    <p className="text-gray-700 text-sm">Complete refund for significantly poor service quality.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🎁 YANN Credits</h4>
                    <p className="text-gray-700 text-sm">Credit for future bookings as goodwill gesture.</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.3 Investigation Process</h3>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                  <li>Submit complaint with photos/evidence (if applicable)</li>
                  <li>Our team will contact you within 24 hours</li>
                  <li>We will investigate with the Service Partner</li>
                  <li>Resolution provided within 3-5 business days</li>
                </ol>
              </section>

              {/* Property Damage */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Property Damage Claims</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.1 Reporting Damage</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If property damage occurs during service:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Report immediately (within 24 hours)</li>
                  <li>Document with photographs and videos</li>
                  <li>Preserve damaged items if possible</li>
                  <li>Do not dispose of damaged items before inspection</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.2 Claim Process</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  YANN will facilitate the resolution between you and the Service Partner. Depending on the nature and extent of damage:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Minor damages: Direct resolution with Partner</li>
                  <li>Significant damages: Investigation and mediation by YANN</li>
                  <li>Claims may be covered under Partner's insurance (where applicable)</li>
                  <li>YANN may provide compensation up to ₹10,000 for verified claims</li>
                </ul>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-red-900 mb-2">⚠️ Exclusions</h4>
                  <p className="text-red-800 text-sm">
                    Claims will not be entertained for: pre-existing damage, normal wear and tear, damage caused by customer's pets/children, items not disclosed to the Partner, or damage reported after 7 days.
                  </p>
                </div>
              </section>

              {/* Refund Processing */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Refund Processing</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.1 Refund Methods</h3>
                <p className="text-gray-700 leading-relaxed mb-3">Refunds will be processed to the original payment method:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>UPI:</strong> Instant to 24 hours</li>
                  <li><strong>Credit/Debit Card:</strong> 5-7 business days</li>
                  <li><strong>Net Banking:</strong> 5-10 business days</li>
                  <li><strong>YANN Wallet:</strong> Instant</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.2 Refund Initiation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Refunds are initiated within <strong>24-48 hours</strong> of cancellation/approval. Please note that bank processing times vary and are beyond YANN's control.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.3 Partial Refunds</h3>
                <p className="text-gray-700 leading-relaxed">
                  Partial refunds will be calculated based on the applicable cancellation fee percentage. Platform fees and payment gateway charges may be non-refundable for certain cancellations.
                </p>
              </section>

              {/* Non-Refundable Items */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Non-Refundable Items</h2>
                
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-5">
                  <p className="text-gray-800 mb-3">The following are <strong>NOT eligible for refunds</strong>:</p>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Services completed satisfactorily</li>
                    <li>Promotional credits and discounts</li>
                    <li>Expired vouchers or promotional offers</li>
                    <li>Cancellations due to customer's false address/information</li>
                    <li>Cancellations due to customer's unavailability</li>
                    <li>Materials/products purchased through the Platform</li>
                    <li>Services where customer caused delay leading to overtime</li>
                    <li>Bookings cancelled due to violation of Terms of Service</li>
                  </ul>
                </div>
              </section>

              {/* Disputes */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Dispute Resolution</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">11.1 Escalation Process</h3>
                <p className="text-gray-700 leading-relaxed mb-3">If you disagree with a refund decision:</p>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Level 1:</strong> Contact Customer Support (response within 24 hours)</li>
                  <li><strong>Level 2:</strong> Request escalation to a Supervisor (response within 48 hours)</li>
                  <li><strong>Level 3:</strong> Email our Grievance Officer at <a href="mailto:grievance@yann.in" className="text-blue-600 hover:underline">grievance@yann.in</a> (response within 7 days)</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">11.2 Required Information</h3>
                <p className="text-gray-700 leading-relaxed mb-3">When filing a dispute, please provide:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Booking ID / Order number</li>
                  <li>Date and time of service</li>
                  <li>Detailed description of the issue</li>
                  <li>Supporting evidence (photos, videos, messages)</li>
                  <li>Preferred resolution</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">12. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For refund requests or questions about this policy:
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4">YANN Customer Support</h4>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Email:</strong> support@yann.in</p>
                    <p><strong>Refund Queries:</strong> refunds@yann.in</p>
                    <p><strong>Phone:</strong> +91-XXXXXXXXXX (9 AM - 9 PM IST)</p>
                    <p><strong>WhatsApp:</strong> +91-XXXXXXXXXX</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-green-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-green-800 text-sm">
                    For faster resolution, always include your Booking ID when contacting support. You can find it in your booking confirmation email or the "My Bookings" section of the app.
                  </p>
                </div>
              </section>

              {/* Policy Changes */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">13. Policy Updates</h2>
                <p className="text-gray-700 leading-relaxed">
                  YANN reserves the right to modify this Refund & Cancellation Policy at any time. Changes will be posted on this page with an updated "Last Updated" date. Your continued use of our services after changes constitutes acceptance of the revised policy. For material changes, we will notify you via email or Platform notification.
                </p>
              </section>

            </div>
          </article>

          {/* Quick Navigation */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="/terms" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Terms of Service →
            </a>
            <a href="/privacy" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Privacy Policy →
            </a>
            <a href="/support" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Contact Support →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
