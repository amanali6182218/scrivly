'use client'

import { useState, useEffect, useRef } from 'react'

export default function Feature6Post() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      },
      { threshold: 0.25 }
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        padding: '24px',
      }}
    >
      <svg viewBox="0 0 480 300" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="brand6" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .anim { animation-play-state: ${isVisible ? 'running' : 'paused'}; }
          .anim-cont { animation-play-state: ${isVisible ? 'running' : 'paused'}; animation-iteration-count: infinite; animation-duration: 6s; animation-timing-function: ease-in-out; }

          .f6-phase1 { animation-name: f6Phase1; }
          @keyframes f6Phase1 {
            0%, 28%   { opacity: 1; }
            32%, 100% { opacity: 0; }
          }

          .f6-connected {
            animation-name: f6Connected;
            transform-box: fill-box;
            transform-origin: center;
          }
          @keyframes f6Connected {
            0%, 28%   { opacity: 0; transform: translateY(-20px); }
            35%, 55%  { opacity: 1; transform: translateY(0px); }
            65%, 100% { opacity: 0; transform: translateY(-20px); }
          }

          .f6-phase3 { animation-name: f6Phase3; }
          @keyframes f6Phase3 {
            0%, 48%   { opacity: 0; }
            52%, 83%  { opacity: 1; }
            87%, 100% { opacity: 0; }
          }

          .f6-transfer {
            animation-name: f6Transfer;
            transform-box: fill-box;
            transform-origin: center;
          }
          @keyframes f6Transfer {
            0%, 60%   { transform: translateX(0px); opacity: 1; }
            66%, 75%  { transform: translateX(240px); opacity: 0; }
            76%, 100% { transform: translateX(0px); opacity: 0; }
          }

          .f6-field {
            animation-name: f6Field;
          }
          @keyframes f6Field {
            0%, 66%   { opacity: 0; }
            70%, 83%  { opacity: 1; }
            87%, 100% { opacity: 0; }
          }

          .f6-success {
            animation-name: f6Success;
            transform-box: fill-box;
            transform-origin: center;
          }
          @keyframes f6Success {
            0%, 80%   { opacity: 0; transform: translateY(60px); }
            88%, 96%  { opacity: 1; transform: translateY(0px); }
            100%      { opacity: 0; transform: translateY(60px); }
          }
        `}</style>

        {/* ── Phase 1: Connect ───────────────────── */}
        <g className="anim-cont f6-phase1">
          <text x="240" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#F5EDE0">Connect your Etsy shop</text>

          <circle cx="240" cy="110" r="35" fill="#F1641E" />
          <text x="240" y="124" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#fff">E</text>

          <text x="240" y="162" textAnchor="middle" fontSize="11" fill="#6A5030">AmanCraftio</text>

          <rect x="155" y="178" width="170" height="36" rx="18" fill="#120C04" stroke="#F1641E" strokeWidth="1.5" />
          <text x="240" y="200" textAnchor="middle" fontSize="11" fill="#F1641E">Connect Etsy Shop</text>
        </g>

        {/* ── Phase 2: Connected banner ──────────── */}
        <g className="anim-cont f6-connected">
          <rect x="100" y="80" width="280" height="50" rx="10" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" />
          <circle cx="130" cy="105" r="16" fill="#22C55E" />
          <path d="M122 105 L128 111 L139 98" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="240" y="109" textAnchor="middle" fontSize="13" fill="#22C55E" fontWeight="500">✓ Connected: AmanCraftio</text>
        </g>

        {/* ── Phase 3: Posting (split screen) ─────── */}
        <g className="anim-cont f6-phase3">
          {/* Left — Scrivly card */}
          <rect x="25" y="50" width="190" height="200" rx="10" fill="#1A1208" stroke="url(#brand6)" strokeWidth="1.5" />
          <text x="120" y="68" textAnchor="middle" fontSize="8" fill="#FF3D8B" letterSpacing="0.5">SCRIVLY</text>

          <rect x="38" y="80" width="164" height="8" rx="4" fill="#F5EDE0" />
          <rect x="38" y="100" width="164" height="6" rx="3" fill="#3A2810" />
          <rect x="38" y="112" width="140" height="6" rx="3" fill="#3A2810" />
          <rect x="38" y="124" width="150" height="6" rx="3" fill="#3A2810" />
          <rect x="38" y="142" width="50" height="16" rx="8" fill="rgba(255,184,0,0.2)" />
          <rect x="94" y="142" width="60" height="16" rx="8" fill="rgba(255,184,0,0.2)" />

          <rect x="40" y="205" width="160" height="32" rx="16" fill="url(#brand6)" />
          <text x="120" y="226" textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">Post to Etsy →</text>

          {/* Right — Etsy form */}
          <rect x="265" y="50" width="190" height="200" rx="10" fill="#1A1208" stroke="#F1641E" strokeWidth="1" />
          <text x="360" y="68" textAnchor="middle" fontSize="8" fill="#F1641E" letterSpacing="0.5">ETSY DRAFT</text>

          <rect x="278" y="80" width="164" height="8" rx="4" fill="#2A1A08" />
          <rect x="278" y="100" width="164" height="6" rx="3" fill="#2A1A08" />
          <rect x="278" y="112" width="140" height="6" rx="3" fill="#2A1A08" />
          <rect x="278" y="124" width="150" height="6" rx="3" fill="#2A1A08" />
          <rect x="278" y="142" width="50" height="16" rx="8" fill="#2A1A08" />
          <rect x="334" y="142" width="60" height="16" rx="8" fill="#2A1A08" />

          {/* Filled fields */}
          <g className="anim-cont f6-field" style={{ animationDelay: '0s' }}>
            <rect x="278" y="80" width="164" height="8" rx="4" fill="#F5EDE0" />
          </g>
          <g className="anim-cont f6-field" style={{ animationDelay: '0.4s' }}>
            <rect x="278" y="100" width="164" height="6" rx="3" fill="#6A5030" />
            <rect x="278" y="112" width="140" height="6" rx="3" fill="#6A5030" />
            <rect x="278" y="124" width="150" height="6" rx="3" fill="#6A5030" />
          </g>
          <g className="anim-cont f6-field" style={{ animationDelay: '0.8s' }}>
            <rect x="278" y="142" width="50" height="16" rx="8" fill="rgba(255,184,0,0.2)" />
            <rect x="334" y="142" width="60" height="16" rx="8" fill="rgba(255,184,0,0.2)" />
          </g>

          {/* Traveling content blocks */}
          <rect className="anim-cont f6-transfer" x="38" y="80" width="40" height="8" rx="4" fill="#FFB800" style={{ animationDelay: '0s' }} />
          <rect className="anim-cont f6-transfer" x="38" y="100" width="40" height="6" rx="3" fill="#FF3D8B" style={{ animationDelay: '0.4s' }} />
          <rect className="anim-cont f6-transfer" x="38" y="142" width="40" height="16" rx="8" fill="#7B2FFF" style={{ animationDelay: '0.8s' }} />
        </g>

        {/* ── Phase 4: Success ────────────────────── */}
        <g className="anim-cont f6-success">
          <rect x="25" y="195" width="430" height="60" rx="10" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1.5" />
          <circle cx="70" cy="225" r="20" fill="#22C55E" />
          <path d="M60 225 L67 232 L82 213" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="260" y="221" textAnchor="middle" fontSize="13" fill="#22C55E" fontWeight="bold">Draft listing created on Etsy ✓</text>
          <text x="260" y="238" textAnchor="middle" fontSize="9" fill="#6A5030">Review and publish on Etsy</text>
        </g>
      </svg>
    </div>
  )
}
