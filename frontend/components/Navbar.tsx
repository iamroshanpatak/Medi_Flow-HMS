'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hospital, Menu, X, Bell, User } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    name?: string;
    role: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  const displayName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.name || 'User';

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Hospital className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">MediFlow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <Link
                  href="/"
                  className={`${
                    isActive('/') ? 'text-primary-600' : 'text-gray-700'
                  } hover:text-primary-600 transition`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`${
                    isActive('/about') ? 'text-primary-600' : 'text-gray-700'
                  } hover:text-primary-600 transition`}
                >
                  About
                </Link>
                <Link
                  href="/services"
                  className={`${
                    isActive('/services') ? 'text-primary-600' : 'text-gray-700'
                  } hover:text-primary-600 transition`}
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className={`${
                    isActive('/contact') ? 'text-primary-600' : 'text-gray-700'
                  } hover:text-primary-600 transition`}
                >
                  Contact
                </Link>
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <button 
                  className="p-2 text-gray-600 hover:text-primary-600 transition"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell className="h-6 w-6" />
                </button>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-primary-600"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t animate-slide-in">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-600"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-600"
            >
              About
            </Link>
            <Link
              href="/services"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-600"
            >
              Services
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-600"
            >
              Contact
            </Link>
            {!user && (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md bg-primary-600 text-white text-center hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
