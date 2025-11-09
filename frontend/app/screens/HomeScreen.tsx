"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ROUTES } from "../lib/routes";

const scenarioCards = [
  {
    title: "Barista Practice",
    subtitle: "Master the friendly order",
    description:
      "Build baseline confidence by speaking with a supportive AI barista who guides you through every step of the drink order.",
    icon: "☕",
    gradient: ["#f8f6f1", "#efe0c8"],
    route: ROUTES.SESSION,
    action: "Start Barista Flow",
    highlights: ["Guided prompts", "Order checklist", "Beginner friendly"],
  },
  {
    title: "Customer Rush Practice",
    subtitle: "Handle the high-pressure guest",
    description:
      "Step into the bustle of a morning rush. Respond to a stressed customer, send status updates, and keep calm under pressure.",
    icon: "⚡",
    gradient: ["#f0ede5", "#d9d3c6"],
    route: ROUTES.CUSTOMER,
    action: "Handle the Rush",
    highlights: ["Realistic urgency", "Live transcript", "Rapid feedback"],
  },
] as const;

const features = [
  {
    title: "Human-like Dialogue",
    description: "Natural pacing, personalized prompts, and rich barista voice lines keep every exchange feeling real.",
    icon: "🗣️",
    iconBg: "bg-green-100",
  },
  {
    title: "Privacy First",
    description: "Sessions run in the browser. No raw audio leaves your device—only the insights you choose to save.",
    icon: "🔒",
    iconBg: "bg-green-100",
  },
  {
    title: "Instant Coaching",
    description: "Gemini-powered analysis scores clarity, pronunciation, and fluency and suggests what to try next.",
    icon: "📊",
    iconBg: "bg-green-100",
  },
] as const;

const howItWorks = [
  {
    step: 1,
    stepLabel: "Step one",
    title: "Pick your practice",
    description: "Select the barista baseline flow or the customer rush challenge.",
    cta: "Explore scenarios",
  },
  {
    step: 2,
    stepLabel: "Step two",
    title: "Speak with AI",
    description: "Talk naturally; the AI responds instantly with realistic voice and transcript.",
    cta: "Start talking",
  },
  {
    step: 3,
    stepLabel: "Step three",
    title: "Review insights",
    description: "See word pace, filler words, and coaching tips so you improve every attempt.",
    cta: "See feedback",
  },
] as const;

const impactStats = [
  { value: "2x", label: "Faster to confident response", detail: "vs. self-practice without coaching" },
  { value: "92%", label: "Felt calmer after one session", detail: "Pilot participants reported reduced anxiety" },
  { value: "60s", label: "AI feedback turnaround", detail: "Full Gemini analysis in under a minute" },
] as const;

const testimonials = [
  {
    quote:
      "The rush scenario felt just like a busy morning at the cafe. I could feel my answers getting smoother each round.",
    name: "Imani",
    role: "Hospitality student",
  },
  {
    quote:
      "Hearing the AI voice and seeing my transcript together helped me spot where I was hesitating. Feedback was instant.",
    name: "Leo",
    role: "Speech therapy client",
  },
  {
    quote: "I finally have a way to practice without asking friends to pretend to be customers. Huge confidence boost.",
    name: "Marissa",
    role: "ESL learner",
  },
] as const;

const HomeScreen = () => {
  const router = useRouter();

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #fbf6ee 0%, #f2e6d7 45%, #eadbc7 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-transparent" />
      <main className="relative z-10">
      {/* Hero Section with Warm Beige Background */}
      <section className="relative w-full flex items-center justify-center py-24 md:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto text-center">
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
            className="text-lg md:text-xl lg:text-2xl mt-6 mb-10 max-w-5xl mx-auto leading-relaxed"
            style={{ color: '#6b7280' }}
          >
            Perfect for managing speech anxiety, stuttering, or learning a new language. Build confidence through realistic AI conversations in a judgment-free environment.
          </motion.p>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap"
          >
            <button
              onClick={() => router.push(ROUTES.CUSTOMER)}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-lg text-white shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
              style={{ backgroundColor: '#80a66e' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d8f5d'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#80a66e'}
            >
              <Image
                src="/coffee-cup.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
                aria-hidden="true"
              />
              <span>Try Ordering Coffee</span>
            </button>

            <button
              onClick={() => router.push(ROUTES.FILLER_WORDS)}
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold rounded-lg text-white shadow-sm hover:shadow-md transition-all duration-200 focus:ring-4 focus:ring-opacity-50 focus:outline-none cursor-pointer"
              style={{ backgroundColor: '#5b8cff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4a74d1'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5b8cff'}
            >
              <span>🎤</span>
              <span>Crush Filler Words</span>
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

      {/* Scenario Showcase */}
      <section
        className="relative z-10 w-full px-4 sm:px-6 lg:px-8 -mt-8"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.65) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {scenarioCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-[32px] border border-white/50 shadow-[0_30px_80px_rgba(60,55,45,0.12)] backdrop-blur-sm"
                style={{
                  backgroundImage: `linear-gradient(180deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
                <div className="relative flex h-full flex-col gap-6 px-10 py-12 md:px-12 md:py-14">
                  <div className="flex items-center gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-3xl text-[#80a66e] shadow-inner shadow-white/40">
                      {card.icon}
                    </span>
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-[0.35em] text-[#848074]">Scenario {index + 1}</p>
                      <h3 className="text-2xl md:text-3xl font-bold text-[#3c372d]">{card.title}</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#6b665c]">
                      {card.subtitle}
                    </p>
                    <p className="text-base leading-relaxed text-[#4f473f]">{card.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {card.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="rounded-full border border-white/60 bg-white/45 px-4 py-1.5 text-xs font-semibold text-[#5b5248] shadow-sm backdrop-blur"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => router.push(card.route)}
                      className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                      style={{ background: 'linear-gradient(to right, #80a66e, #6B7D5C)' }}
                    >
                      {card.action}
                      <span aria-hidden className="text-lg">→</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards - Light Cards with Subtle Shadows */}
      <section
        className="relative z-10 w-full py-16 md:py-24 -mt-12 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)' }}
      >
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
                <p className="text-base md:text-lg leading-relaxed grow" style={{ color: '#6b7280' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="w-full py-20 md:py-32 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.6) 100%)' }}
      >
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

      {/* Impact Metrics */}
      <section
        className="w-full py-20 md:py-28 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(180deg, #eadbc7 0%, #e6d6c2 100%)' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7b6b57]">Real results</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-black text-[#3c372d]">What early testers experienced</h2>
          <p className="mt-4 text-base md:text-lg text-[#6b645a] max-w-3xl mx-auto">
            We piloted EchoLag with hospitality students, ESL learners, and speech therapy clients. Here’s what they
            told us after just a few sessions.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {impactStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl bg-white/80 p-8 shadow-[0_20px_60px_rgba(60,55,45,0.14)] border border-white/60 backdrop-blur"
              >
                <p className="text-5xl font-black text-[#80a66e]">{stat.value}</p>
                <p className="mt-3 text-lg font-semibold text-[#3c372d]">{stat.label}</p>
                <p className="mt-2 text-sm text-[#6b665c]">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
        className="w-full py-20 md:py-24 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.7) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7b6b57]">Voices from the floor</p>
            <h2 className="mt-3 text-4xl md:text-5xl font-black text-[#3c372d]">
              Confidence stories from our pilot crew
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.name}
                className="rounded-3xl bg-white shadow-[0_22px_55px_rgba(60,55,45,0.12)] border border-white/70 p-8 h-full flex flex-col"
              >
                <p className="text-lg leading-relaxed text-[#5b5248] grow">“{testimonial.quote}”</p>
                <figcaption className="mt-6 pt-4 border-t border-[#e9e1d5] text-left">
                  <p className="text-sm font-semibold text-[#3c372d]">{testimonial.name}</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#a5998a]">{testimonial.role}</p>
                </figcaption>
              </figure>
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
            <Image
                src="/favicon.ico"
                alt="EchoLag Logo"
                width={24}
                height={24}
                priority
              />
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
      </main>
    </div>
  );
};

export default HomeScreen;
