'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Award, 
  Clock, 
  MapPin, 
  Star,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { number: '10,000+', label: 'Happy Customers', icon: Users },
    { number: '500+', label: 'Service Partners', icon: Award },
    { number: '50+', label: 'Services Offered', icon: Target },
    { number: '4.8', label: 'Average Rating', icon: Star },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every service partner is thoroughly verified with background checks and skill assessments.',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We go above and beyond to ensure quality service.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Clock,
      title: 'Reliability',
      description: 'On-time service delivery with real-time tracking and instant communication.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Strict quality standards with money-back guarantee if you\'re not satisfied.',
      color: 'from-emerald-500 to-green-500',
    },
  ];

  const team = [
    {
      name: 'Our Mission',
      role: 'What Drives Us',
      description: 'To make professional home services accessible, affordable, and reliable for every household in India.',
      icon: Target,
    },
    {
      name: 'Our Vision',
      role: 'Where We\'re Headed',
      description: 'To become India\'s most trusted platform for home services, empowering both customers and service partners.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              About YANN
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Making Home Services
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Simple & Reliable
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              YANN connects you with verified, skilled professionals for all your home service needs. 
              From cleaning to repairs, puja ceremonies to personal drivers - we've got you covered.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/my-services"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Explore Services
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/provider-login"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 -mt-10 relative z-20">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                    <stat.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Purpose</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building a platform that transforms how India accesses home services
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {team.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{item.role}</p>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at YANN
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose YANN */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Why Choose YANN?
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  We're not just another service platform. We're your trusted partner in making your home life easier.
                </p>
                
                <div className="space-y-6">
                  {[
                    'Verified & Background-Checked Professionals',
                    'Transparent Pricing - No Hidden Charges',
                    'Easy Online Booking & Scheduling',
                    'Real-time Tracking & Updates',
                    'Satisfaction Guaranteed or Money Back',
                    '24/7 Customer Support',
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-6">Join Our Growing Community</h3>
                  <p className="text-blue-100 mb-8">
                    Whether you're looking for services or want to offer your skills, YANN is the perfect platform for you.
                  </p>
                  
                  <div className="space-y-4">
                    <Link 
                      href="/my-services"
                      className="block w-full py-4 bg-white text-blue-600 rounded-xl font-bold text-center hover:bg-blue-50 transition-colors"
                    >
                      Book a Service
                    </Link>
                    <Link 
                      href="/provider-login"
                      className="block w-full py-4 bg-white/10 border-2 border-white/30 text-white rounded-xl font-bold text-center hover:bg-white/20 transition-colors"
                    >
                      Register as Service Partner
                    </Link>
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-500 rounded-full opacity-20 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Experience the YANN Difference?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of satisfied customers who trust YANN for their home service needs.
            </p>
            <Link 
              href="/my-services"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
