import Footer from '@/components/Footer';

export const metadata = {
  title: "Terms of Service | YANN - Home Services Platform",
  description: "Read YANN's Terms of Service. These terms govern your use of our platform for booking and providing home services.",
};

export default function TermsOfServicePage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Terms of Service</h1>
            <p className="text-gray-500 text-sm">Last Updated: December 5, 2025 | Effective Date: December 5, 2025</p>
          </header>

          {/* Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="prose prose-gray max-w-none">

              {/* Important Notice */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-8">
                <h3 className="text-amber-900 font-bold text-lg mb-2">⚠️ IMPORTANT NOTICE</h3>
                <p className="text-amber-800 text-sm leading-relaxed">
                  PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE USING OUR PLATFORM. BY ACCESSING OR USING YANN'S SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO ALL THESE TERMS, DO NOT USE OUR PLATFORM.
                </p>
              </div>

              {/* 1. Acceptance of Terms */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Acceptance of Terms</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.1 Agreement</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms of Service ("Terms") constitute a legally binding agreement between you ("User," "you," or "your") and YANN Technologies Private Limited ("YANN," "Company," "we," "our," or "us"), a company incorporated under the laws of India.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.2 Platform Description</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  YANN operates an online platform (website and mobile application) that connects:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Customers:</strong> Homeowners, residents, and individuals seeking home services</li>
                  <li><strong>Service Partners:</strong> Verified professionals providing home services</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Services include but are not limited to: house cleaning, cooking/chef services, personal drivers, security guards, gardeners, plumbers, electricians, religious services (Pujari), and other domestic assistance.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">1.3 Eligibility</h3>
                <p className="text-gray-700 leading-relaxed mb-3">By using YANN, you represent and warrant that:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>You are at least 18 years of age</li>
                  <li>You have the legal capacity to enter into binding contracts</li>
                  <li>You are not prohibited from using the Platform under applicable laws</li>
                  <li>All information you provide is accurate, current, and complete</li>
                </ul>
              </section>

              {/* 2. User Accounts */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. User Accounts</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Account Registration</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access certain features, you must create an account by providing accurate information and verifying your identity through OTP or other verification methods.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Account Security</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You are responsible for:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Immediately notifying us of any unauthorized use</li>
                  <li>Ensuring your account information is up-to-date</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Account Types</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">👤 Customer Account</h4>
                    <p className="text-blue-800 text-sm">For individuals seeking to book home services through the Platform.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">🛠️ Partner Account</h4>
                    <p className="text-green-800 text-sm">For verified professionals providing services. Subject to additional Partner Terms.</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.4 Account Termination</h3>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to suspend or terminate your account at our discretion, with or without notice, for violations of these Terms, fraudulent activity, or any conduct we deem harmful to our Platform or users.
                </p>
              </section>

              {/* 3. Services & Bookings */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Services & Bookings</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.1 Service Marketplace</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  YANN acts as an intermediary platform connecting Customers with Service Partners. We do not directly provide home services. Service Partners are independent contractors, not employees of YANN.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.2 Booking Process</h3>
                <ol className="list-decimal pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Browse and select desired services</li>
                  <li>Choose available date, time, and service options</li>
                  <li>Review pricing and service details</li>
                  <li>Select a verified Service Partner</li>
                  <li>Confirm booking and make payment (if applicable)</li>
                  <li>Receive booking confirmation</li>
                </ol>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.3 Service Confirmation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  A booking is confirmed only when:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>You receive a booking confirmation from YANN</li>
                  <li>A Service Partner accepts the booking</li>
                  <li>Payment is processed (where applicable)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">3.4 Service Quality</h3>
                <p className="text-gray-700 leading-relaxed">
                  While we verify our Partners and strive for quality, YANN does not guarantee specific outcomes. Service quality may vary. We encourage users to review Partner ratings and feedback before booking.
                </p>
              </section>

              {/* 4. Pricing & Payments */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Pricing & Payments</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 Service Pricing</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Prices are set by Service Partners and displayed on the Platform</li>
                  <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                  <li>Prices are inclusive of applicable taxes (GST) where mentioned</li>
                  <li>Additional charges may apply for overtime, extra services, or materials</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 Payment Methods</h3>
                <p className="text-gray-700 leading-relaxed mb-3">We accept the following payment methods:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                  <li>Credit/Debit Cards (Visa, Mastercard, RuPay)</li>
                  <li>Net Banking</li>
                  <li>Cash (for selected services like Pujari)</li>
                  <li>YANN Wallet (if available)</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 Payment Processing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Online payments are processed through secure third-party payment gateways (Cashfree/Razorpay). YANN does not store your complete payment card details.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.4 Platform Fee</h3>
                <p className="text-gray-700 leading-relaxed">
                  YANN may charge a platform/convenience fee on bookings, which will be clearly displayed before confirmation. Service Partners may also be charged a commission on completed services.
                </p>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Price Transparency</h4>
                  <p className="text-gray-700 text-sm">
                    The final price shown at checkout includes all applicable charges. No hidden fees will be added after booking confirmation.
                  </p>
                </div>
              </section>

              {/* 5. Cancellations & Refunds */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Cancellations & Refunds</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Please refer to our detailed <a href="/refund" className="text-blue-600 hover:underline font-medium">Refund & Cancellation Policy</a> for complete information. Key points:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Cancellation Summary:</h4>
                  <ul className="text-blue-800 text-sm space-y-2">
                    <li>• <strong>24+ hours before:</strong> Full refund</li>
                    <li>• <strong>12-24 hours before:</strong> 50% refund</li>
                    <li>• <strong>Less than 12 hours:</strong> No refund</li>
                    <li>• <strong>Partner cancellation:</strong> Full refund + credits</li>
                  </ul>
                </div>
              </section>

              {/* 6. User Conduct */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. User Conduct</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.1 Acceptable Use</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You agree to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Use the Platform only for lawful purposes</li>
                  <li>Provide accurate and truthful information</li>
                  <li>Treat Service Partners with respect and dignity</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Pay for services as agreed upon booking</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.2 Prohibited Activities</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You must NOT:</p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <ul className="list-disc pl-5 text-red-800 text-sm space-y-2">
                    <li>Harass, abuse, or discriminate against Service Partners or other users</li>
                    <li>Provide false information or impersonate others</li>
                    <li>Attempt to bypass the Platform for direct bookings</li>
                    <li>Use the Platform for any illegal or unauthorized purpose</li>
                    <li>Interfere with or disrupt the Platform's functionality</li>
                    <li>Scrape, copy, or misuse Platform data</li>
                    <li>Post false reviews or ratings</li>
                    <li>Engage in fraudulent payment activities</li>
                    <li>Request services that are illegal or inappropriate</li>
                    <li>Share account credentials with others</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.3 Content Guidelines</h3>
                <p className="text-gray-700 leading-relaxed">
                  Any content you submit (reviews, photos, communications) must not be defamatory, obscene, offensive, or infringing on intellectual property rights. We reserve the right to remove inappropriate content.
                </p>
              </section>

              {/* 7. Service Partner Responsibilities */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Service Partner Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you are a Service Partner, you agree to additional terms outlined in the <a href="/partner-terms" className="text-blue-600 hover:underline font-medium">Service Partner Agreement</a>. Key responsibilities include:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Maintaining required licenses and certifications</li>
                  <li>Providing services professionally and punctually</li>
                  <li>Honoring all confirmed bookings</li>
                  <li>Maintaining accurate availability on the Platform</li>
                  <li>Complying with all safety and quality standards</li>
                  <li>Not directly soliciting Customers outside the Platform</li>
                </ul>
              </section>

              {/* 8. Intellectual Property */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Intellectual Property</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.1 YANN's Intellectual Property</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The YANN name, logo, website, mobile application, content, features, and functionality are owned by YANN Technologies Private Limited and are protected by copyright, trademark, and other intellectual property laws.
                </p>

                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
                  <h4 className="font-semibold text-indigo-900 mb-2">🏷️ Trademark Notice</h4>
                  <p className="text-indigo-800 text-sm">
                    "YANN", the YANN logo, and related marks are registered trademarks of YANN Technologies Private Limited. Unauthorized use is strictly prohibited and may result in legal action.
                  </p>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.2 Limited License</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We grant you a limited, non-exclusive, non-transferable, revocable license to access and use our Platform for personal, non-commercial purposes in accordance with these Terms.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">8.3 Restrictions</h3>
                <p className="text-gray-700 leading-relaxed mb-3">You may NOT:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Copy, modify, or distribute our content without permission</li>
                  <li>Use our trademarks without written authorization</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                  <li>Remove any copyright or proprietary notices</li>
                  <li>Create derivative works based on our Platform</li>
                </ul>
              </section>

              {/* 9. Disclaimers */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Disclaimers</h2>

                <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">9.1 Platform "As Is"</h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    THE PLATFORM AND ALL SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. YANN DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1 mb-4">
                    <li>Merchantability and fitness for a particular purpose</li>
                    <li>Non-infringement of third-party rights</li>
                    <li>Uninterrupted or error-free service</li>
                    <li>Accuracy or reliability of any information</li>
                  </ul>

                  <h3 className="text-lg font-bold text-gray-900 mb-3 mt-6">9.2 Third-Party Services</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    YANN is not responsible for the quality, safety, legality, or any aspect of services provided by Service Partners. Service Partners are independent contractors, and YANN does not employ, supervise, or control their work.
                  </p>
                </div>
              </section>

              {/* 10. Limitation of Liability */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Limitation of Liability</h2>

                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5">
                  <p className="text-amber-900 text-sm leading-relaxed mb-4">
                    TO THE MAXIMUM EXTENT PERMITTED BY LAW, YANN AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:
                  </p>
                  <ul className="list-disc pl-5 text-amber-800 text-sm space-y-2 mb-4">
                    <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                    <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>Personal injury or property damage resulting from services</li>
                    <li>Unauthorized access to or alteration of your data</li>
                    <li>Any conduct of third parties on the Platform</li>
                  </ul>
                  <p className="text-amber-900 text-sm leading-relaxed font-semibold">
                    IN NO EVENT SHALL YANN'S TOTAL LIABILITY EXCEED THE AMOUNT PAID BY YOU TO YANN IN THE SIX (6) MONTHS PRECEDING THE CLAIM, OR ₹5,000, WHICHEVER IS LESS.
                  </p>
                </div>
              </section>

              {/* 11. Indemnification */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Indemnification</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You agree to indemnify, defend, and hold harmless YANN, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  <li>Your use or misuse of the Platform</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your content or communications on the Platform</li>
                  <li>Any dispute between you and a Service Partner/Customer</li>
                </ul>
              </section>

              {/* 12. Dispute Resolution */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">12. Dispute Resolution</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.1 Customer Support</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For any service-related issues, please first contact our customer support team. We will attempt to resolve disputes informally within 7-14 business days.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.2 Mediation</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If informal resolution fails, parties agree to attempt mediation before pursuing legal action. Mediation costs shall be shared equally.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.3 Arbitration</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Any unresolved disputes shall be settled by binding arbitration under the Arbitration and Conciliation Act, 1996. The seat of arbitration shall be [Your City], India.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">12.4 Class Action Waiver</h3>
                <p className="text-gray-700 leading-relaxed">
                  You agree to resolve disputes individually and waive any right to participate in class action lawsuits or class-wide arbitration.
                </p>
              </section>

              {/* 13. Governing Law */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">13. Governing Law & Jurisdiction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Subject to the arbitration provisions above, any legal proceedings shall be brought exclusively in the courts of [Your City], India, and you consent to the personal jurisdiction of such courts.
                </p>
              </section>

              {/* 14. Changes to Terms */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">14. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the Platform. For material changes, we will:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Update the "Last Updated" date at the top of this page</li>
                  <li>Provide notice via email or Platform notification</li>
                  <li>Allow a reasonable period before changes take effect</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of the Platform after changes constitutes acceptance of the revised Terms.
                </p>
              </section>

              {/* 15. General Provisions */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">15. General Provisions</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">15.1 Entire Agreement</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  These Terms, along with our Privacy Policy and other referenced policies, constitute the entire agreement between you and YANN.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">15.2 Severability</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">15.3 Waiver</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">15.4 Assignment</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You may not assign or transfer your rights under these Terms without our consent. We may assign our rights at any time.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">15.5 Force Majeure</h3>
                <p className="text-gray-700 leading-relaxed">
                  YANN shall not be liable for any failure or delay due to circumstances beyond our reasonable control, including natural disasters, pandemics, government actions, or technical failures.
                </p>
              </section>

              {/* 16. Contact Information */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">16. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  For questions about these Terms of Service, please contact us:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4">YANN Technologies Private Limited</h4>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Legal Department</strong></p>
                    <p><strong>Email:</strong> info.yannhome@gmail.com</p>
                    <p><strong>Support:</strong> info.yannhome@gmail.com</p>
                    <p><strong>Phone:</strong> +91 7827273057</p>
                    <p><strong>Address:</strong></p>
                    <p className="pl-4">
                      Plot no. 16, Street no. 2, Goverdhan Patti,<br />
                      Sec-86, Gurgaon, Haryana, 122004<br />
                      India
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
                  <p className="text-gray-600 text-sm">
                    <strong>Grievance Officer:</strong> As per the Information Technology Act, 2000 and rules made thereunder, the name and contact details of the Grievance Officer are provided above.
                  </p>
                </div>
              </section>

            </div>
          </article>

          {/* Quick Navigation */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="/privacy" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Privacy Policy →
            </a>
            <a href="/refund" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Refund Policy →
            </a>
            <a href="/partner-terms" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Partner Agreement →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
