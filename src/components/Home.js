import React from 'react';
import {
  MessageSquare, BarChart2, BookOpen, ArrowRight, Heart,
  Shield, Zap, Clock, Lock, Smile, TrendingUp, CheckCircle
} from 'lucide-react';
import './Home.css';

/* ── Logo ── */
const NereidLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="home-logo-icon">
    <path d="M3 11C7 7 9 13 13 9C17 5 17 11 21 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <path d="M3 16C7 12 9 18 13 14C17 10 17 16 21 12" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 4L7.7 5.7L9.4 6.4L7.7 7.1L7 8.8L6.3 7.1L4.6 6.4L6.3 5.7L7 4Z" fill="#5eead4" />
    <circle cx="17" cy="17" r="1.2" fill="#5eead4" />
  </svg>
);

/* ── Companion illustration ── */
const CompanionIllustration = () => (
  <img
    src="/hero-illustration.png"
    alt="A calm illustrated companion seated in a cozy chair, holding a warm cup"
    className="home-illustration"
  />
);

/* ── Approach illustration: two abstract shapes side by side ── */
const ApproachIllustration = () => (
  <svg className="approach-illustration" viewBox="0 0 380 300" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-label="Abstract illustration of two connected elements" role="img">
    {/* Background shapes */}
    <ellipse cx="190" cy="160" rx="170" ry="130" fill="rgba(63,114,104,0.04)" />
    {/* Left shape - chat bubble / listening */}
    <rect x="30" y="60" width="140" height="100" rx="20" fill="rgba(63,114,104,0.12)" stroke="rgba(63,114,104,0.25)" strokeWidth="1.5" />
    <path d="M50 85 L150 85" stroke="rgba(63,114,104,0.4)" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 105 L130 105" stroke="rgba(63,114,104,0.3)" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 125 L115 125" stroke="rgba(63,114,104,0.2)" strokeWidth="2" strokeLinecap="round" />
    {/* Chat tail */}
    <path d="M60 160 L40 185 L80 160 Z" fill="rgba(63,114,104,0.12)" stroke="rgba(63,114,104,0.25)" strokeWidth="1.5" />
    {/* Right shape - trend / growth */}
    <rect x="210" y="50" width="140" height="120" rx="20" fill="rgba(44,83,75,0.09)" stroke="rgba(44,83,75,0.2)" strokeWidth="1.5" />
    <path d="M230 145 L260 110 L290 125 L330 75" stroke="#3F7268" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="260" cy="110" r="4" fill="#3F7268" />
    <circle cx="290" cy="125" r="4" fill="#3F7268" />
    <circle cx="330" cy="75" r="4" fill="#2C534B" />
    {/* Connecting arc */}
    <path d="M170 110 Q190 95 210 110" stroke="rgba(63,114,104,0.35)" strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 4" />
    {/* Bottom sparkle */}
    <path d="M190 230 L192 222 L194 230 L202 232 L194 234 L192 242 L190 234 L182 232 Z" fill="rgba(63,114,104,0.4)" />
    <circle cx="110" cy="220" r="5" fill="rgba(193,97,74,0.3)" />
    <circle cx="280" cy="225" r="4" fill="rgba(63,114,104,0.25)" />
  </svg>
);

const features = [
  { icon: <MessageSquare size={22} />, label: 'Talk it out', desc: 'Judgment-free conversations, any time. Nereid listens without interrupting, without judging.' },
  { icon: <BarChart2 size={22} />, label: 'Track your journey', desc: 'Revisit reflections and see mood trends over time — a quiet record of how far you\'ve come.' },
  { icon: <BookOpen size={22} />, label: 'Find your calm', desc: 'Guided breathing and grounding exercises when things feel like too much.' },
];

const qualities = [
  { icon: <Shield size={18} />, label: 'Private by design', desc: 'Everything stays on your device. No cloud sync, no data sold.' },
  { icon: <Clock size={18} />, label: 'Always available', desc: 'Open at 2 AM, during a lunch break, or whenever you need to process.' },
  { icon: <Zap size={18} />, label: 'Instant responses', desc: 'No waiting rooms, no appointments. Start a conversation in seconds.' },
  { icon: <Smile size={18} />, label: 'Warm & non-clinical', desc: 'Nereid speaks like a compassionate friend, not a medical report.' },
  { icon: <TrendingUp size={18} />, label: 'Mood insights', desc: 'See patterns in how you\'re feeling across days, weeks, and sessions.' },
  { icon: <Lock size={18} />, label: 'No judgment, ever', desc: 'You can say exactly how you feel — nothing is too small or too heavy.' },
];

const steps = [
  { n: '01', label: 'Open the app', desc: 'No sign-up, no profile to fill. You\'re in a calm space instantly.' },
  { n: '02', label: 'Start a conversation', desc: 'Say whatever is on your mind. Nereid listens and responds with care.' },
  { n: '03', label: 'Explore at your pace', desc: 'Browse resources, check your mood history, or simply close and come back.' },
];

const Home = ({ onEnterDashboard, onStartChat }) => {
  return (
    <div className="landing-page">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-text">Nereid</span>
          </div>
          <div className="landing-nav-links">
            <button className="landing-nav-link" onClick={() => document.getElementById('landing-features').scrollIntoView({ behavior: 'smooth' })}>How it works</button>
            <button className="landing-nav-link" onClick={() => document.getElementById('landing-approach').scrollIntoView({ behavior: 'smooth' })}>Our approach</button>
            <button className="landing-nav-link" onClick={() => document.getElementById('landing-safety').scrollIntoView({ behavior: 'smooth' })}>Support</button>
          </div>
          <button className="landing-nav-cta" onClick={onEnterDashboard} id="landing-open-app-btn">
            Open Nereid <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="hero-bg-radial" aria-hidden="true" />
        <div className="landing-hero-inner">
          <div className="hero-text-col">
            <span className="hero-eyebrow">Your compassionate AI companion</span>
            <h1 className="hero-headline">
              A calm space to talk,<br />whenever you need it.
            </h1>
            <p className="hero-subhead">
              Nereid listens without judgment, remembers your journey,
              and helps you find steadier ground any time of day.
            </p>
            <div className="hero-actions">
              <button className="btn-primary-lg" onClick={onStartChat} id="landing-start-talking-btn">
                Start talking <ArrowRight size={17} />
              </button>
              <button className="btn-ghost-lg" onClick={onEnterDashboard} id="landing-dashboard-btn">
                Open dashboard
              </button>
            </div>
          </div>
          <div className="hero-visual-col">
            <div className="hero-backdrop-ring" aria-hidden="true" />
            <CompanionIllustration />
          </div>
        </div>
        <div className="hero-wave-transition" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="var(--mist)" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="landing-features" id="landing-features">
        <div className="landing-section-inner">
          <div className="features-header">
            <p className="section-eyebrow">How Nereid helps</p>
            <h2 className="section-headline">Everything you need, gently in one place.</h2>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.label} className="feature-card">
                <div className="feature-icon-wrap">{f.icon}</div>
                <h3 className="feature-label">{f.label}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MY STORY / ABOUT NEREID ───────────────────────────────────── */}
      <section className="landing-story">
        <div className="landing-section-inner landing-story-grid">
          <div className="story-heading-col">
            <p className="section-eyebrow">About Nereid</p>
            <h2 className="section-headline">Finding steadier ground, one conversation at a time.</h2>
          </div>
          <div className="story-text-col">
            <p className="story-body">
              Sometimes the hardest part isn't what you're going through — it's having somewhere safe to say it out loud. Nereid was built for exactly those moments: the 3 AM restlessness, the midday spiral, the quiet dread you can't quite name.
            </p>
            <p className="story-body">
              We designed Nereid around one belief: that being heard — really heard, without rushing you toward a solution — is often the most healing thing of all. No appointments. No waitlists. No judgment. Just a calm, private space that's always open.
            </p>
            <p className="story-body">
              Nereid is not a replacement for therapy. It's the companion you reach for between sessions, or before you're ready to reach out to anyone else. A first step. A steady presence.
            </p>
          </div>
        </div>
      </section>

      {/* ── OUR APPROACH ─────────────────────────────────────────────── */}
      <section className="landing-approach" id="landing-approach">
        <div className="landing-section-inner landing-approach-grid">
          <div className="approach-visual-col">
            <ApproachIllustration />
          </div>
          <div className="approach-text-col">
            <p className="section-eyebrow">Our approach</p>
            <h2 className="section-headline">Listen first. Always.</h2>
            <p className="approach-body">
              Nereid is grounded in <strong>reflective listening</strong> — the practice of following what you share, asking gentle questions, and never rushing ahead of where you are. It doesn't offer diagnoses or clinical assessments.
            </p>
            <p className="approach-body">
              Instead, it holds space. It helps you notice patterns across conversations. It offers grounding exercises drawn from evidence-based practices when you need a pause, not a prescription.
            </p>
            <div className="approach-checks">
              {['Reflective, not prescriptive', 'Tracks mood patterns over time', 'Grounding exercises on demand', 'Completely private, always'].map(c => (
                <div key={c} className="approach-check-item">
                  <CheckCircle size={16} className="check-icon" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── QUALITIES GRID ───────────────────────────────────────────── */}
      <section className="landing-qualities">
        <div className="landing-section-inner">
          <p className="section-eyebrow">Why Nereid</p>
          <h2 className="section-headline qualities-headline">Built around how you actually feel.</h2>
          <div className="qualities-grid">
            {qualities.map((q) => (
              <div key={q.label} className="quality-card">
                <div className="quality-icon-wrap">{q.icon}</div>
                <h3 className="quality-label">{q.label}</h3>
                <p className="quality-desc">{q.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GETTING STARTED (3 STEPS) ────────────────────────────────── */}
      <section className="landing-steps">
        <div className="landing-section-inner">
          <p className="section-eyebrow">Getting started</p>
          <h2 className="section-headline">Three steps to feeling a little lighter.</h2>
          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.n} className="step-card">
                <div className="step-top">
                  <span className="step-dot" aria-hidden="true" />
                  <span className="step-line" aria-hidden="true" />
                </div>
                <p className="step-number">{s.n}</p>
                <h3 className="step-label">{s.label}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────── */}
      <section className="landing-cta-banner">
        <div className="landing-section-inner">
          <div className="cta-banner-card">
            <div className="cta-banner-bg" aria-hidden="true" />
            <div className="cta-banner-content">
              <span className="cta-banner-accent" aria-hidden="true" />
              <p className="section-eyebrow cta-eyebrow">Ready when you are</p>
              <h2 className="cta-banner-headline">If you're ready to feel heard.</h2>
              <p className="cta-banner-sub">
                No commitment. No pressure. Just open the app and say what's on your mind.
              </p>
              <div className="cta-banner-actions">
                <button className="btn-primary-lg" onClick={onStartChat} id="landing-cta-start-btn">
                  Start talking <ArrowRight size={16} />
                </button>
                <button className="btn-ghost-banner" onClick={onEnterDashboard} id="landing-cta-dashboard-btn">
                  Explore the dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-section-inner landing-footer-inner">
          <div className="footer-brand">
            <div className="landing-logo footer-logo">
              <span className="landing-logo-text">Nereid</span>
            </div>
            <p className="footer-tagline">A calm space to talk, whenever you need it.</p>
          </div>
          <div className="footer-links-col">
            <p className="footer-col-label">App</p>
            <button className="footer-link" onClick={onStartChat}>Start a conversation</button>
            <button className="footer-link" onClick={onEnterDashboard}>Open dashboard</button>
          </div>
          <div className="footer-links-col">
            <p className="footer-col-label">Support</p>
            <button className="footer-link" onClick={onEnterDashboard}>Crisis resources</button>
            <button className="footer-link" onClick={onEnterDashboard}>Self-care library</button>
          </div>
        </div>
        <div className="landing-section-inner">
          <div className="footer-bottom">
            <p className="footer-legal">
              Nereid is a supportive tool, not a clinical service. In an emergency, call your local crisis line or emergency services.
            </p>
            <p className="footer-copyright">© {new Date().getFullYear()} Nereid</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
