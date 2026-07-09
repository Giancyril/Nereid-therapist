import React, { useState } from 'react';
import { MessageSquare, BarChart2, BookOpen, ArrowRight, Heart, Waves } from 'lucide-react';
import './Home.css';

/* ── Nereid Wave Logo ── */
const NereidLogo = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="home-logo-icon">
    <path d="M3 11C7 7 9 13 13 9C17 5 17 11 21 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <path d="M3 16C7 12 9 18 13 14C17 10 17 16 21 12" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 4L7.7 5.7L9.4 6.4L7.7 7.1L7 8.8L6.3 7.1L4.6 6.4L6.3 5.7L7 4Z" fill="#5eead4"/>
    <circle cx="17" cy="17" r="1.2" fill="#5eead4"/>
  </svg>
);

/* ── Companion Illustration ── */
const CompanionIllustration = () => (
  <svg
    className="home-illustration"
    viewBox="0 0 320 360"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="A calm illustrated companion figure seated peacefully, holding a warm cup"
    role="img"
  >
    {/* Background wave motif */}
    <ellipse cx="160" cy="300" rx="130" ry="40" fill="rgba(63,114,104,0.07)" />
    <path d="M30 300 Q80 285 130 300 T230 300 T330 300" stroke="rgba(63,114,104,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M20 315 Q70 300 120 315 T220 315 T320 315" stroke="rgba(63,114,104,0.10)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>

    {/* Body */}
    <ellipse cx="160" cy="248" rx="68" ry="84" fill="#EAF1EE" />
    <path d="M100 230 Q100 200 160 195 Q220 200 220 230 L225 310 Q160 320 95 310 Z" fill="#3F7268" opacity="0.9" />
    <path d="M140 195 Q160 208 180 195" stroke="#2C534B" strokeWidth="2" fill="none" strokeLinecap="round"/>

    {/* Arms */}
    <path d="M100 240 Q82 268 90 295" stroke="#C8A98A" strokeWidth="22" strokeLinecap="round" fill="none"/>
    <path d="M220 240 Q238 268 230 295" stroke="#C8A98A" strokeWidth="22" strokeLinecap="round" fill="none"/>
    <ellipse cx="92" cy="298" rx="16" ry="12" fill="#C8A98A"/>
    <ellipse cx="228" cy="298" rx="16" ry="12" fill="#C8A98A"/>

    {/* Cup */}
    <rect x="136" y="278" width="48" height="38" rx="8" fill="#F5EDE0" stroke="#D4B896" strokeWidth="1.5"/>
    <path d="M184 288 Q196 288 196 300 Q196 312 184 312" stroke="#D4B896" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M148 276 Q150 268 148 260" stroke="rgba(63,114,104,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M160 274 Q162 264 160 256" stroke="rgba(63,114,104,0.35)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M172 276 Q174 268 172 260" stroke="rgba(63,114,104,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

    {/* Neck + Head */}
    <rect x="148" y="155" width="24" height="44" rx="12" fill="#C8A98A"/>
    <ellipse cx="160" cy="135" rx="52" ry="56" fill="#C8A98A"/>

    {/* Hair */}
    <path d="M108 125 Q110 74 160 70 Q210 74 212 125 Q205 108 195 105 Q180 100 160 99 Q140 100 125 105 Q115 108 108 125 Z" fill="#5C3D2E"/>
    <path d="M108 125 Q104 148 110 168" stroke="#5C3D2E" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M212 125 Q216 148 210 168" stroke="#5C3D2E" strokeWidth="14" strokeLinecap="round" fill="none"/>

    {/* Face */}
    <path d="M138 134 Q144 130 150 134" stroke="#5C3D2E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M170 134 Q176 130 182 134" stroke="#5C3D2E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M150 152 Q160 160 170 152" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <ellipse cx="136" cy="148" rx="10" ry="7" fill="#C1614A" opacity="0.22"/>
    <ellipse cx="184" cy="148" rx="10" ry="7" fill="#C1614A" opacity="0.22"/>

    {/* Sparkles */}
    <circle cx="64" cy="90" r="3" fill="#3F7268" opacity="0.4"/>
    <circle cx="256" cy="110" r="2" fill="#3F7268" opacity="0.3"/>
    <circle cx="244" cy="72" r="4" fill="#C1614A" opacity="0.25"/>
    <path d="M60 60 L62 54 L64 60 L70 62 L64 64 L62 70 L60 64 L54 62 Z" fill="#3F7268" opacity="0.3"/>
  </svg>
);

const pillars = [
  {
    id: 'chat',
    icon: <MessageSquare size={24} />,
    label: 'Talk it out',
    desc: 'Judgment-free conversations, any time. Nereid listens without interrupting, without judging.',
  },
  {
    id: 'insights',
    icon: <BarChart2 size={24} />,
    label: 'Track your journey',
    desc: 'Revisit reflections and see your mood trends over time — a quiet record of how far you\'ve come.',
  },
  {
    id: 'resources',
    icon: <BookOpen size={24} />,
    label: 'Find your calm',
    desc: 'Guided breathing and grounding exercises when things feel like too much.',
  },
];

const Home = ({ onEnterDashboard, onStartChat, onSelectTab }) => {
  return (
    <div className="landing-page">

      {/* ── TOP NAV ─────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon-wrap">
              <NereidLogo />
            </div>
            <span className="landing-logo-text">Nereid</span>
          </div>
          <div className="landing-nav-links">
            <button className="landing-nav-link" onClick={() => document.getElementById('landing-features').scrollIntoView({ behavior: 'smooth' })}>
              How it works
            </button>
            <button className="landing-nav-link" onClick={() => document.getElementById('landing-safety').scrollIntoView({ behavior: 'smooth' })}>
              Support
            </button>
          </div>
          <button
            className="landing-nav-cta"
            onClick={onEnterDashboard}
            id="landing-open-app-btn"
          >
            Open Nereid
            <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="landing-hero">
        {/* Background radial tint */}
        <div className="hero-bg-radial" aria-hidden="true" />

        <div className="landing-hero-inner">
          <div className="hero-text-col">
            <span className="hero-eyebrow">Your compassionate AI companion</span>
            <h1 className="hero-headline">
              A calm space to talk,<br />
              whenever you need it.
            </h1>
            <p className="hero-subhead">
              Nereid listens without judgment, remembers your journey,
              and helps you find steadier ground — any time of day.
            </p>
            <div className="hero-actions">
              <button
                className="btn-primary-lg"
                onClick={onStartChat}
                id="landing-start-talking-btn"
              >
                Start talking
                <ArrowRight size={17} />
              </button>
              <button
                className="btn-ghost-lg"
                onClick={onEnterDashboard}
                id="landing-dashboard-btn"
              >
                Open dashboard
              </button>
            </div>
          </div>

          <div className="hero-visual-col">
            <div className="hero-backdrop-ring" aria-hidden="true" />
            <CompanionIllustration />
          </div>
        </div>

        {/* Wave transition into features band */}
        <div className="hero-wave-transition" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" fill="var(--mist)" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS (PILLARS) ───────────────────────────────────── */}
      <section className="landing-features" id="landing-features">
        <div className="landing-features-inner">
          <div className="features-header">
            <p className="features-eyebrow">How Nereid helps</p>
            <h2 className="features-headline">
              Everything you need, gently in one place.
            </h2>
          </div>

          <div className="features-grid">
            {pillars.map((p) => (
              <div key={p.id} className="feature-card">
                <div className="feature-icon-wrap">{p.icon}</div>
                <h3 className="feature-label">{p.label}</h3>
                <p className="feature-desc">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* CTA below pillars */}
          <div className="features-cta-row">
            <button
              className="btn-primary-lg"
              onClick={onEnterDashboard}
              id="landing-features-cta-btn"
            >
              Go to Nereid dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── SAFETY NOTE ─────────────────────────────────────────────── */}
      <section className="landing-safety" id="landing-safety">
        <div className="landing-safety-inner">
          <Heart size={15} className="safety-heart" aria-hidden="true" />
          <p className="safety-text">
            Nereid is here to listen, but isn't a substitute for professional care.
            If you're in crisis, help is always close by.{' '}
            <button
              className="safety-link"
              onClick={onEnterDashboard}
              id="landing-crisis-btn"
            >
              Find crisis support →
            </button>
          </p>
        </div>
      </section>

    </div>
  );
};

export default Home;
