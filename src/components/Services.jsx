import Link from 'next/link';

const Services = () => {
  const services = [
    {
      id: 1,
      title: "House Cleaning",
      description: "Professional cleaning services for your home. Deep cleaning, regular maintenance, and more.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      features: ["Deep Cleaning", "Regular Maintenance", "Move-in/Move-out"],
      price: "Starting at ₹299",
      popular: true,
      category: 'cleaning',
    },
    {
      id: 2,
      title: "Repairs & Maintenance",
      description: "Expert technicians for all your repair needs. Plumbing, electrical, carpentry, and more.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
      features: ["Plumbing", "Electrical", "Carpentry"],
      price: "Starting at ₹399",
      popular: false,
      category: 'maintenance',
    },
    {
      id: 3,
      title: "Delivery Services",
      description: "Fast and reliable delivery for packages, groceries, and more. Track in real-time.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      gradient: "from-green-500 to-teal-500",
      features: ["Same-day Delivery", "Package Tracking", "Grocery Delivery"],
      price: "Starting at ₹99",
      popular: false,
      category: 'delivery',
    },
    {
      id: 4,
      title: "Pet Care",
      description: "Loving care for your furry friends. Walking, grooming, sitting, and veterinary services.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
      features: ["Dog Walking", "Pet Grooming", "Pet Sitting"],
      price: "Starting at ₹129",
      popular: false,
      category: 'pet-care',
    },
    {
      id: 5,
      title: "Personal Assistant",
      description: "Your dedicated helper for errands, appointments, and daily tasks. Save time and stress.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-500",
      features: ["Errand Running", "Appointment Scheduling", "Personal Shopping"],
      price: "Starting at ₹399",
      popular: false,
      category: 'assistant',
    },
    {
      id: 6,
      title: "Garden & Landscaping",
      description: "Transform your outdoor space. Lawn care, planting, design, and maintenance.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: "from-green-600 to-lime-500",
      features: ["Lawn Care", "Garden Design", "Tree Trimming"],
      price: "Starting at ₹299",
      popular: false,
      category: 'garden',
    },
    {
      id: 7,
      title: "Full-Day Personal Driver",
      description: "Hire a background-verified driver for full-day commutes, airport drops, or VIP errands with clear hourly overtime.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-5a2 2 0 011.886-1.342h10.228A2 2 0 0119 8l2 5M5 13h14m-9 5h4m-9 0h1m10 0h1m-3 0a3 3 0 11-6 0" />
        </svg>
      ),
      gradient: "from-slate-900 to-blue-700",
      features: ["10 hrs included", "Hourly overtime", "Sedan & SUV trained"],
      price: "Starting at ₹999",
      popular: true,
      category: 'driver',
    },
    {
      id: 8,
      title: "Outstation Driving Service",
      description: "Intercity-ready personal drivers for weekend trips and business travel, trained for highways and night halts.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 01-4 0M19 17a2 2 0 01-4 0M5 17V5h14l2 6v6H5z" />
        </svg>
      ),
      gradient: "from-indigo-900 to-sky-700",
      features: ["12 hrs included", "Highway experts", "Night halt friendly"],
      price: "Starting at ₹1,499",
      popular: false,
      category: 'driver',
    },
  ];

  const prioritizedServices = [...services].sort((a, b) => {
    const aInactive = a.category !== 'driver' && a.category !== 'pujari';
    const bInactive = b.category !== 'driver' && b.category !== 'pujari';
    if (aInactive === bInactive) return 0;
    return aInactive ? 1 : -1;
  });

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>Our Services</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Services Tailored{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              For You
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From home maintenance to personal care, we've got everything you need to make your life easier and more convenient.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {prioritizedServices.map((service) => {
            const isActive = service.category === 'driver' || service.category === 'pujari';
            const serviceSlug = service.title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

            return (
              <div
                key={service.id}
                className={`group relative bg-white rounded-3xl p-8 shadow-md border border-gray-100 overflow-hidden transition-all duration-500 ${
                  isActive ? 'hover:shadow-2xl hover:-translate-y-3' : 'filter grayscale opacity-80'
                }`}
              >
                {!isActive && (
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-gray-900 text-white rounded-full">
                    Inactive
                  </div>
                )}

                {/* Popular Badge */}
                {service.popular && isActive && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    POPULAR
                  </div>
                )}

                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} ${isActive ? 'opacity-0 group-hover:opacity-5' : 'opacity-0' } transition-opacity duration-500`}></div>

                {/* Icon */}
                <div className={`relative w-20 h-20 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center text-white mb-6 transition-all duration-500 shadow-lg ${
                  isActive ? 'group-hover:scale-110 group-hover:rotate-6' : 'grayscale'
                }`}>
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Price</div>
                    <div className={`text-xl font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                      {service.price}
                    </div>
                  </div>
                  {isActive ? (
                    <Link
                      href={`/services/${serviceSlug}`}
                      className={`px-6 py-3 bg-gradient-to-r ${service.gradient} text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                    >
                      Book Now
                    </Link>
                  ) : (
                    <span className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-semibold cursor-not-allowed">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Link
            href="/services"
            className="inline-flex items-center px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-200"
          >
            View All Services
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;