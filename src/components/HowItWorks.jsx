import Link from 'next/link';

const HowItWorks = () => {
  const steps = [
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
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>
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
            Getting professional help has never been easier. Just four simple steps to a stress-free life.
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 transform -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border border-gray-100 group">
                  {/* Number Badge */}
                  <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-125 transition-all duration-500`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white mb-6 mx-auto mt-8 group-hover:rotate-12 transition-all duration-500`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Timeline */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className={`absolute left-7 top-24 w-1 h-full bg-gradient-to-b ${step.gradient} opacity-30`}></div>
              )}

              {/* Step Card */}
              <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 relative z-10">
                <div className="flex items-start space-x-6">
                  {/* Number Badge */}
                  <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>

                  <div className="flex-1">
                    {/* Icon */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white mb-4`}>
                      {step.icon}
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of satisfied customers enjoying hassle-free services.
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