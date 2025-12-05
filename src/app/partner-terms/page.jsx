import Footer from '@/components/Footer';

export const metadata = {
  title: "Service Partner Agreement | YANN - Home Services Platform",
  description: "Terms and conditions for Service Partners on YANN. This agreement governs the relationship between YANN and its service providers.",
};

export default function PartnerTermsPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                Partner Legal Agreement
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Service Partner Agreement</h1>
            <p className="text-gray-500 text-sm">Last Updated: December 5, 2025 | Effective Date: December 5, 2025</p>
          </header>

          {/* Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="prose prose-gray max-w-none">

              {/* Important Notice */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-5 mb-8">
                <h3 className="text-green-900 font-bold text-lg mb-2">🤝 SERVICE PARTNER AGREEMENT</h3>
                <p className="text-green-800 text-sm leading-relaxed">
                  THIS AGREEMENT IS A LEGALLY BINDING CONTRACT BETWEEN YOU ("SERVICE PARTNER," "PARTNER," OR "YOU") AND YANN TECHNOLOGIES PRIVATE LIMITED ("YANN," "COMPANY," "WE," OR "US"). BY REGISTERING AS A SERVICE PARTNER ON THE YANN PLATFORM, YOU AGREE TO BE BOUND BY THESE TERMS.
                </p>
              </div>

              {/* 1. Definitions */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Definitions</h2>
                <div className="space-y-3">
                  <p className="text-gray-700"><strong>"Platform"</strong> means the YANN website, mobile application, and all related services.</p>
                  <p className="text-gray-700"><strong>"Services"</strong> means the home services you provide to Customers through the Platform.</p>
                  <p className="text-gray-700"><strong>"Customer"</strong> means any individual or entity booking services through the Platform.</p>
                  <p className="text-gray-700"><strong>"Booking"</strong> means a confirmed service request from a Customer.</p>
                  <p className="text-gray-700"><strong>"Service Fee"</strong> means the amount paid by Customers for your Services.</p>
                  <p className="text-gray-700"><strong>"Commission"</strong> means the percentage retained by YANN from each Booking.</p>
                </div>
              </section>

              {/* 2. Partner Registration */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Partner Registration & Onboarding</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Eligibility Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-3">To become a YANN Service Partner, you must:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Be at least 18 years of age</li>
                  <li>Be legally authorized to work in India</li>
                  <li>Possess valid identity documents (Aadhaar, PAN Card)</li>
                  <li>Have relevant skills and experience for your service category</li>
                  <li>Pass our verification and background check process</li>
                  <li>Own necessary equipment/tools for service delivery</li>
                  <li>Have a working smartphone with internet connectivity</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Required Documents</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Identity Documents:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Aadhaar Card (mandatory)</li>
                        <li>• PAN Card</li>
                        <li>• Passport-size photograph</li>
                        <li>• Address proof</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Professional Documents:</h4>
                      <ul className="text-gray-700 text-sm space-y-1">
                        <li>• Skill certificates (if applicable)</li>
                        <li>• Previous work experience proof</li>
                        <li>• Relevant licenses (driver, electrician, etc.)</li>
                        <li>• Police verification certificate</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Verification Process</h3>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2">
                  <li>Submit registration form with required documents</li>
                  <li>Document verification by YANN team (2-5 business days)</li>
                  <li>Background verification through third-party agencies</li>
                  <li>Skills assessment/interview (for certain categories)</li>
                  <li>Training on YANN platform and policies</li>
                  <li>Account activation upon successful verification</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.4 Account Approval</h3>
                <p className="text-gray-700 leading-relaxed">
                  YANN reserves the right to approve or reject any Partner registration at its sole discretion. We may request additional information or documents before approval. Approval may take 7-14 business days depending on verification requirements.
                </p>
              </section>

              {/* 3. Relationship */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Nature of Relationship</h2>
                
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-4">
                  <h3 className="text-lg font-bold text-amber-900 mb-2">⚠️ INDEPENDENT CONTRACTOR STATUS</h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    YOU ARE AN INDEPENDENT CONTRACTOR, NOT AN EMPLOYEE, AGENT, JOINT VENTURER, OR PARTNER OF YANN. YANN DOES NOT SUPERVISE, DIRECT, OR CONTROL YOUR WORK. THIS AGREEMENT DOES NOT CREATE AN EMPLOYMENT RELATIONSHIP.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Your Responsibilities as Independent Contractor</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>You are responsible for your own taxes, including GST and income tax</li>
                  <li>YANN does not withhold taxes from your earnings</li>
                  <li>You are not entitled to employee benefits (PF, ESI, insurance, etc.)</li>
                  <li>You are free to work for other platforms or independently</li>
                  <li>You set your own working hours and availability</li>
                  <li>You provide your own equipment and tools</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 No Exclusivity</h3>
                <p className="text-gray-700 leading-relaxed">
                  This Agreement is non-exclusive. You are free to provide services through other platforms or directly to clients, provided it does not interfere with confirmed YANN bookings.
                </p>
              </section>

              {/* 4. Partner Obligations */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Partner Obligations</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 Service Standards</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You agree to:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Professionalism</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Arrive on time for all bookings</li>
                      <li>• Dress appropriately and maintain hygiene</li>
                      <li>• Communicate professionally with Customers</li>
                      <li>• Complete services as described</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Quality</h4>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Deliver high-quality services</li>
                      <li>• Use proper techniques and equipment</li>
                      <li>• Address Customer concerns promptly</li>
                      <li>• Maintain quality standards</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Booking Commitments</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Accept/Decline promptly:</strong> Respond to booking requests within 15 minutes</li>
                  <li><strong>Honor confirmed bookings:</strong> Do not cancel accepted bookings except for emergencies</li>
                  <li><strong>Maintain availability:</strong> Keep your calendar updated accurately</li>
                  <li><strong>Communicate delays:</strong> Inform Customer and YANN support if running late</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 Safety & Compliance</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Follow all applicable safety regulations and best practices</li>
                  <li>Maintain valid licenses and certifications (where required)</li>
                  <li>Use proper safety equipment and protective gear</li>
                  <li>Report any incidents or accidents immediately</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.4 Prohibited Conduct</h3>
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h4 className="font-semibold text-red-900 mb-3">❌ You must NOT:</h4>
                  <ul className="text-red-800 text-sm space-y-2">
                    <li>• Request payments outside the YANN platform</li>
                    <li>• Solicit Customers for direct bookings</li>
                    <li>• Share your account credentials with others</li>
                    <li>• Provide services while impaired by alcohol or drugs</li>
                    <li>• Engage in harassment, discrimination, or inappropriate behavior</li>
                    <li>• Steal, damage, or misuse Customer property</li>
                    <li>• Photograph or record Customers without consent</li>
                    <li>• Share Customer personal information with third parties</li>
                    <li>• Misrepresent your qualifications or experience</li>
                    <li>• Subcontract work to others without prior approval</li>
                  </ul>
                </div>
              </section>

              {/* 5. Pricing & Payments */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Pricing & Payments</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.1 Service Pricing</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>You set your own service rates within YANN's guidelines</li>
                  <li>Prices must be competitive and fair for the market</li>
                  <li>YANN may suggest pricing based on market data</li>
                  <li>You can update prices at any time (not affecting confirmed bookings)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.2 Commission Structure</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-3">YANN Commission:</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="px-3 py-2 text-left font-semibold text-blue-900">Service Category</th>
                          <th className="px-3 py-2 text-left font-semibold text-blue-900">Commission Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        <tr>
                          <td className="px-3 py-2 text-blue-800">Standard Services (Cleaning, Cooking, etc.)</td>
                          <td className="px-3 py-2 text-blue-800 font-bold">15-20%</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-blue-800">Driver Services</td>
                          <td className="px-3 py-2 text-blue-800 font-bold">10-15%</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-blue-800">Religious Services (Pujari)</td>
                          <td className="px-3 py-2 text-blue-800 font-bold">10%</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-2 text-blue-800">Technical Services (Plumbing, Electrical)</td>
                          <td className="px-3 py-2 text-blue-800 font-bold">15-20%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-blue-700 text-xs mt-3">
                    * Commission rates may vary and are subject to change with prior notice. GST is applicable on commission.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.3 Payment Processing</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Payout Schedule:</strong> Weekly payouts (every Monday for previous week's earnings)</li>
                  <li><strong>Minimum Payout:</strong> ₹500 (amounts below will roll over)</li>
                  <li><strong>Payment Method:</strong> Direct bank transfer to your registered account</li>
                  <li><strong>Processing Time:</strong> 2-3 business days after payout initiation</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">5.4 Cash Payments</h3>
                <p className="text-gray-700 leading-relaxed">
                  For services with cash payment (e.g., Pujari), you collect payment directly from the Customer. YANN's commission will be deducted from your next payout or charged separately.
                </p>
              </section>

              {/* 6. Ratings & Reviews */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Ratings & Performance</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.1 Rating System</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Customers rate your services on a 5-star scale. Your rating affects your visibility and booking priority on the Platform.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.2 Minimum Standards</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <ul className="text-gray-700 space-y-2">
                    <li>• <strong>Minimum Rating:</strong> Maintain 4.0+ stars average</li>
                    <li>• <strong>Cancellation Rate:</strong> Keep below 5%</li>
                    <li>• <strong>Response Rate:</strong> Respond to 90%+ booking requests</li>
                    <li>• <strong>On-Time Rate:</strong> Arrive on time for 95%+ bookings</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.3 Consequences of Poor Performance</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Failure to meet minimum standards may result in:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Warning notification</li>
                  <li>Reduced visibility on the Platform</li>
                  <li>Temporary suspension</li>
                  <li>Permanent deactivation (for repeated violations)</li>
                </ul>
              </section>

              {/* 7. Insurance & Liability */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Insurance & Liability</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.1 Your Insurance</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We recommend obtaining appropriate insurance coverage including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Personal accident insurance</li>
                  <li>Professional liability insurance</li>
                  <li>Vehicle insurance (for drivers)</li>
                  <li>Third-party liability coverage</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.2 Liability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are solely responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Any damage to Customer property during service</li>
                  <li>Personal injury to yourself or others</li>
                  <li>Quality and outcome of your services</li>
                  <li>Your actions and conduct during service delivery</li>
                  <li>Compliance with applicable laws and regulations</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">7.3 YANN's Limited Liability</h3>
                <div className="bg-gray-100 border border-gray-300 rounded-xl p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    YANN is a marketplace platform and is not responsible for the quality, safety, or legality of services you provide. YANN's liability is limited to the commission earned on the specific booking in question.
                  </p>
                </div>
              </section>

              {/* 8. Confidentiality */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Confidentiality & Data Protection</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.1 Customer Information</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Customer information (name, address, phone number) is provided solely for service delivery. You must:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Use Customer information only for completing the booking</li>
                  <li>Not share Customer information with any third party</li>
                  <li>Not contact Customers for non-service related purposes</li>
                  <li>Delete Customer information after service completion</li>
                  <li>Protect Customer information from unauthorized access</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.2 Platform Confidentiality</h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree not to disclose any confidential information about YANN's business operations, pricing strategies, technology, or other proprietary information obtained through your partnership.
                </p>
              </section>

              {/* 9. Non-Circumvention */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Non-Circumvention</h2>
                
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-red-900 mb-3">⚠️ IMPORTANT</h3>
                  <p className="text-red-800 leading-relaxed mb-3">
                    You agree NOT to circumvent the YANN platform by:
                  </p>
                  <ul className="list-disc pl-5 text-red-800 space-y-2">
                    <li>Soliciting direct bookings from YANN Customers</li>
                    <li>Accepting payments outside the Platform</li>
                    <li>Providing your personal contact details for future direct bookings</li>
                    <li>Offering discounts for off-platform bookings</li>
                  </ul>
                  <p className="text-red-900 font-semibold mt-4">
                    Violation of this clause will result in immediate account termination and may lead to legal action for damages.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">9.1 Non-Circumvention Period</h3>
                <p className="text-gray-700 leading-relaxed">
                  The non-circumvention obligation continues for 12 months after your last booking with any Customer introduced through YANN, even after this Agreement ends.
                </p>
              </section>

              {/* 10. Intellectual Property */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Intellectual Property</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">10.1 YANN's Trademarks</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  "YANN," the YANN logo, and all related marks are trademarks of YANN Technologies Private Limited. You may:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Use:</strong> Display YANN Partner badge on your uniform/vehicle (as provided)</li>
                  <li><strong>Not use:</strong> YANN trademarks for any other purpose without written permission</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">10.2 Content License</h3>
                <p className="text-gray-700 leading-relaxed">
                  By uploading photos, descriptions, or other content to your Partner profile, you grant YANN a non-exclusive, royalty-free license to use this content for marketing and promotional purposes.
                </p>
              </section>

              {/* 11. Termination */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Termination</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">11.1 Termination by You</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may terminate this Agreement at any time by:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Completing all confirmed bookings</li>
                  <li>Requesting account deactivation through the app or support</li>
                  <li>Providing 7 days written notice</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">11.2 Termination by YANN</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  YANN may terminate or suspend your account immediately for:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Violation of this Agreement or YANN policies</li>
                  <li>Fraudulent or criminal activity</li>
                  <li>Customer complaints or safety concerns</li>
                  <li>Consistently poor ratings or performance</li>
                  <li>Circumventing the Platform</li>
                  <li>At YANN's discretion with 14 days notice</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">11.3 Effect of Termination</h3>
                <p className="text-gray-700 leading-relaxed mb-3">Upon termination:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Your access to the Platform will be revoked</li>
                  <li>Pending payouts will be processed within 30 days</li>
                  <li>Amounts owed to YANN will be deducted from final payout</li>
                  <li>Confidentiality and non-circumvention obligations continue</li>
                </ul>
              </section>

              {/* 12. Dispute Resolution */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">12. Dispute Resolution</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.1 Customer Disputes</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For disputes with Customers, YANN will mediate and may make decisions regarding refunds or credits. You agree to cooperate with YANN's investigation and abide by its decisions.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.2 Disputes with YANN</h3>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Attempt informal resolution by contacting Partner Support</li>
                  <li>If unresolved, escalate to Partner Relations Manager</li>
                  <li>Mediation through a mutually agreed mediator</li>
                  <li>Binding arbitration under the Arbitration and Conciliation Act, 1996</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.3 Governing Law</h3>
                <p className="text-gray-700 leading-relaxed">
                  This Agreement is governed by the laws of India. The courts of [Your City], India shall have exclusive jurisdiction for any legal proceedings.
                </p>
              </section>

              {/* 13. General */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">13. General Provisions</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">13.1 Entire Agreement</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This Agreement, together with YANN's Terms of Service and Privacy Policy, constitutes the entire agreement between you and YANN regarding your partnership.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">13.2 Amendments</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  YANN may modify this Agreement with 14 days notice. Continued use of the Platform after changes constitutes acceptance. Material changes will be communicated via email.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">13.3 Severability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If any provision is found unenforceable, the remaining provisions remain in effect.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">13.4 No Waiver</h3>
                <p className="text-gray-700 leading-relaxed">
                  YANN's failure to enforce any provision does not constitute a waiver of that provision.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">14. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about this Agreement or your partnership:
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h4 className="font-bold text-green-900 mb-4">YANN Partner Support</h4>
                  <div className="space-y-2 text-green-800">
                    <p><strong>Email:</strong> partners@yann.in</p>
                    <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                    <p><strong>WhatsApp:</strong> +91-XXXXXXXXXX</p>
                    <p><strong>Support Hours:</strong> 9 AM - 9 PM IST, 7 days a week</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Legal/Compliance:</strong> legal@yann.in<br/>
                    <strong>Address:</strong> YANN Technologies Pvt. Ltd., [Your Registered Address], [City, State, PIN Code], India
                  </p>
                </div>
              </section>

              {/* Acknowledgment */}
              <section className="mb-6">
                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-indigo-900 mb-3">📝 ACKNOWLEDGMENT</h3>
                  <p className="text-indigo-800 leading-relaxed">
                    By registering as a YANN Service Partner and clicking "I Agree" or similar acceptance mechanism, you acknowledge that you have read, understood, and agree to be bound by this Service Partner Agreement and all referenced policies.
                  </p>
                </div>
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
            <a href="/refund" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Refund Policy →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
