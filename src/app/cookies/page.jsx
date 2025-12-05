import Footer from '@/components/Footer';

export const metadata = {
  title: "Cookie Policy | YANN - Home Services Platform",
  description: "YANN's Cookie Policy explains how we use cookies and similar technologies on our platform.",
};

export default function CookiePolicyPage() {
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
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Cookie Policy</h1>
            <p className="text-gray-500 text-sm">Last Updated: December 5, 2025 | Effective Date: December 5, 2025</p>
          </header>

          {/* Content */}
          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
            <div className="prose prose-gray max-w-none">

              {/* Introduction */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">1. Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This Cookie Policy explains how YANN Technologies Private Limited ("YANN," "we," "our," or "us") uses cookies and similar tracking technologies when you visit our website (yann.in) and mobile application (collectively, the "Platform").
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By continuing to use our Platform, you consent to our use of cookies as described in this policy. You can manage your cookie preferences at any time through your browser settings or our cookie consent tool.
                </p>
              </section>

              {/* What are Cookies */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">2. What are Cookies?</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They help websites remember your preferences, understand how you use the site, and improve your overall experience.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">🍪 Types of Storage Technologies We Use:</h3>
                  <ul className="text-blue-800 space-y-2">
                    <li><strong>Cookies:</strong> Small text files stored in your browser</li>
                    <li><strong>Local Storage:</strong> Data stored locally in your browser</li>
                    <li><strong>Session Storage:</strong> Temporary data cleared when browser closes</li>
                    <li><strong>Pixels/Web Beacons:</strong> Tiny images for tracking</li>
                    <li><strong>SDKs:</strong> Software tools in our mobile app</li>
                  </ul>
                </div>
              </section>

              {/* Types of Cookies */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">3. Types of Cookies We Use</h2>
                
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                    <div className="bg-green-50 px-5 py-3 border-b border-green-200">
                      <h3 className="text-lg font-bold text-green-900 flex items-center gap-2">
                        <span className="text-xl">✓</span> Essential Cookies (Strictly Necessary)
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-700 text-sm mb-3">
                        These cookies are essential for the Platform to function properly. They cannot be disabled.
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Cookie</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Purpose</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">yann_session</td>
                            <td className="px-3 py-2">User authentication and session management</td>
                            <td className="px-3 py-2">Session</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">csrf_token</td>
                            <td className="px-3 py-2">Security protection against CSRF attacks</td>
                            <td className="px-3 py-2">Session</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">cookie_consent</td>
                            <td className="px-3 py-2">Stores your cookie preferences</td>
                            <td className="px-3 py-2">1 year</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">device_id</td>
                            <td className="px-3 py-2">Device identification for security</td>
                            <td className="px-3 py-2">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-5 py-3 border-b border-blue-200">
                      <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                        <span className="text-xl">⚙️</span> Functional Cookies
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-700 text-sm mb-3">
                        These cookies enable enhanced functionality and personalization.
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Cookie</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Purpose</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">user_preferences</td>
                            <td className="px-3 py-2">Remember your settings and preferences</td>
                            <td className="px-3 py-2">1 year</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">recent_searches</td>
                            <td className="px-3 py-2">Store your recent service searches</td>
                            <td className="px-3 py-2">30 days</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">location_data</td>
                            <td className="px-3 py-2">Remember your service location</td>
                            <td className="px-3 py-2">30 days</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">language</td>
                            <td className="px-3 py-2">Store language preference</td>
                            <td className="px-3 py-2">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border-2 border-purple-200 rounded-xl overflow-hidden">
                    <div className="bg-purple-50 px-5 py-3 border-b border-purple-200">
                      <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                        <span className="text-xl">📊</span> Analytics Cookies
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-700 text-sm mb-3">
                        These cookies help us understand how visitors interact with our Platform.
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Cookie</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Provider</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Purpose</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">_ga</td>
                            <td className="px-3 py-2">Google Analytics</td>
                            <td className="px-3 py-2">Distinguish unique users</td>
                            <td className="px-3 py-2">2 years</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">_ga_*</td>
                            <td className="px-3 py-2">Google Analytics 4</td>
                            <td className="px-3 py-2">Store and count pageviews</td>
                            <td className="px-3 py-2">2 years</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">_gid</td>
                            <td className="px-3 py-2">Google Analytics</td>
                            <td className="px-3 py-2">Distinguish users</td>
                            <td className="px-3 py-2">24 hours</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">mp_*</td>
                            <td className="px-3 py-2">Mixpanel</td>
                            <td className="px-3 py-2">Usage analytics</td>
                            <td className="px-3 py-2">1 year</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border-2 border-orange-200 rounded-xl overflow-hidden">
                    <div className="bg-orange-50 px-5 py-3 border-b border-orange-200">
                      <h3 className="text-lg font-bold text-orange-900 flex items-center gap-2">
                        <span className="text-xl">📢</span> Marketing/Advertising Cookies
                      </h3>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-700 text-sm mb-3">
                        These cookies track your activity to deliver relevant advertisements.
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Cookie</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Provider</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Purpose</th>
                            <th className="px-3 py-2 text-left font-semibold text-gray-700">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">_fbp</td>
                            <td className="px-3 py-2">Facebook</td>
                            <td className="px-3 py-2">Deliver and measure ads</td>
                            <td className="px-3 py-2">3 months</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">_gcl_au</td>
                            <td className="px-3 py-2">Google Ads</td>
                            <td className="px-3 py-2">Conversion tracking</td>
                            <td className="px-3 py-2">3 months</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">fr</td>
                            <td className="px-3 py-2">Facebook</td>
                            <td className="px-3 py-2">Ad delivery and retargeting</td>
                            <td className="px-3 py-2">3 months</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookie Purposes */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">4. How We Use Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">We use cookies and similar technologies to:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🔐 Security & Authentication</h4>
                    <p className="text-gray-700 text-sm">Keep you logged in, protect your account, and prevent fraud.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">⚡ Performance</h4>
                    <p className="text-gray-700 text-sm">Make our Platform faster and more efficient for you.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">🎯 Personalization</h4>
                    <p className="text-gray-700 text-sm">Remember your preferences and provide relevant content.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📈 Analytics</h4>
                    <p className="text-gray-700 text-sm">Understand how you use our Platform to improve it.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">💬 Communication</h4>
                    <p className="text-gray-700 text-sm">Show relevant messages and notifications.</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">📣 Advertising</h4>
                    <p className="text-gray-700 text-sm">Deliver relevant ads and measure their effectiveness.</p>
                  </div>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">5. Third-Party Cookies</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Some cookies on our Platform are set by third-party services. These providers have their own privacy policies:
                </p>
                
                <div className="bg-gray-50 rounded-xl p-5">
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">Google Analytics:</span>
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Privacy Policy</a>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">Facebook Pixel:</span>
                      <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Privacy Policy</a>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">Google Ads:</span>
                      <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Ad Policy</a>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold">Cashfree (Payments):</span>
                      <a href="https://www.cashfree.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Privacy Policy</a>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Managing Cookies */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">6. Managing Your Cookie Preferences</h2>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.1 Cookie Consent Tool</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you first visit our Platform, you will see a cookie consent banner. You can customize your preferences by clicking "Manage Preferences" or accept all cookies.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.2 Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can control cookies through your browser settings. Here's how to manage cookies in popular browsers:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">🌐</span>
                    <span className="font-medium text-gray-700">Google Chrome</span>
                  </a>
                  <a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">🦊</span>
                    <span className="font-medium text-gray-700">Mozilla Firefox</span>
                  </a>
                  <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">🧭</span>
                    <span className="font-medium text-gray-700">Safari</span>
                  </a>
                  <a href="https://support.microsoft.com/help/4027947" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-2xl">🔷</span>
                    <span className="font-medium text-gray-700">Microsoft Edge</span>
                  </a>
                </div>

                <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">6.3 Opt-Out of Analytics</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can opt-out of Google Analytics by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a>.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Important Note</h4>
                  <p className="text-amber-800 text-sm">
                    Disabling certain cookies may affect the functionality of our Platform. Essential cookies cannot be disabled as they are necessary for basic operations like logging in and making bookings.
                  </p>
                </div>
              </section>

              {/* Do Not Track */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">7. Do Not Track Signals</h2>
                <p className="text-gray-700 leading-relaxed">
                  Some browsers have a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activity tracked. Currently, there is no uniform standard for how websites should respond to DNT signals. Our Platform does not currently respond to DNT signals, but you can manage tracking through our cookie consent tool and browser settings.
                </p>
              </section>

              {/* Mobile Apps */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">8. Mobile Application</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our mobile app uses similar technologies including:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Device Identifiers:</strong> Unique IDs assigned to your device</li>
                  <li><strong>SDKs:</strong> Software development kits for analytics and functionality</li>
                  <li><strong>Local Storage:</strong> Data stored locally on your device</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  You can manage app permissions and tracking through your device settings (iOS: Settings → Privacy → Tracking; Android: Settings → Privacy → Ads).
                </p>
              </section>

              {/* Data Transfers */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">9. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed">
                  Some of our third-party cookie providers may process data outside of India. When this occurs, we ensure appropriate safeguards are in place to protect your data in compliance with applicable data protection laws.
                </p>
              </section>

              {/* Updates */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">10. Updates to This Policy</h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update this Cookie Policy periodically to reflect changes in our practices or for legal, operational, or regulatory reasons. When we make changes, we will update the "Last Updated" date at the top of this page. We encourage you to review this policy regularly.
                </p>
              </section>

              {/* Contact */}
              <section className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about our use of cookies or this Cookie Policy, please contact us:
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-bold text-blue-900 mb-4">YANN Technologies Private Limited</h4>
                  <div className="space-y-2 text-blue-800">
                    <p><strong>Email:</strong> privacy@yann.in</p>
                    <p><strong>Phone:</strong> +91-XXXXXXXXXX</p>
                    <p><strong>Address:</strong></p>
                    <p className="pl-4">
                      [Your Registered Address]<br />
                      [City, State, PIN Code]<br />
                      India
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </article>

          {/* Quick Navigation */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <a href="/privacy" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Privacy Policy →
            </a>
            <a href="/terms" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Terms of Service →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
