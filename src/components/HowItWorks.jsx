"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

const STEPS = [
    {
      number: "01",
      title: "Choose Your Service",
      description: "Browse our wide range of services and select what you need. From cleaning to repairs, we've got you covered.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      highlights: [
        "Pick from curated categories tailored to homes, offices, and communities",
        "Compare ratings, transparent pricing, and response time badges",
        "Save favourites to revisit when you're ready to book",
      ],
    },
    {
      number: "02",
      title: "Book & Schedule",
      description: "Pick your preferred date and time. Our flexible scheduling ensures we work around your busy life.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
      highlights: [
        "Select quick slots or request a tailored recurring schedule",
        "One-time OTP confirmation keeps bookings secure",
        "Receive automatic reminders so you never miss an appointment",
      ],
    },
    {
      number: "03",
      title: "Professional Arrives",
      description: "A verified professional arrives at your doorstep on time, ready to deliver exceptional service.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-green-500 to-teal-500",
      highlights: [
        "Background-verified experts matched to your exact requirement",
        "Live arrival tracking and chat inside the resident hub",
        "Digital job sheets capture photos, notes, and recommendations",
      ],
    },
    {
      number: "04",
      title: "Relax & Enjoy",
      description: "Sit back while our expert takes care of everything. Quality work guaranteed, every single time.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
      highlights: [
        "Secure payments only release after you rate the experience",
        "Unlock care plans and loyalty rewards right in your dashboard",
        "Need tweaks? Schedule follow-up visits in two taps—no phone calls",
      ],
    },
];

const HowItWorks = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeStep = useMemo(() => STEPS[activeIndex], [activeIndex]);

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span>Simple Process</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            How It{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Getting professional help has never been easier. Explore each step below to see how Yann keeps every interaction transparent and effortless.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transform -translate-y-1/2 z-0" />

          <div className="grid grid-cols-4 gap-8 relative z-10 items-start">
            {STEPS.map((step, index) => {
              const isActive = activeIndex === index;
              return (
                <div key={step.number} className="relative h-full">
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative flex h-full w-full flex-col items-center rounded-3xl bg-white p-8 text-center shadow-lg transition-all duration-500 border ${
                      isActive ? 'border-blue-200 ring-4 ring-blue-100' : 'border-gray-100 hover:-translate-y-4 hover:shadow-2xl'
                    } group focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200`}
                    aria-pressed={isActive}
                  >
                    <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-500 ${
                      isActive ? 'scale-125' : 'group-hover:scale-125'
                    }`}>
                      {step.number}
                    </div>

                    <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto mt-8 transition-all duration-500 ${
                      isActive ? 'rotate-3 scale-110' : 'group-hover:rotate-6 group-hover:scale-105'
                    }`}>
                      {step.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active step narrative */}
        <div className="mt-14">
          <div className="grid gap-10 lg:grid-cols-3 lg:items-start">
            <div className="rounded-3xl border border-blue-100 bg-white/70 p-8 shadow-lg backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-500 mb-4">
                Step {activeStep.number}
              </p>
              <h3 className="text-3xl font-semibold text-gray-900 mb-4">
                {activeStep.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {activeStep.description}
              </p>
            </div>

            <div className="lg:col-span-2 rounded-3xl border border-gray-100 bg-white p-8 shadow-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">What makes this step effortless?</h4>
              <ul className="space-y-4">
                {activeStep.highlights.map((point) => (
                  <li
                    key={point}
                    className="flex items-start gap-3 rounded-2xl bg-gray-50/60 p-4 text-gray-700"
                  >
                    <span className="mt-1 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 grid gap-4 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-5">
                <div className="flex items-center gap-3 text-sm text-blue-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <span>Scroll or tap the timeline above to explore each part of the journey.</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-purple-700">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 13.41A2 2 0 0116 14.83V19a2 2 0 01-2 2H6a2 2 0 01-2-2v-4.17a2 2 0 01.41-1.42l4-4.5a2 2 0 011.5-.66h4.18a2 2 0 011.5.66l4 4.5z" />
                  </svg>
                  <span>Every step is backed by audit trails in the admin panel for rapid issue resolution.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Timeline */}
        <div className="mt-16 space-y-8 lg:hidden">
          {STEPS.map((step, index) => {
            const isActive = activeIndex === index;
            return (
              <div key={step.number} className="relative">
                {index < STEPS.length - 1 && (
                  <div className={`absolute left-7 top-28 w-1 h-[calc(100%-4rem)] bg-gradient-to-b ${step.gradient} opacity-30`} />
                )}

                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative z-10 w-full rounded-3xl border ${
                    isActive ? 'border-blue-200 bg-white shadow-xl' : 'border-gray-100 bg-white/80 shadow-lg'
                  } p-6 text-left transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200`}
                  aria-expanded={isActive}
                >
                  <div className="flex items-start gap-5">
                    <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {step.number}
                    </div>

                    <div className="flex-1">
                      <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white`}>{step.icon}</div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>

                      {isActive ? (
                        <ul className="mt-4 space-y-3 text-gray-700">
                          {step.highlights.map((point) => (
                            <li key={point} className="flex items-start gap-2">
                              <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                                ✓
                              </span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of satisfied residents and partners enjoying hassle-free services every day.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Book Your First Service
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;