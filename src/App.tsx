/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Award, 
  Shield, 
  Users, 
  HeartHandshake, 
  GraduationCap, 
  Droplet, 
  Sparkles, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  ArrowRight,
  ChevronRight,
  Clock,
  Phone,
  Lock,
  Menu,
  X,
  Plus,
  Star,
  MessageSquare
} from 'lucide-react';
import { SiteContent } from './types';
import MembershipForm from './components/MembershipForm';
import AdminDashboard from './components/AdminDashboard';

// Default layout values while loading
const defaultContent: SiteContent = {
  hero: {
    title: "SPSC RED CRESCENT",
    subtitle: "SENA PUBLIC SCHOOL AND COLLEGE RED CRESCENT SOCIETY",
    tagline: "Lead. Serve. Inspire."
  },
  about: "SPSC Red Crescent Society (SPSCRCS) is a newly established student volunteer initiative dedicated to humanity, leadership, community service, teamwork, first-aid awareness, and positive social impact.\n\nWe aim to assist in emergency preparedness and foster a lifelong spirit of volunteerism and responsible citizenship among active youth.",
  whyJoin: [
    {
      id: "wj-1",
      emoji: "❤️",
      title: "Serve Humanity",
      description: "Engage in direct community welfare activities and stand beside those in times of critical need."
    },
    {
      id: "wj-2",
      emoji: "🩹",
      title: "Learn First Aid",
      description: "Acquire certified emergency response and life-saving first aid skills that prepare you for real-world scenarios."
    },
    {
      id: "wj-3",
      emoji: "🌍",
      title: "Create Social Impact",
      description: "Lead and participate in environmental cleaning campaigns, health awareness drives, and humanitarian aid."
    },
    {
      id: "wj-4",
      emoji: "🤝",
      title: "Build Leadership",
      description: "Take responsibility for managing volunteer units, organizing massive-scale events, and speaking publicly."
    },
    {
      id: "wj-5",
      emoji: "✨",
      title: "Grow With Teamwork",
      description: "Join a group of passionate peers, build lasting friendships, and learn how to collaborate effectively."
    },
    {
      id: "wj-6",
      emoji: "🚀",
      title: "Develop Future Skills",
      description: "Develop critical communication, organizational, emergency planning, and career-boosting soft skills."
    }
  ],
  activities: [
    { id: "act-1", title: "Community Service", description: "Cleanups, medical distribution, and local school support programs.", iconName: "HeartHandshake" },
    { id: "act-2", title: "Volunteer Training", description: "Workshops preparing students to handle volunteer operations and crisis.", iconName: "GraduationCap" },
    { id: "act-3", title: "First Aid Awareness", description: "Teaching core medical, rescue guidance, and safety standards.", iconName: "Activity" },
    { id: "act-4", title: "Blood Donation Support", description: "Promoting awareness and organizing direct student blood donation rosters.", iconName: "Droplet" },
    { id: "act-5", title: "Youth Development", description: "Fostering active student leaders who manage clubs, command respect, and act as role models.", iconName: "Sparkles" }
  ],
  feedbacks: [],
  leadership: {
    teacher: {
      name: "Kaizer Muhammad Bhuiyan",
      role: "Teacher in Charge",
      contact: "+880 1811-143652"
    },
    unitLeader: "Coming Soon",
    teamLeaders: "Coming Soon",
    executiveTeam: "Coming Soon"
  },
  socials: {
    facebook: "https://www.facebook.com/share/1FBmLACNvD/",
    instagram: "https://www.instagram.com/spscredcrescent",
    whatsapp: "01335113532"
  }
};

export default function App() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  
  // Scroll progress state
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Feedback Form State
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [fbName, setFbName] = useState('');
  const [fbRole, setFbRole] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbQuote, setFbQuote] = useState('');
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbSuccess, setFbSuccess] = useState<string | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbError(null);
    setFbSuccess(null);
    setFbSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fbName,
          role: fbRole,
          quote: fbQuote,
          rating: fbRating
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setFbSuccess('Thank you! Your feedback has been published.');
      setFbName('');
      setFbRole('');
      setFbRating(5);
      setFbQuote('');
      
      // Pull fresh data to show feedback instantly in UI
      const contentRes = await fetch('/api/content');
      if (contentRes.ok) {
        const freshContent = await contentRes.json();
        setContent(freshContent);
      }
      
      setTimeout(() => {
        setShowFeedbackForm(false);
        setFbSuccess(null);
      }, 3000);

    } catch (err: any) {
      setFbError(err.message);
    } finally {
      setFbSubmitting(false);
    }
  };

  // Monitor scroll for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const currentProgress = (window.scrollY / totalScroll) * 100;
        setScrollProgress(currentProgress);
      } else {
        setScrollProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (e) {
      console.error('Failed to pull updated content, using defaults:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenu(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Icon switcher helper for dynamic names
  const renderActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-red-500" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-red-500" />;
      case 'Activity':
        return <Activity className="w-6 h-6 text-red-500" />;
      case 'Droplet':
        return <Droplet className="w-6 h-6 text-red-500" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-red-500" />;
      default:
        return <Heart className="w-6 h-6 text-red-500" />;
    }
  };

  if (isAdminOpen) {
    return (
      <AdminDashboard 
        onClose={() => setIsAdminOpen(false)} 
        siteContent={content} 
        onRefreshContent={fetchContent}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100 font-sans selection:bg-[#E01A22] selection:text-white">
      
      {/* Scroll-Triggered Progress Bar */}
      <div 
        id="scroll-progress-bar-container"
        className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-50 pointer-events-none"
      >
        <div 
          id="scroll-progress-bar-indicator"
          className="h-full bg-[#E01A22] transition-all duration-75 ease-out shadow-[0_0_8px_rgba(224,26,34,0.7)]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Dynamic Header */}
      <nav id="app-navigation-bar" className="fixed top-0 left-0 w-full z-45 bg-[#080808]/90 backdrop-blur-md border-b border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Group */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-10 h-10 bg-[#E01A22] rounded-full flex items-center justify-center shadow-lg shadow-[#E01A22]/25 relative">
                {/* Crescent Moon Shape */}
                <span className="text-white text-xl font-bold font-mono rotate-12 select-none pb-0.5">☾</span>
              </div>
              <div>
                <span className="font-sans font-extrabold text-base tracking-wider text-white">SPSC RED CRESCENT</span>
                <span className="text-[9px] block text-[#E01A22] font-mono tracking-widest uppercase leading-none font-bold">SPSCRCS OFFICIAL BODY</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
              <button onClick={() => scrollToSection('about')} className="text-zinc-400 hover:text-white transition duration-150">About</button>
              <button onClick={() => scrollToSection('why-join')} className="text-zinc-400 hover:text-white transition duration-150">Benefits</button>
              <button onClick={() => scrollToSection('activities')} className="text-zinc-400 hover:text-white transition duration-150">Activities</button>
              <button onClick={() => scrollToSection('leadership')} className="text-zinc-400 hover:text-white transition duration-150">Leadership</button>
              <button onClick={() => scrollToSection('feedback')} className="text-zinc-400 hover:text-white transition duration-150">Feedback</button>
              
              <button 
                onClick={() => scrollToSection('membership')} 
                className="bg-[#E01A22] hover:bg-[#E01A22]/90 active:scale-98 text-white px-5 py-2.5 rounded-xl transition duration-150 shadow-md shadow-[#E01A22]/15 font-semibold"
              >
                Join Society
              </button>
            </div>

            {/* Hamburger */}
            <button 
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden text-zinc-400 hover:text-white p-2"
            >
              {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenu && (
          <div className="md:hidden bg-[#0c0c0c]/98 border-b border-white-5 px-4 pt-2 pb-6 space-y-4">
            <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 text-zinc-300 hover:text-white text-sm">About</button>
            <button onClick={() => scrollToSection('why-join')} className="block w-full text-left py-2 text-zinc-300 hover:text-white text-sm">Benefits</button>
            <button onClick={() => scrollToSection('activities')} className="block w-full text-left py-2 text-zinc-300 hover:text-white text-sm">Activities</button>
            <button onClick={() => scrollToSection('leadership')} className="block w-full text-left py-1 text-zinc-300 hover:text-white text-sm">Leadership</button>
            <button onClick={() => scrollToSection('feedback')} className="block w-full text-left py-1 text-zinc-300 hover:text-white text-sm">Feedback</button>
            <button 
              onClick={() => scrollToSection('membership')} 
              className="block w-full text-center bg-[#E01A22] text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-[#E01A22]/90 transition"
            >
              Join System
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header 
        id="hero-banner" 
        className="relative min-h-screen flex items-center justify-center pt-28 pb-20 px-4 overflow-hidden"
      >
        {/* Background Visual Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/spsc_rc_hero_bg_1781783451054.jpg" 
            alt="Humanitarian Background" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25 filter scale-102 transition duration-[3000ms]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/85 to-transparent"></div>
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#080808]/30 to-[#080808]"></div>
        </div>

        {/* Hero Interactive Elements */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-[#E01A22]/10 border border-[#E01A22]/20 px-4 py-2 rounded-full text-xs text-red-400 font-mono tracking-widest uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-[#E01A22] animate-pulse"></span>
            <span>Est. 2026 • SENA PUBLIC SCHOOL & COLLEGE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            {content.hero.title}
          </h1>

          <p className="text-[#E01A22] text-sm sm:text-lg font-mono tracking-widest uppercase font-semibold glow-red">
            {content.hero.subtitle}
          </p>

          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed">
            Guiding students to{' '}
            <span className="text-white font-semibold underline decoration-2 decoration-[#E01A22] underline-offset-4">{content.hero.tagline}</span>. Join our newly established initiative to represent mercy, help those in emergency scenarios, and become responsible youth citizens.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <button
              onClick={() => scrollToSection('membership')}
              className="bg-[#E01A22] hover:bg-[#E01A22]/90 active:scale-98 text-white px-8 py-4 rounded-xl text-base font-semibold transition duration-200 shadow-xl shadow-[#E01A22]/20 hover:shadow-[#E01A22]/40 relative group overflow-hidden"
            >
              <span className="relative z-10">Join as a Member</span>
              <div className="absolute inset-0 bg-[#E01A22]/80 -translate-y-full hover:translate-y-0 transition duration-300 rounded-xl z-0"></div>
            </button>

            <button
              onClick={() => scrollToSection('about')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 active:scale-98 text-zinc-200 hover:text-white rounded-xl text-base font-semibold transition duration-200 border border-white-10"
            >
              Explore Our Mission
            </button>
          </div>


        </div>

        {/* Decorative corner accents */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-zinc-500 text-xs font-mono tracking-widest uppercase animate-bounce mt-4 pl-2">
          <span>Scroll down</span>
          <ArrowRight className="w-3.5 h-3.5 transform rotate-90" />
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 bg-[#080808] relative border-t border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Header */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[#E01A22] font-mono uppercase text-xs tracking-wider">OFFICIAL HUMANITARIAN CHARGE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Who We Are</h2>
              <div className="w-12 h-1 bg-[#E01A22] rounded"></div>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed pt-2 antialiased">
                SPSCRCS is built on the universal values of volunteerism, medical assistance preparedness, climate support, and social resilience. We equip school students with real leadership opportunities.
              </p>
            </div>

            {/* Right Card content */}
            <div className="lg:col-span-7 bg-[#121212]/90 backdrop-blur border border-white-5 p-6 sm:p-10 rounded-2xl relative">
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#E01A22]/10 rounded-xl flex items-center justify-center border border-[#E01A22]/20 text-red-400">
                <Heart className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-6">
                <p className="text-zinc-200 text-lg font-sans leading-relaxed whitespace-pre-line antialiased">
                  {content.about}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white-5">
                  <div className="p-4 bg-[#080808] rounded-xl border border-white-5">
                    <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase block">Objective</span>
                    <span className="text-sm font-semibold text-white mt-1 block">Help Selflessly</span>
                  </div>
                  <div className="p-4 bg-[#080808] rounded-xl border border-white-5">
                    <span className="text-xs text-zinc-500 font-mono tracking-wider uppercase block">Core Focus</span>
                    <span className="text-sm font-semibold text-white mt-1 block">First-Aid Awareness</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section id="why-join" className="py-24 bg-[#0a0a0a] border-t border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#E01A22] font-mono tracking-wider font-semibold uppercase">BENEFITS & OPPORTUNITIES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Why Join Our Society?</h2>
            <p className="text-zinc-400 text-sm">Become a force of change on campus. Build characters, skills, and values.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.whyJoin.map((card) => (
              <div 
                key={card.id}
                className="bg-[#121212] hover:bg-[#161616] border border-white-5 hover:border-[#E01A22]/30 rounded-2xl p-6 transition-all duration-300 shadow-lg flex flex-col justify-between group hover:shadow-[#E01A22]/5"
              >
                <div>
                  <div className="text-3xl mb-4 transform group-hover:scale-110 transition duration-150 inline-block">
                    {card.emoji}
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {card.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center text-xs text-zinc-500 font-semibold group-hover:text-[#E01A22] transition">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Activities / Events Section */}
      <section id="activities" className="py-24 bg-[#080808] relative border-t border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-white-5 pb-6">
            <div>
              <span className="text-[#E01A22] font-mono text-xs uppercase tracking-wider block">YOUTH ENGAGEMENT OUTLINE</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">Our Activities</h2>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm">
              We focus on active campaigns, classroom awareness, community wellness, and dynamic healthcare helper projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {content.activities.map((act) => (
              <div 
                key={act.id} 
                className="bg-[#121212] hover:bg-[#161616] border border-white-5 p-6 rounded-2xl flex flex-col justify-between hover:translate-y-[-4px] transition-all duration-300 hover:shadow-xl group"
              >
                <div>
                  <div className="w-10 h-10 bg-[#E01A22]/10 text-[#E01A22] rounded-lg flex items-center justify-center mb-4 border border-[#E01A22]/20 group-hover:scale-105 transition">
                    {renderActivityIcon(act.iconName)}
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mb-2">{act.title}</h3>
                  <p className="text-xs text-zinc-450 leading-relaxed">{act.description}</p>
                </div>
                <span className="text-[10px] text-zinc-600 block mt-6 font-mono uppercase tracking-wider">ACTIVE INITIATIVE</span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="py-24 bg-[#0a0a0a] relative border-t border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs text-[#E01A22] font-mono tracking-wider font-semibold uppercase">SOCIETY GOVERNANCE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Representative Guide</h2>
            <p className="text-zinc-450 text-sm">Official, verified school coordinators. No fake accounts or claims.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Teacher In Charge (Always primary, highlighted) */}
            <div className="lg:col-span-4 bg-[#121212] border border-[#E01A22]/50 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden glow-red-box">
              <div className="absolute top-0 right-0 bg-[#E01A22] text-white text-[10px] uppercase font-mono tracking-widest px-4 py-1.5 rounded-bl-xl font-bold">
                Teacher-In-Charge
              </div>

              <div>
                <div className="w-16 h-16 bg-[#080808] rounded-full flex items-center justify-center text-[#E01A22] mb-6 border border-white-5">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white font-sans tracking-tight">{content.leadership.teacher.name}</h3>
                <p className="text-[#E01A22] text-xs font-mono uppercase tracking-wider mt-1">{content.leadership.teacher.role}</p>
                <p className="text-sm text-zinc-450 mt-4 leading-relaxed antialiased">
                  Sena Public School and College official supervisor guiding all high-school volunteering initiatives, health workshops, and emergency response teams.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white-5 flex items-center space-x-3">
                <div className="bg-[#E01A22]/10 p-2 text-[#E01A22] rounded-lg">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-mono">CONTACT</span>
                  <span className="text-sm font-semibold text-white tracking-widest">{content.leadership.teacher.contact}</span>
                </div>
              </div>
            </div>

            {/* Other Coming Soon Teams (Complies strictly with Content Rules!) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-[#080808] border border-white-5 w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 mb-4 font-mono font-bold">UL</div>
                  <h4 className="text-sm font-mono tracking-wider uppercase text-zinc-400">Unit Leader</h4>
                  <span className="text-base font-bold text-zinc-200 mt-2 block">{content.leadership.unitLeader}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-6 leading-relaxed">Student application process ongoing. Designated under Teacher direction.</p>
              </div>

              <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-[#080808] border border-white-5 w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 mb-4 font-mono font-bold">TL</div>
                  <h4 className="text-sm font-mono tracking-wider uppercase text-zinc-400">Team Leaders</h4>
                  <span className="text-base font-bold text-zinc-200 mt-2 block">{content.leadership.teamLeaders}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-6 leading-relaxed">SPSCRCS active core subgroup commanders. Appointments pending.</p>
              </div>

              <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="bg-[#080808] border border-white-5 w-10 h-10 rounded-lg flex items-center justify-center text-zinc-400 mb-4 font-mono font-bold">ET</div>
                  <h4 className="text-sm font-mono tracking-wider uppercase text-zinc-400">Executive Team</h4>
                  <span className="text-base font-bold text-zinc-200 mt-2 block">{content.leadership.executiveTeam}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-6 leading-relaxed">Volunteer activity planners, registration monitors, and task lists.</p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Member Feedback Section */}
      <section id="feedback" className="py-24 bg-[#080808] relative border-t border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white-5 pb-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs text-[#E01A22] font-mono tracking-wider font-semibold uppercase">COMMUNITY TESTIMONIALS</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white m-0">Member Feedback</h2>
              <p className="text-zinc-400 text-sm">Real stories, reviews, and feedback from active SPSC Red Crescent volunteers and students.</p>
            </div>
            
            {/* Toggle Form Button */}
            <button
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="bg-[#E01A22]/10 hover:bg-[#E01A22]/20 text-[#E01A22] border border-[#E01A22]/30 px-5 py-2.5 rounded-xl transition duration-150 inline-flex items-center space-x-2 text-sm font-semibold select-none cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{showFeedbackForm ? 'Close Form' : 'Write Feedback'}</span>
            </button>
          </div>

          {/* Feedback Submission Form Panel */}
          {showFeedbackForm && (
            <div className="bg-[#121212] border border-white-5 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto space-y-4 animate-fade-in relative">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Heart className="w-4 h-4 text-[#E01A22]" />
                <span>Share Your SPSC Red Crescent Journey</span>
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your voice inspires others! Let fellow students and teachers know about your volunteer, cleanup, or first aid experience with the club.
              </p>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5" htmlFor="fb-fullname">Full Name</label>
                    <input
                      id="fb-fullname"
                      type="text"
                      required
                      placeholder="e.g. Tasnim Rahman"
                      className="w-full bg-[#080808] border border-white-10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#E01A22] transition"
                      value={fbName}
                      onChange={(e) => setFbName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5" htmlFor="fb-role">Role or Class</label>
                    <input
                      id="fb-role"
                      type="text"
                      required
                      placeholder="e.g. Volunteer (SPSC Class 11)"
                      className="w-full bg-[#080808] border border-white-10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#E01A22] transition"
                      value={fbRole}
                      onChange={(e) => setFbRole(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5">Rating</label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFbRating(val)}
                        className="text-amber-550 hover:scale-110 active:scale-95 transition p-1 outline-none focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${val <= fbRating ? 'text-amber-500 fill-amber-500' : 'text-zinc-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-400 mb-1.5" htmlFor="fb-text">Your Feedback / Review</label>
                  <textarea
                    id="fb-text"
                    required
                    rows={3}
                    placeholder="Describe what you learned, your highlights from blood campaigns, or community activities..."
                    className="w-full bg-[#080808] border border-white-10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#E01A22] transition resize-none leading-relaxed"
                    value={fbQuote}
                    onChange={(e) => setFbQuote(e.target.value)}
                  />
                </div>

                {fbError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#E01A22] rounded-xl text-xs flex items-center space-x-2">
                    <span>⚠️ {fbError}</span>
                  </div>
                )}

                {fbSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center space-x-2">
                    <span>✅ {fbSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={fbSubmitting}
                    className="bg-[#E01A22] hover:bg-[#E01A22]/90 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md hover:shadow-[#E01A22]/15 text-sm disabled:opacity-55 cursor-pointer"
                  >
                    {fbSubmitting ? 'Publishing...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feedback Grid Cards */}
          {content.feedbacks && content.feedbacks.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {content.feedbacks.map((item) => (
                <div 
                  key={item.id}
                  className="bg-[#121212] border border-white-5 rounded-2xl p-6 flex flex-col justify-between hover:border-[#E01A22]/20 hover:scale-[1.01] transition duration-300 relative group"
                >
                  <div className="space-y-4">
                    {/* Rating Stars & Quote Icon */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < item.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-700'}`} />
                        ))}
                      </div>
                      <span className="text-zinc-600 text-3xl font-serif select-none pointer-events-none group-hover:text-[#E01A22]/30 transition leading-none">“</span>
                    </div>

                    {/* Feedback Text */}
                    <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed antialiased italic">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 pt-6 border-t border-white-5 mt-6">
                    {/* Avatar Circle with initials */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E01A22] to-red-800 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm block leading-none">{item.name}</span>
                      <span className="text-zinc-500 text-[10px] sm:text-xs block mt-1">{item.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Membership Registration Section */}
      <section id="membership" className="py-24 bg-[#0a0a0a] border-t border-white-5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          
          <div className="text-center max-w-xl mx-auto space-y-4">
            <span className="text-xs text-[#E01A22] font-mono tracking-widest font-semibold uppercase">MEMBERSHIP PORTAL</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-2">Become a Member</h2>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Step forward and sign up. Enter your verified details to apply. Registration data is kept safe, secure, and private on our server.
            </p>
          </div>

          <MembershipForm onSuccess={fetchContent} />

        </div>
      </section>

      {/* Join WhatsApp and Social Connect Section */}
      <section id="social-connect" className="py-20 bg-[#080808] border-y border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#121212] border border-white-5 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="space-y-4 relative z-10 max-w-lg text-center lg:text-left">
              <span className="text-xs text-emerald-400 font-mono uppercase tracking-widest">REAL-TIME COMMUNICATIONS</span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight">Connect with Us Directly</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Stay updated instantly on upcoming first aid courses, emergency support drives, and general meetings via our official channels.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
              <a 
                href={content.socials.facebook} 
                target="_blank" 
                rel="noreferrer"
                className="bg-[#1877F2]/10 hover:bg-[#1877F2]/25 border border-[#1877F2]/20 hover:border-[#1877F2]/50 text-white px-6 py-3.5 rounded-xl transition duration-150 flex items-center justify-center space-x-2 text-sm font-semibold"
              >
                <Facebook className="w-5 h-5 text-[#1877F2]" />
                <span>Club Facebook</span>
              </a>

              <a 
                href={content.socials.instagram} 
                target="_blank" 
                rel="noreferrer"
                className="bg-gradient-to-tr from-[#f9ce34]/10 via-[#ee2a7b]/10 to-[#6228d7]/10 hover:from-[#f9ce34]/20 hover:to-[#6228d7]/20 border border-[#ee2a7b]/20 hover:border-[#ee2a7b]/50 text-white px-6 py-3.5 rounded-xl transition duration-150 flex items-center justify-center space-x-2 text-sm font-semibold"
              >
                <Instagram className="w-5 h-5 text-[#ee2a7b]" />
                <span>Club Instagram</span>
              </a>

              <a 
                href={`https://wa.me/${content.socials.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank" 
                rel="noreferrer"
                className="bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/50 text-white px-6 py-3.5 rounded-xl transition duration-150 flex items-center justify-center space-x-2 text-sm font-semibold"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400" />
                <span>WhatsApp: {content.socials.whatsapp}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[#080808] text-zinc-500 py-16 border-t border-white-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-center md:text-left">
            <div className="space-y-2">
              <span className="text-lg font-extrabold text-white tracking-widest uppercase">SPSCRCS</span>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Be Part of Our SPSC Red Crescent Society
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-400">
              <button onClick={() => scrollToSection('about')} className="hover:text-white transition">About</button>
              <button onClick={() => scrollToSection('why-join')} className="hover:text-white transition">Benefits</button>
              <button onClick={() => scrollToSection('activities')} className="hover:text-white transition">Activities</button>
              <button onClick={() => scrollToSection('leadership')} className="hover:text-white transition">Leadership</button>
              <button onClick={() => scrollToSection('feedback')} className="hover:text-white transition">Feedback</button>
            </div>
          </div>

          <div className="border-t border-white-5 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>© {new Date().getFullYear()} Sena Public School & College Red Crescent Society. All Rights Reserved.</p>
            <div className="flex items-center space-x-4">
              <span className="text-[#E01A22] font-mono font-bold">100% Volunteer Driven</span>
              <button 
                id="hidden-admin-trigger"
                onClick={() => setIsAdminOpen(true)}
                className="text-zinc-400 hover:text-[#E01A22] transition duration-150 flex items-center space-x-1.5 outline-none text-[10px] font-mono tracking-widest uppercase border border-white-5 px-3 py-1.5 rounded-lg bg-[#121212] hover:bg-[#161616]"
              >
                <Lock className="w-3 h-3" />
                <span>Staff Portal</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
