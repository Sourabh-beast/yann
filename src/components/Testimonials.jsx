'use client';

import { useState, useEffect } from 'react';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState('next');

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Homeowner",
      location: "Gurugram, Haryana",
      feedback: "Yann has completely transformed how I manage my home services. The cleaning team was so professional and trustworthy, I must say. Now I can focus on my work and family while they handle everything nicely.",
      rating: 5,
      image: "PS",
      bgColor: "from-blue-500 to-blue-600",
      service: "House Cleaning"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      role: "Busy Professional",
      location: "Noida, UP",
      feedback: "The repair service was simply outstanding! They fixed my plumbing issue within no time. Booking was very easy and the technician came exactly on time. Highly recommended for everyone!",
      rating: 5,
      image: "RK",
      bgColor: "from-purple-500 to-purple-600",
      service: "Home Repairs"
    },
    {
      id: 3,
      name: "Anjali Verma",
      role: "Working Mom",
      location: "Delhi NCR",
      feedback: "As a working mother, Yann has been such a blessing for me. From pet care to delivery services, everything is done with so much care and dedication. The peace of mind I get is truly priceless.",
      rating: 5,
      image: "AV",
      bgColor: "from-green-500 to-green-600",
      service: "Pet Care"
    },
    {
      id: 4,
      name: "Suresh Patel",
      role: "Senior Citizen",
      location: "Gurugram, Haryana",
      feedback: "The personal assistant service has made my daily life so much easier, I tell you. The staff is very kind and reliable, always doing more than expected. I am truly grateful for such wonderful support.",
      rating: 5,
      image: "SP",
      bgColor: "from-orange-500 to-orange-600",
      service: "Personal Assistant"
    },
    {
      id: 5,
      name: "Neha Gupta",
      role: "Small Business Owner",
      location: "Bangalore, Karnataka",
      feedback: "Yann's delivery service has been absolutely crucial for my business growth. Very fast, reliable, and professional behaviour. My customers are always happy with the service, which is good for my business reputation also.",
      rating: 5,
      image: "NG",
      bgColor: "from-pink-500 to-pink-600",
      service: "Delivery Service"
    },
    {
      id: 6,
      name: "Vikram Singh",
      role: "Apartment Resident",
      location: "Pune, Maharashtra",
      feedback: "The garden service completely transformed my small balcony into such a beautiful green space. The team had very good knowledge and were quite creative also. Now I just love spending time in my little urban oasis!",
      rating: 5,
      image: "VS",
      bgColor: "from-teal-500 to-teal-600",
      service: "Garden Care"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setDirection('next');
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setDirection('next');
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setDirection('prev');
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 'next' : 'prev');
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Get visible testimonials for current slide (desktop)
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(testimonials[(currentSlide + i) % testimonials.length]);
    }
    return result;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 py-20 md:py-28 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>Testimonials</span>
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Thousands
            </span>
            <br className="hidden sm:block" />
            of Customers
          </h2>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonials[i]?.bgColor || 'from-gray-400 to-gray-500'} border-2 border-white flex items-center justify-center text-white text-xs font-semibold`}>
                  {testimonials[i]?.image}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-600 font-medium">4.9 out of 5 stars</p>
            </div>
          </div>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our satisfied customers have to say about their experience with <span className="font-semibold text-gray-900">Yann</span>.
          </p>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden lg:block mb-12">
          <div className="grid grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.id}-${currentSlide}`}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <TestimonialCard testimonial={testimonial} />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Carousel */}
        <div className="lg:hidden mb-12">
          <div className="relative">
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                    <TestimonialCard testimonial={testimonial} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Controls */}
        <div className="flex items-center justify-center space-x-8 mb-16">
          {/* Previous Button */}
          <button 
            onClick={prevSlide}
            className="group p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 w-10 h-3' 
                    : 'bg-gray-300 hover:bg-gray-400 w-3 h-3'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide}
            className="group p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {[
            { value: '10,000+', label: 'Happy Customers', icon: '👥' },
            { value: '4.9/5', label: 'Average Rating', icon: '⭐' },
            { value: '99%', label: 'Satisfaction Rate', icon: '💯' },
            { value: '24/7', label: 'Support Available', icon: '🕐' }
          ].map((stat, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center border border-gray-100"
            >
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 font-medium text-sm md:text-base">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

// Enhanced Testimonial Card Component
const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="group bg-white rounded-3xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 relative overflow-hidden h-full flex flex-col border border-gray-100">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          {/* Service Badge */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
            {testimonial.service}
          </span>
          
          {/* Quote Icon */}
          <div className="text-gray-200 group-hover:text-blue-200 transition-all duration-300 group-hover:scale-110">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </div>
        </div>

        {/* Rating */}
        <div className="flex mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <svg 
              key={i} 
              className="w-5 h-5 text-yellow-400 fill-current transform group-hover:scale-110 transition-transform duration-300" 
              style={{ transitionDelay: `${i * 50}ms` }}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Testimonial Text */}
        <p className="text-gray-700 leading-relaxed mb-6 text-base md:text-lg flex-grow">
          "{testimonial.feedback}"
        </p>

        {/* Customer Info */}
        <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
          <div className={`w-14 h-14 bg-gradient-to-br ${testimonial.bgColor} rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
            {testimonial.image}
          </div>
          <div className="flex-grow">
            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors duration-300">
              {testimonial.name}
            </h4>
            <p className="text-gray-600 text-sm">{testimonial.role}</p>
            <p className="text-gray-400 text-xs flex items-center mt-1">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {testimonial.location}
            </p>
          </div>
          
          {/* Verified Badge */}
          <div className="text-green-500" title="Verified Customer">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;