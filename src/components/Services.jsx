"use client";

export default function Services() {
  const services = [
    {
      id: 1,
      title: "Home Cleaning",
      description:
        "Thorough cleaning services including dusting, mopping, and sanitization. Our trained maids make your home spotless and fresh.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Kitchen Cleaning",
      description:
        "Deep cleaning of kitchen including chimney, stove, tiles, sink, and cabinets. Maintain a hygienic cooking space effortlessly.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h18M3 12h18M9 16h6"
          />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: 3,
      title: "Bathroom Cleaning",
      description:
        "Professional bathroom deep cleaning including tiles, mirrors, taps, and sanitization for a germ-free experience.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M6 6h12M9 14h6m-7 4h8"
          />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      id: 4,
      title: "Laundry & Ironing",
      description:
        "Washing, drying, and ironing of clothes handled with care by our trusted staff to save you time and effort.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7h16M4 17h16M7 7V3h10v4"
          />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
    },
    {
      id: 5,
      title: "Cooking Assistance",
      description:
        "Hire skilled maids for daily meal preparation, cutting, chopping, and kitchen help tailored to your taste.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v18m9-9H3"
          />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      id: 6,
      title: "Elderly & Child Care",
      description:
        "Compassionate caregivers for elderly assistance and babysitting. Ensuring safety, comfort, and care for your loved ones.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      gradient: "from-teal-500 to-green-500",
    },
  ];
  

  return (
    <section className="bg-gray-50 pt-16 md:pt-24 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Services
            </span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our comprehensive range of professional services designed to make your life easier and more convenient.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>

              {/* Call-to-action removed per request */}

              {/* Decorative element */}
              {/* <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${service.gradient} opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10`}></div> */}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-8">
            Need a custom service not listed here? We're always ready to help!
          </p>
          <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-1 hover:from-blue-600 hover:to-purple-700">
            Contact Us
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}