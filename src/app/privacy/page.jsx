import Footer from '@/components/Footer';

export const metadata = {
  title: "Privacy Policy | YANN - Home Services Platform",
  description: "Learn how YANN collects, uses, and protects your personal information. Our privacy policy explains your rights and our data practices.",
};

export default function PrivacyPolicyPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
            <p className="text-gray-500 text-sm">Last Updated: December 5, 2025 | Effective Date: December 5, 2025</p>
          </header>

          {/* Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="prose prose-gray max-w-none">

              {/* Introduction */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Welcome to YANN ("Company," "we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and services (collectively, the "Platform").
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  YANN is a home services marketplace that connects homeowners and residents ("Customers") with verified service providers ("Partners") for various household services including but not limited to cleaning, cooking, driving, security, and religious services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By accessing or using our Platform, you agree to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not access the Platform.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. Information We Collect</h2>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-3">We collect personal information that you voluntarily provide when you:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Register for an account (Customer or Partner)</li>
                  <li>Book or provide services through our Platform</li>
                  <li>Contact us for support or inquiries</li>
                  <li>Participate in surveys, contests, or promotions</li>
                </ul>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Information collected includes:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                    <div>
                      <p className="font-medium mb-1">For Customers:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Full Name</li>
                        <li>Email Address</li>
                        <li>Phone Number</li>
                        <li>Residential Address</li>
                        <li>Profile Photo (optional)</li>
                        <li>Payment Information</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium mb-1">For Service Partners:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Full Name & Date of Birth</li>
                        <li>Contact Information</li>
                        <li>Aadhaar Card / Government ID</li>
                        <li>PAN Card (for payments)</li>
                        <li>Address Proof</li>
                        <li>Bank Account Details</li>
                        <li>Professional Certifications</li>
                        <li>Police Verification Documents</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.2 Automatically Collected Information</h3>
                <p className="text-gray-700 leading-relaxed mb-3">When you access our Platform, we automatically collect:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers, browser type</li>
                  <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URL</li>
                  <li><strong>Location Data:</strong> GPS location (with your consent) for service delivery</li>
                  <li><strong>Cookies & Tracking:</strong> Cookies, web beacons, and similar technologies</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">2.3 Information from Third Parties</h3>
                <p className="text-gray-700 leading-relaxed">
                  We may receive information from third-party verification services, payment processors, background check providers, and social media platforms (if you choose to link your accounts).
                </p>
              </section>

              {/* How We Use Information */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. How We Use Your Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use the collected information for the following purposes:</p>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🏠 Service Delivery</h4>
                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                      <li>Facilitate bookings between Customers and Partners</li>
                      <li>Enable communication between parties</li>
                      <li>Process payments and payouts</li>
                      <li>Send booking confirmations and updates</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🔒 Safety & Verification</h4>
                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                      <li>Verify Partner identity and credentials</li>
                      <li>Conduct background checks on Partners</li>
                      <li>Prevent fraud and unauthorized access</li>
                      <li>Ensure platform safety for all users</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📊 Platform Improvement</h4>
                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                      <li>Analyze usage patterns and trends</li>
                      <li>Improve our services and user experience</li>
                      <li>Develop new features and offerings</li>
                      <li>Conduct research and analytics</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📢 Communications</h4>
                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                      <li>Send service-related notifications</li>
                      <li>Respond to inquiries and support requests</li>
                      <li>Send promotional content (with consent)</li>
                      <li>Notify about policy changes</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">⚖️ Legal Compliance</h4>
                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                      <li>Comply with applicable laws and regulations</li>
                      <li>Respond to legal requests and court orders</li>
                      <li>Protect our legal rights and interests</li>
                      <li>Enforce our terms and policies</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. Information Sharing & Disclosure</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We may share your information in the following circumstances:</p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.1 With Service Partners/Customers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you book a service, we share necessary information (name, address, phone number, service requirements) with the assigned Partner. Similarly, Partners' information (name, photo, ratings, contact) is shared with Customers.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.2 With Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We engage third-party companies to perform services on our behalf, including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Payment processing (Razorpay)</li>
                  <li>Cloud hosting (AWS, Google Cloud)</li>
                  <li>SMS/Email services (MSG91, SendGrid)</li>
                  <li>Analytics (Google Analytics)</li>
                  <li>Background verification services</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.3 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may disclose information if required by law, court order, government request, or to protect the rights, property, or safety of YANN, our users, or others.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">4.4 Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction. We will notify you of any such change.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                  <h4 className="font-semibold text-red-900 mb-2">❌ We DO NOT:</h4>
                  <ul className="list-disc pl-5 text-red-800 text-sm space-y-1">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your data for third-party advertising without consent</li>
                    <li>Disclose sensitive information publicly</li>
                  </ul>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Data Security</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Encryption:</strong> SSL/TLS encryption for data in transit, AES-256 for data at rest</li>
                  <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication for admin access</li>
                  <li><strong>Secure Storage:</strong> Data stored in secure, certified data centers in India</li>
                  <li><strong>Regular Audits:</strong> Periodic security assessments and vulnerability testing</li>
                  <li><strong>Employee Training:</strong> Staff trained on data protection practices</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We retain your information for as long as necessary to:</p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain business records as required by law</li>
                </ul>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Retention Periods:</h4>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Active account data: Retained while account is active</li>
                    <li>• Transaction records: 7 years (as per Indian tax laws)</li>
                    <li>• Communication logs: 3 years</li>
                    <li>• Analytics data: 2 years (anonymized)</li>
                  </ul>
                </div>
              </section>

              {/* Your Rights */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Your Rights</h2>
                <p className="text-gray-700 leading-relaxed mb-4">Under applicable privacy laws, you have the following rights:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Right to Access</h4>
                    <p className="text-green-800 text-sm">Request a copy of the personal information we hold about you.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Right to Rectification</h4>
                    <p className="text-green-800 text-sm">Request correction of inaccurate or incomplete data.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Right to Erasure</h4>
                    <p className="text-green-800 text-sm">Request deletion of your personal data (subject to legal requirements).</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Right to Portability</h4>
                    <p className="text-green-800 text-sm">Request your data in a structured, machine-readable format.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Right to Withdraw Consent</h4>
                    <p className="text-green-800 text-sm">Withdraw consent for processing at any time.</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✓ Right to Object</h4>
                    <p className="text-green-800 text-sm">Object to processing for marketing purposes.</p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mt-4">
                  To exercise these rights, please contact us at <a href="mailto:privacy@yann.in" className="text-blue-600 hover:underline">privacy@yann.in</a> or through your account settings.
                </p>
              </section>

              {/* Children's Privacy */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. If we discover we have collected information from a child without parental consent, we will delete it promptly.
                </p>
              </section>

              {/* Third-Party Links */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed">
                  Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </section>

              {/* Policy Changes */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Changes to This Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Posting the new Privacy Policy on this page</li>
                  <li>Updating the "Last Updated" date</li>
                  <li>Sending an email notification (for material changes)</li>
                  <li>Displaying a prominent notice on our Platform</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  Your continued use of the Platform after any changes constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              {/* Contact Information */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4">YANN Data Protection Officer</h4>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Email:</strong> info.yannhome@gmail.com</p>
                    <p><strong>Phone:</strong> +91 7827273057</p>
                    <p><strong>Address:</strong></p>
                    <p className="pl-4">
                      YANN Technologies Pvt. Ltd.<br />
                      Plot no. 16, Street no. 2, Goverdhan Patti,<br />
                      Sec-86, Gurgaon, Haryana, 122004<br />
                      India
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mt-6">
                  We will respond to your request within 30 days of receiving it.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">12. Governing Law</h2>
                <p className="text-gray-700 leading-relaxed">
                  This Privacy Policy is governed by the laws of India, including the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. Any disputes shall be subject to the exclusive jurisdiction of the courts in [Your City], India.
                </p>
              </section>

            </div>
          </article>

          {/* Quick Navigation */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="/terms" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Terms of Service →
            </a>
            <a href="/refund" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Refund Policy →
            </a>
            <a href="/cookies" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cookie Policy →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
