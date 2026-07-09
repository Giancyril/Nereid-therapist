import React from 'react';
import { MessageSquare, BookOpen, BarChart2, ArrowRight, Heart } from 'lucide-react';
import './Home.css';

/* ── Inline SVG Illustration ─────────────────────────────────────────────
   A calm, gender-neutral companion figure: soft color-blocked shapes,
   gentle closed eyes, seated with a warm cup. Built entirely from the
   existing design tokens to avoid external dependencies.
   ─────────────────────────────────────────────────────────────────────── */
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

    {/* Body — soft rounded torso */}
    <ellipse cx="160" cy="250" rx="72" ry="88" fill="#3F7268" opacity="0.15" />
    <ellipse cx="160" cy="248" rx="68" ry="84" fill="#EAF1EE" />

    {/* Sweater / clothing block */}
    <path d="M100 230 Q100 200 160 195 Q220 200 220 230 L225 310 Q160 320 95 310 Z" fill="#3F7268" opacity="0.9" />

    {/* Collar detail */}
    <path d="M140 195 Q160 208 180 195" stroke="#2C534B" strokeWidth="2" fill="none" strokeLinecap="round"/>

    {/* Arms resting on lap */}
    <path d="M100 240 Q82 268 90 295" stroke="#C8A98A" strokeWidth="22" strokeLinecap="round" fill="none"/>
    <path d="M220 240 Q238 268 230 295" stroke="#C8A98A" strokeWidth="22" strokeLinecap="round" fill="none"/>

    {/* Hands */}
    <ellipse cx="92" cy="298" rx="16" ry="12" fill="#C8A98A"/>
    <ellipse cx="228" cy="298" rx="16" ry="12" fill="#C8A98A"/>

    {/* Warm cup — held between hands */}
    <rect x="136" y="278" width="48" height="38" rx="8" fill="#F5EDE0" stroke="#D4B896" strokeWidth="1.5"/>
    <path d="M184 288 Q196 288 196 300 Q196 312 184 312" stroke="#D4B896" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Steam wisps */}
    <path d="M148 276 Q150 268 148 260" stroke="rgba(63,114,104,0.4)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M160 274 Q162 264 160 256" stroke="rgba(63,114,104,0.35)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M172 276 Q174 268 172 260" stroke="rgba(63,114,104,0.3)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

    {/* Neck */}
    <rect x="148" y="155" width="24" height="44" rx="12" fill="#C8A98A"/>

    {/* Head */}
    <ellipse cx="160" cy="135" rx="52" ry="56" fill="#C8A98A"/>

    {/* Hair — soft rounded cap */}
    <path d="M108 125 Q110 74 160 70 Q210 74 212 125 Q205 108 195 105 Q180 100 160 99 Q140 100 125 105 Q115 108 108 125 Z" fill="#5C3D2E"/>

    {/* Soft side hair */}
    <path d="M108 125 Q104 148 110 168" stroke="#5C3D2E" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M212 125 Q216 148 210 168" stroke="#5C3D2E" strokeWidth="14" strokeLinecap="round" fill="none"/>

    {/* Eyes — gently closed, a soft downward curve */}
    <path d="M138 134 Q144 130 150 134" stroke="#5C3D2E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M170 134 Q176 130 182 134" stroke="#5C3D2E" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

    {/* Soft smile */}
    <path d="M150 152 Q160 160 170 152" stroke="#5C3D2E" strokeWidth="2" strokeLinecap="round" fill="none"/>

    {/* Rosy cheeks */}
    <ellipse cx="136" cy="148" rx="10" ry="7" fill="#C1614A" opacity="0.22"/>
    <ellipse cx="184" cy="148" rx="10" ry="7" fill="#C1614A" opacity="0.22"/>

    {/* Small floating sparkles */}
    <circle cx="64" cy="90" r="3" fill="#3F7268" opacity="0.4"/>
    <circle cx="256" cy="110" r="2" fill="#3F7268" opacity="0.3"/>
    <circle cx="244" cy="72" r="4" fill="#C1614A" opacity="0.25"/>
    <path d="M60 60 L62 54 L64 60 L70 62 L64 64 L62 70 L60 64 L54 62 Z" fill="#3F7268" opacity="0.3"/>
  </svg>
);

const pillars = [
  {
    id: 'chat',
    icon: <MessageSquare size={22} />,
    label: 'Talk it out',
    desc: 'Judgment-free conversations, any time you need them. Nereid listens without interrupting, without judging.',
    tab: 'chat',
  },
  {
    id: 'insights',
    icon: <BarChart2 size={22} />,
    label: 'Track your journey',
    desc: 'Revisit past reflections and see your mood trends over time — a quiet record of how far you\'ve come.',
    tab: 'insights',
  },
  {
    id: 'resources',
    icon: <BookOpen size={22} />,
    label: 'Find your calm',
    desc: 'Guided breathing and grounding exercises when things feel like too much. Explore at your own pace.',
    tab: 'resources',
  },
];

const Home = ({ onStartChat, onSelectTab }) => {
  return (
    <div className="home-container">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="hero-text">
          <span className="hero-eyebrow">Your compassionate AI companion</span>
          <h1 className="hero-headline">
            A calm space to talk,<br />
            whenever you need it.
          </h1>
          <p className="hero-subhead">
            Nereid listens without judgment, remembers your journey,
            and helps you find steadier ground.
          </p>
          <div className="hero-actions">
            <button
              className="btn-primary"
              onClick={onStartChat}
              id="home-start-talking-btn"
            >
              Start talking
              <ArrowRight size={16} />
            </button>
            <button
              className="btn-ghost"
              onClick={() => onSelectTab('resources')}
              id="home-explore-resources-btn"
            >
              Explore self-care resources
            </button>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-backdrop" />
          <CompanionIllustration />
        </div>
      </section>

      {/* ── WAVE DIVIDER ──────────────────────────────────────────────── */}
      <div className="wave-divider" aria-hidden="true" />

      {/* ── VALUE PILLARS ─────────────────────────────────────────────── */}
      <section className="home-pillars">
        <p className="pillars-eyebrow">How Nereid helps</p>
        <div className="pillars-grid">
          {pillars.map((p) => (
            <button
              key={p.id}
              className="pillar-card"
              onClick={() => onSelectTab(p.tab)}
              id={`home-pillar-${p.id}`}
            >
              <div className="pillar-icon-wrap">{p.icon}</div>
              <h2 className="pillar-label">{p.label}</h2>
              <p className="pillar-desc">{p.desc}</p>
              <span className="pillar-link">
                Explore <ArrowRight size={13} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── SAFETY NOTE ───────────────────────────────────────────────── */}
      <section className="home-safety">
        <div className="safety-inner">
          <Heart size={16} className="safety-icon" aria-hidden="true" />
          <p className="safety-text">
            Nereid is here to listen, but isn't a substitute for professional care.
            If you're in crisis, help is always close by.{' '}
            <button
              className="safety-link"
              onClick={() => onSelectTab('resources')}
              id="home-crisis-link"
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
