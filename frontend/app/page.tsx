'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Hospital, Calendar, Users, Activity, Clock, Shield, Stethoscope, HeartPulse, Ambulance, UserPlus, LogIn, Phone, Mail, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Home() {
  const { t } = useTranslation();
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsHeaderVisible(false);
      } else {
        // Scrolling up
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      {/* Top Info Bar */}
      <div className={`bg-blue-900 text-white py-2 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      } fixed top-0 left-0 right-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center text-[10px] sm:text-xs md:text-sm">
          <div className="flex items-center space-x-2 sm:space-x-4 md:space-x-6">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Emergency: +977 01-1234567</span>
              <span className="sm:hidden text-[9px]">Emergency</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">info@mediflow.com</span>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>24/7 Emergency Service</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={`bg-white shadow-md border-b fixed left-0 right-0 z-40 transition-transform duration-300 ${
        isHeaderVisible ? 'translate-y-10' : '-translate-y-full'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={scrollToTop}>
              <div className="bg-blue-600 p-1.5 sm:p-2 rounded-xl group-hover:bg-blue-700 transition">
                <Hospital className="h-6 w-6 sm:h-8 sm:w-8 text-white" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-2xl md:text-3xl font-bold text-blue-900 whitespace-nowrap">MediFlow</span>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-600 whitespace-nowrap">Healthcare Management</p>
              </div>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <button onClick={scrollToTop} className="text-gray-700 hover:text-blue-600 font-medium transition text-sm lg:text-base whitespace-nowrap">
                {t('nav.home')}
              </button>
              <a href="#features" className="text-gray-700 hover:text-blue-600 font-medium transition cursor-pointer text-sm lg:text-base whitespace-nowrap">
                Features
              </a>
              <Link href="/register" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm lg:text-base whitespace-nowrap">
                Get Started
              </Link>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium transition text-sm lg:text-base whitespace-nowrap">
                For Doctors
              </Link>
              <a href="#footer" className="text-gray-700 hover:text-blue-600 font-medium transition cursor-pointer text-sm lg:text-base whitespace-nowrap">
                Contact
              </a>
            </div>

            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center space-x-1 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg text-[10px] sm:text-xs md:text-sm whitespace-nowrap"
              >
                <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 flex-shrink-0" strokeWidth={2.5} />
                <span>Account</span>
                <ChevronDown className={`h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fadeIn">
                  <Link
                    href="/login"
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <LogIn className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition font-medium"
                    onClick={() => setIsAccountMenuOpen(false)}
                  >
                    <UserPlus className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                    <span>Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Add padding to account for fixed header */}
      <div className="h-20 sm:h-28"></div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden animate-gradient">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 animate-float">
            <Stethoscope className="h-32 w-32" />
          </div>
          <div className="absolute bottom-20 right-10 animate-float animate-delay-300">
            <HeartPulse className="h-40 w-40" />
          </div>
          <div className="absolute top-40 right-1/4 animate-pulse-slow">
            <Activity className="h-24 w-24" />
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="animate-slide-in-left text-center md:text-left">
              <div className="inline-block bg-blue-700 text-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold mb-4 sm:mb-6 animate-bounce-slow">
                ✨ Advanced Healthcare Management System
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-4 sm:mb-6 leading-tight animate-fade-in">
                Your Health, <span className="text-blue-300 animate-pulse-slow">Our Priority</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed animate-fade-in animate-delay-200">
                Experience seamless healthcare with MediFlow - From online appointments to real-time queue management, we make healthcare accessible and efficient.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up animate-delay-300">
                <Link 
                  href="/login" 
                  className="flex items-center justify-center space-x-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white text-blue-900 rounded-lg hover:bg-blue-50 transition text-sm sm:text-base md:text-lg font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover-lift whitespace-nowrap"
                >
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 animate-bounce-slow flex-shrink-0" strokeWidth={2.5} />
                  <span>Book Appointment</span>
                </Link>
                <a 
                  href="#features" 
                  className="flex items-center justify-center space-x-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-900 transition text-sm sm:text-base md:text-lg font-bold hover-lift whitespace-nowrap cursor-pointer"
                >
                  <span>Learn More</span>
                </a>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-8 sm:mt-12 animate-slide-up animate-delay-500">
                <div className="text-center transform hover:scale-110 transition-transform">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300 animate-scale-in">10K+</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-blue-200 whitespace-nowrap">Patients</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300 animate-scale-in">50+</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-blue-200 whitespace-nowrap">Doctors</div>
                </div>
                <div className="text-center transform hover:scale-110 transition-transform">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-300 animate-scale-in">24/7</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-blue-200 whitespace-nowrap">Support</div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:block animate-slide-in-right">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 hover-glow">
                <h3 className="text-2xl font-bold mb-6">Quick Access</h3>
                <div className="space-y-4">
                  <Link href="/register" className="flex items-center space-x-4 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition group hover-lift animate-slide-up">
                    <div className="bg-blue-500 p-3 rounded-lg group-hover:scale-110 transition transform group-hover:rotate-12">
                      <UserPlus className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-semibold">New Patient Registration</div>
                      <div className="text-sm text-blue-200">Get started in minutes</div>
                    </div>
                  </Link>
                  <Link href="/login" className="flex items-center space-x-4 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition group hover-lift animate-slide-up animate-delay-100">
                    <div className="bg-green-500 p-3 rounded-lg group-hover:scale-110 transition transform group-hover:rotate-12">
                      <Calendar className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-semibold">Book Appointment</div>
                      <div className="text-sm text-blue-200">Login to schedule</div>
                    </div>
                  </Link>
                  <Link href="/login" className="flex items-center space-x-4 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition group hover-lift animate-slide-up animate-delay-200">
                    <div className="bg-orange-500 p-3 rounded-lg group-hover:scale-110 transition transform group-hover:rotate-12">
                      <Clock className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-semibold">Check Queue Status</div>
                      <div className="text-sm text-blue-200">Login for real-time updates</div>
                    </div>
                  </Link>
                  <a href="#footer" className="flex items-center space-x-4 p-4 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition border border-red-400 group hover-lift animate-slide-up animate-delay-300 cursor-pointer">
                    <div className="bg-red-500 p-3 rounded-lg group-hover:scale-110 transition transform animate-pulse">
                      <Ambulance className="h-6 w-6" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-semibold">Emergency Services</div>
                      <div className="text-sm text-blue-200">Contact us 24/7</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-4">
            Why Choose <span className="text-blue-600">MediFlow?</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
            A comprehensive healthcare management platform designed to enhance patient experience and streamline medical operations.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <FeatureCard 
            icon={<Calendar className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-blue-600" strokeWidth={2} />}
            title="Easy Appointments"
            description="Book, reschedule, or cancel appointments with just a few clicks. Choose your preferred doctor and time slot."
            color="bg-blue-50 border-blue-200"
            delay="animate-slide-up"
          />
          <FeatureCard 
            icon={<Clock className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-green-600" strokeWidth={2} />}
            title="Real-Time Queue"
            description="Track your position in the queue and get estimated wait times. Never waste time in waiting rooms."
            color="bg-green-50 border-green-200"
            delay="animate-slide-up animate-delay-100"
          />
          <FeatureCard 
            icon={<Users className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-purple-600" strokeWidth={2} />}
            title="Multi-Role Access"
            description="Separate dashboards for patients, doctors, and administrators with role-specific features."
            color="bg-purple-50 border-purple-200"
            delay="animate-slide-up animate-delay-200"
          />
          <FeatureCard 
            icon={<Activity className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-orange-600" strokeWidth={2} />}
            title="Live Updates"
            description="Receive real-time notifications about appointments and queue status via SMS and email."
            color="bg-orange-50 border-orange-200"
            delay="animate-slide-up animate-delay-300"
          />
          <FeatureCard 
            icon={<Shield className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-red-600" strokeWidth={2} />}
            title="Secure & Private"
            description="Your medical data is protected with enterprise-grade security and HIPAA compliance."
            color="bg-red-50 border-red-200"
            delay="animate-slide-up animate-delay-400"
          />
          <FeatureCard 
            icon={<Hospital className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-indigo-600" strokeWidth={2} />}
            title="Complete Management"
            description="Comprehensive system for OPD, queue, patient management, and medical records."
            color="bg-indigo-50 border-indigo-200"
            delay="animate-slide-up animate-delay-500"
          />
        </div>

        {/* Stats Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-12 text-white animate-scale-in hover-glow">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12 animate-fade-in leading-tight">Our Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
            <StatCard number="10,000+" label="Happy Patients" icon={<Users className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 animate-bounce-slow" strokeWidth={2.5} />} delay="animate-slide-up" />
            <StatCard number="500+" label="Expert Doctors" icon={<Stethoscope className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 animate-bounce-slow" strokeWidth={2.5} />} delay="animate-slide-up animate-delay-100" />
            <StatCard number="50+" label="Departments" icon={<Hospital className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 animate-bounce-slow" strokeWidth={2.5} />} delay="animate-slide-up animate-delay-200" />
            <StatCard number="24/7" label="Emergency Care" icon={<Ambulance className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-1 sm:mb-2 animate-pulse" strokeWidth={2.5} />} delay="animate-slide-up animate-delay-300" />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 border-2 border-blue-100 animate-slide-up hover-lift">
          <div className="text-center max-w-3xl mx-auto">
            <HeartPulse className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4 sm:mb-6 animate-pulse-slow" strokeWidth={2} />
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 animate-fade-in leading-tight px-4">Ready to Experience Better Healthcare?</h3>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 animate-fade-in animate-delay-100 leading-relaxed px-4">
              Join thousands of patients who trust MediFlow for their healthcare needs. Register now and get instant access to our services.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-slide-up animate-delay-200">
              <Link 
                href="/register" 
                className="flex items-center justify-center space-x-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base md:text-lg font-bold shadow-lg hover:shadow-xl hover-lift whitespace-nowrap"
              >
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" strokeWidth={2.5} />
                <span>Register Now</span>
              </Link>
              <a 
                href="#footer" 
                className="flex items-center justify-center space-x-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm sm:text-base md:text-lg font-bold hover-lift whitespace-nowrap cursor-pointer"
              >
                <Phone className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" strokeWidth={2.5} />
                <span>Contact Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer id="footer" className="bg-gray-900 text-white mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Hospital className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0" />
                <span className="text-lg sm:text-xl font-bold">MediFlow</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                Modern hospital management for better patient care.
              </p>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><button onClick={scrollToTop} className="hover:text-white transition text-left">Home</button></li>
                <li><Link href="/register" className="hover:text-white transition">Get Started</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
                <li><a href="#features" className="hover:text-white transition cursor-pointer">Features</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4">For Patients</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition">Book Appointment</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Queue Status</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Medical Records</Link></li>
                <li><Link href="/register" className="hover:text-white transition">Register Now</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="leading-relaxed">Emergency: +977 01-1234567</li>
                <li className="leading-relaxed break-all">Email: info@mediflow.com</li>
                <li className="leading-relaxed">Address: Kathmandu, Nepal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2025 MediFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, delay }: { icon: React.ReactNode; title: string; description: string; color: string; delay?: string }) {
  return (
    <div className={`${color} p-5 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group hover-lift ${delay || ''}`}>
      <div className="mb-4 sm:mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{icon}</div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">{title}</h3>
      <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label, icon, delay }: { number: string; label: string; icon: React.ReactNode; delay?: string }) {
  return (
    <div className={`transform hover:scale-110 transition-transform ${delay || ''}`}>
      {icon}
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-1 sm:mb-2 leading-tight">{number}</div>
      <div className="text-blue-100 text-xs sm:text-sm md:text-base lg:text-lg leading-tight whitespace-nowrap">{label}</div>
    </div>
  );
}
