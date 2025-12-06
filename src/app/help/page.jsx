'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  FileText,
  CreditCard,
  Calendar,
  Shield,
  Users,
  Settings,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      detail: '+91 78272 73057',
      subtext: 'Mon-Sat, 8 AM - 10 PM',
      action: 'tel:+917827273057',
      actionText: 'Call Now',
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: Mail,
      title: 'Email Us',
      detail: 'info.shuttleride@gmail.com',
      subtext: 'Response within 24 hours',
      action: 'mailto:info.shuttleride@gmail.com',
      actionText: 'Send Email',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      detail: '+91 78272 73057',
      subtext: 'Quick responses',
      action: 'https://wa.me/917827273057',
      actionText: 'Chat Now',
      color: 'from-green-500 to-emerald-600',
    },
  ];

  const helpCategories = [
    {
      icon: Calendar,
      title: 'Booking & Scheduling',
      description: 'Book services, reschedule, or cancel appointments',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: CreditCard,
      title: 'Payments & Refunds',
      description: 'Payment methods, invoices, and refund policies',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Users,
      title: 'Service Partners',
      description: 'About our verified professionals',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: Shield,
      title: 'Safety & Trust',
      description: 'Background checks and service guarantees',
      color: 'bg-amber-100 text-amber-600',
    },
    {
      icon: Settings,
      title: 'Account Settings',
      description: 'Profile, preferences, and notifications',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: AlertCircle,
      title: 'Report an Issue',
      description: 'Service complaints or feedback',
      color: 'bg-red-100 text-red-600',
    },
  ];

  const faqs = [
    {
      category: 'Booking',
      questions: [
        {
          q: 'How do I book a service on YANN?',
          a: 'Booking is simple! Browse our services, select the one you need, choose your preferred date and time, fill in your details, and confirm. You\'ll receive a confirmation via SMS and email with your service partner\'s details.',
        },
        {
          q: 'Can I reschedule or cancel my booking?',
          a: 'Yes, you can reschedule or cancel your booking up to 4 hours before the scheduled time. Go to your bookings, select the booking you want to modify, and choose reschedule or cancel. Cancellations made within 4 hours may be subject to a cancellation fee.',
        },
        {
          q: 'How far in advance can I book a service?',
          a: 'You can book services up to 30 days in advance. For recurring services, you can set up weekly or monthly schedules based on your convenience.',
        },
        {
          q: 'What if the service partner doesn\'t show up?',
          a: 'In the rare case of a no-show, contact us immediately. We\'ll arrange an alternative service partner or provide a full refund. Our customer support is available to assist you.',
        },
      ],
    },
    {
      category: 'Payments',
      questions: [
        {
          q: 'What payment methods do you accept?',
          a: 'We accept UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, and cash payment after service completion. Choose your preferred method during checkout.',
        },
        {
          q: 'Is online payment secure?',
          a: 'Absolutely! All payments are processed through Cashfree, a PCI-DSS compliant payment gateway. Your card details are encrypted and never stored on our servers.',
        },
        {
          q: 'How do refunds work?',
          a: 'Refunds are processed within 5-7 business days to your original payment method. For cash payments, refunds are credited to your YANN wallet which can be used for future bookings.',
        },
        {
          q: 'Will I get an invoice for my booking?',
          a: 'Yes, a detailed invoice is automatically generated and sent to your registered email after service completion. You can also download invoices from your booking history.',
        },
      ],
    },
    {
      category: 'Service Quality',
      questions: [
        {
          q: 'How are service partners verified?',
          a: 'All our service partners undergo a rigorous verification process including identity verification (Aadhaar/PAN), address verification, background checks, and skill assessment tests. Only verified professionals are allowed on our platform.',
        },
        {
          q: 'What if I\'m not satisfied with the service?',
          a: 'Your satisfaction is our priority. If you\'re not happy with the service, report it within 24 hours through the app or call us. We\'ll arrange a re-service or provide an appropriate refund based on the situation.',
        },
        {
          q: 'Do service partners bring their own equipment?',
          a: 'For most services like cleaning and repairs, our partners bring their own professional-grade equipment. For specific requirements, you\'ll be informed during booking about what\'s included.',
        },
        {
          q: 'Are your services insured?',
          a: 'Yes, all services booked through YANN are covered by our service guarantee. In case of any accidental damage during service, we\'ll handle the compensation process.',
        },
      ],
    },
    {
      category: 'Account',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click on "Login" and enter your mobile number. You\'ll receive an OTP for verification. Once verified, your account is created automatically. You can then add your profile details.',
        },
        {
          q: 'Can I book without creating an account?',
          a: 'You\'ll need to verify your phone number to book a service, which automatically creates an account. This helps us maintain booking history and provide better support.',
        },
        {
          q: 'How do I update my address or contact details?',
          a: 'Log in to your account, go to Profile settings, and update your information. You can save multiple addresses for convenience.',
        },
        {
          q: 'How do I delete my account?',
          a: 'To delete your account, please contact our support team via email at support@yannhome.com. Note that this will permanently remove your booking history and saved preferences.',
        },
      ],
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        faq =>
          faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter(cat => cat.questions.length > 0)
    : faqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help & Support
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              How Can We
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Help You Today?
              </span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Find answers to common questions, get in touch with our support team, or browse helpful resources.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${method.color} rounded-2xl mb-6`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-lg font-semibold text-gray-700 mb-1">{method.detail}</p>
                <p className="text-sm text-gray-500 mb-6">{method.subtext}</p>
                <a
                  href={method.action}
                  target={method.action.startsWith('http') ? '_blank' : undefined}
                  rel={method.action.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${method.color} text-white rounded-xl font-semibold hover:opacity-90 transition-opacity`}
                >
                  {method.actionText}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse Help Topics</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a category to find relevant information and answers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 group"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 ${category.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faq" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Quick answers to common questions about our services
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                <p className="text-gray-400 mt-2">Try different keywords or browse categories above</p>
              </div>
            ) : (
              filteredFaqs.map((category, catIndex) => (
                <div key={catIndex} className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></span>
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, faqIndex) => {
                      const key = `${catIndex}-${faqIndex}`;
                      const isOpen = openFaq === key;
                      return (
                        <div
                          key={faqIndex}
                          className={`bg-white rounded-xl border-2 transition-all duration-300 ${isOpen ? 'border-blue-200 shadow-lg' : 'border-gray-100 hover:border-gray-200'
                            }`}
                        >
                          <button
                            onClick={() => setOpenFaq(isOpen ? null : key)}
                            className="w-full px-6 py-5 flex items-center justify-between text-left"
                          >
                            <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                              }`}>
                              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-5">
                              <p className="text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                {faq.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <MessageCircle className="w-10 h-10" />
              </div>

              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                Can't find what you're looking for? Our friendly support team is here to help you 24/7.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="tel:+917827273057"
                  className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Support
                </a>
                <a
                  href="https://wa.me/917827273057"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Our Office
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  YANN Home Services<br />
                  Sector-86, Gurgaon<br />
                  India - 122004
                </p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-emerald-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-emerald-600" />
                  Support Hours
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p><span className="font-semibold">Phone Support:</span> 8 AM - 10 PM (Mon-Sat)</p>
                  <p><span className="font-semibold">WhatsApp:</span> 24/7</p>
                  <p><span className="font-semibold">Email:</span> Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
