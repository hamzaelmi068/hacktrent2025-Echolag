"use client";

import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "../lib/routes";

const NavigationBar = () => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(139, 157, 131, 0.2)' }}
            >
              <Image
                src="/favicon.ico"
                alt="EchoLag Logo"
                width={24}
                height={24}
                priority
              />
            </div>
            <span className="text-xl font-bold" style={{ color: '#3c372d' }}>EchoLag</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {/* How It Works - scrolls to section */}
            <a 
              href="#how-it-works" 
              className="font-medium transition-colors cursor-pointer"
              style={{ color: '#6b7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#80a66e'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              How It Works
            </a>

            {/* Scenarios Dropdown */}
            <div className="relative group">
              <button 
                className="font-medium transition-colors flex items-center gap-1 cursor-pointer"
                style={{ color: '#6b7280' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#80a66e'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
              >
                Scenarios
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 space-y-2">
                  <Link 
                    href={ROUTES.SESSION}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 157, 131, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-2xl">☕</span>
                    <div>
                      <p className="font-medium" style={{ color: '#3c372d' }}>General Scenario</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>Choose your own scenario for practice!</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href={ROUTES.CUSTOMER}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 157, 131, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-medium" style={{ color: '#3c372d' }}>Barista Practice</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>Guided coffee order flow</p>
                    </div>
                  </Link>
                  
                  <Link 
                    href={ROUTES.FILLER_WORDS}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(139, 157, 131, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-2xl">🎤</span>
                    <div>
                      <p className="font-medium" style={{ color: '#3c372d' }}>Crush Filler Words</p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>Eliminate “um” in minutes</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* About */}
            <Link 
              href="#about" 
              className="font-medium transition-colors cursor-pointer"
              style={{ color: '#6b7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#80a66e'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
            >
              About
            </Link>

            {/* Primary CTA Button */}
            <Link href="/customer">
              <button 
                className="px-6 py-2.5 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                style={{ 
                  background: 'linear-gradient(to right, #80a66e, #6B7D5C)'
                }}
              >
              <Image
                src="/coffee-cup.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
                aria-hidden="true"
              />
                Try Free
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
