"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { HERO_TAGLINE } from "../lib/placeholders";
import { ROUTES } from "../lib/routes";

const features = [
  { 
    title: "Zero Latency", 
    description: "Preloaded AI responses ensure natural conversation flow without awkward delays or buffering.",
    icon: "⚡",
    iconBg: "bg-green-100"
  },
  { 
    title: "Private Practice", 
    description: "Practice in complete privacy. No human judgment, no recording, just you and supportive AI.",
    icon: "🔒",
    iconBg: "bg-green-100"
  },
  { 
    title: "Actionable Feedback", 
    description: "Get detailed metrics on pace, pauses, and filler words plus personalized improvement tips.",
    icon: "📊",
    iconBg: "bg-green-100"
  },
] as const;

const howItWorks = [
  {
    step: 1,
    stepLabel: "Step one",
    title: "Choose a scenario",
    description: "Select from real-world conversation scenarios",
    cta: "Start"
  },
  {
    step: 2,
    stepLabel: "Step two",
    title: "Practice speaking",
    description: "Engage with AI in a natural, low-pressure environment",
    cta: "Begin"
  },
  {
    step: 3,
    stepLabel: "Step three",
    title: "Get instant feedback",
    description: "Receive actionable insights to improve your communication",
    cta: "Review"
  },
] as const;

const HomeScreen = () => {
  const router = useRouter();

  return (
    <div className="w-full" style={{ backgroundColor: '#f8f6f1' }}>
      {/* Hero Section with Warm Beige Background */}
      <section className="relative w-full flex items-center justify-center py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden" style={{ backgroundColor: '#f8f6f1' }}>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Social Proof Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white shadow-sm border border-gray-200 mb-6"
          >
            <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
            <span className="font-semibold" style={{ color: '#3c372d' }}>4.8/5</span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600">1,000+ students practicing daily</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-tight"
            style={{ color: '#3c372d' }}
          >
            Practice everyday conversations
            <br />
            <span style={{ color: '#80a66e' }}>
              without the pressure
            </span>
          </motion.h1>
          
          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl mt-6 mb-10 max-w-3xl mx-auto leading-relaxed"
            style={{ color: '#6b7280' }}
          >
            Perfect for managing speech anxiety, stuttering, or learning a new language. Build confidence through realistic AI conversations in a judgment-free environment.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => router.push(ROUTES.SESSION)}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-lg text-white shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
              style={{ backgroundColor: '#80a66e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d8f5d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#80a66e'}
            >
              <span>☕</span>
              <span>Try Ordering Coffee</span>
            </button>
            
            <button
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-medium rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
              style={{ 
                backgroundColor: '#f8f6f1',
                borderColor: '#d1aa78',
                color: '#3c372d'
              }}
            >
              <span>▶</span>
              <span>Watch Demo</span>
            </button>
          </motion.div>
          
          {/* Below CTA Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-sm mt-6"
            style={{ color: '#9ca3af' }}
          >
            No signup required • 2 minute session
          </motion.p>
        </div>
      </section>

      {/* Feature Cards - Light Cards with Subtle Shadows */}
      <section className="relative z-10 w-full py-16 md:py-24 -mt-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 min-h-[280px] flex flex-col"
              >
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-full ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl" style={{ color: '#80a66e' }}>{feature.icon}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#3c372d' }}>
                  {feature.title}
                </h3>
                
                {/* Description */}
                <p className="text-base md:text-lg leading-relaxed flex-grow" style={{ color: '#6b7280' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f8f6f1' }}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#80a66e' }}>
              Features
            </p>
            <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#3c372d' }}>
              How EchoLag works
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6b7280' }}>
              Designed to help you speak with confidence
            </p>
          </div>
          
          {/* Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines (Desktop Only) */}
            <div className="hidden md:block absolute top-24 left-1/3 right-1/3 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#d1d5db' }} />
            
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-gray-200 relative"
              >
                {/* Step Badge */}
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-6 shadow-sm" style={{ backgroundColor: '#80a66e' }}>
                  <span className="text-2xl font-black text-white">{step.step}</span>
                </div>
                
                {/* Step Label */}
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>
                  {step.stepLabel}
                </p>
                
                {/* Step Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#3c372d' }}>
                  {step.title}
                </h3>
                
                {/* Step Description */}
                <p className="text-base leading-relaxed mb-6" style={{ color: '#6b7280' }}>
                  {step.description}
                </p>
                
                {/* Step CTA Link */}
                <a
                  href="#"
                  className="font-semibold inline-flex items-center gap-1 transition-colors duration-200 group cursor-pointer"
                  style={{ color: '#80a66e' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6d8f5d'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#80a66e'}
                >
                  {step.cta}
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#5e594e' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-6">
            {/* Logo */}
            <div className="flex items-center justify-center gap-2 text-white">
              <span className="text-2xl">🎙️</span>
              <span className="text-xl font-bold">EchoLag</span>
            </div>
            
            {/* Tagline */}
            <p className="text-sm max-w-md mx-auto" style={{ color: '#d1d5db' }}>
              Build confidence through realistic AI conversations in a judgment-free environment.
            </p>
            
            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm" style={{ color: '#d1d5db' }}>
              <a href="#how-it-works" className="hover:text-white transition-colors duration-200 cursor-pointer">How It Works</a>
              <span>•</span>
              <a href="#about" className="hover:text-white transition-colors duration-200 cursor-pointer">About</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors duration-200 cursor-pointer">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors duration-200 cursor-pointer">Terms of Service</a>
              <span>•</span>
              <a href="mailto:hello@echolag.com" className="hover:text-white transition-colors duration-200 cursor-pointer">Contact Us</a>
            </div>
            
            {/* Copyright */}
            <div className="pt-6 border-t" style={{ borderColor: '#6b7280' }}>
              <p className="text-xs" style={{ color: '#9ca3af' }}>
                © 2024 EchoLag. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeScreen;
