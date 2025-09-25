'use client';

import { useState, useEffect } from 'react';

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Homeowner",
      feedback: "Yann has completely transformed how I manage my home services. The cleaning team was professional, thorough, and trustworthy. I can finally focus on what matters most while they handle the rest.",
      rating: 5,
      initials: "SJ",
      bgColor: "bg-blue-500"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Busy Professional",
      feedback: "The repair service was exceptional! They fixed my plumbing issue quickly and professionally. The booking process was seamless, and the technician arrived exactly on time. Highly recommend!",
      rating: 5,
      initials: "MC",
      bgColor: "bg-purple-500"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Working Mom",
      feedback: "As a working mom, Yann has been a lifesaver. From pet care to delivery services, everything is handled with such care and professionalism. The peace of mind is priceless.",
      rating: 5,
      initials: "ER",
      bgColor: "bg-green-500"
    },
    {
      id: 4,
      name: "David Thompson",
      role: "Senior Citizen",
      feedback: "The personal assistant service has made my daily life so much easier. The staff is kind, reliable, and always goes above and beyond. I'm grateful for such wonderful support.",
      rating: 5,
      initials: "DT",
      bgColor: "bg-orange-500"
    },
    {
      id: 5,
      name: "Lisa Wang",
      role: "Small Business Owner",
      feedback: "Yann's delivery service has been crucial for my business. Fast, reliable, and professional. My customers are always happy with the service, which reflects well on my business too.",
      rating: 5,
      initials: "LW",
      bgColor: "bg-pink-500"
    },
    {
      id: 6,
      name: "Robert Kim",
      role: "Apartment Resident",
      feedback: "The garden service transformed my small balcony into a beautiful green space. The team was knowledgeable and creative. I love spending time in my little urban oasis now!",
      rating: 5,
      initials: "RK",
      bgColor: "bg-teal-500"
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Get visible testimonials for current slide
  const getVisibleTestimonials = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      result.push(testimonials[(currentSlide + i) % testimonials.length]);
    }
    return result;
  };

  const visibleTestimonials = getVisibleTestimonials();

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-16 md:py-24 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Customers Say
            </span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Don't just take our word for it. Here's what our satisfied customers have to say about their experience with Yann.
          </p>
        </div>

        {/* Desktop Grid View (hidden on mobile) */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-12">
          {visibleTestimonials.map((testimonial, index) => (
            <TestimonialCard key={`${testimonial.id}-${currentSlide}`} testimonial={testimonial} index={index} />
          ))}
        </div>

        {/* Mobile/Tablet Carousel */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <TestimonialCard testimonial={testimonial} index={0} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center space-x-6 mt-12">
          {/* Previous/Next buttons */}
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-blue-50 group"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Dots indicator */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide 
                    ? 'bg-blue-600 w-8' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:bg-blue-50 group"
          >
            <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">10k+</div>
            <div className="text-gray-600">Happy Customers</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">4.9</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">99%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Testimonial Card Component
const TestimonialCard = ({ testimonial, index }) => {
  return (
    <div 
      className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Quote icon */}
      <div className="absolute top-6 right-6 text-gray-200 group-hover:text-blue-200 transition-colors duration-300">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
        </svg>
      </div>

      {/* Rating stars */}
      <div className="flex mb-4">
        {[...Array(testimonial.rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Testimonial text */}
      <p className="text-gray-600 leading-relaxed mb-6 text-lg">
        "{testimonial.feedback}"
      </p>

      {/* Customer info */}
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 ${testimonial.bgColor} rounded-full flex items-center justify-center text-white font-semibold text-lg`}>
          {testimonial.initials}
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-gray-500 text-sm">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;