'use client'

import { useState, useEffect, useRef } from 'react'

export default function Feature4Spy() {
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
          <linearGradient id="brand4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .anim { animation-play-state: ${isVisible ? 'running' : 'paused'}; }

          .f4-url {
            animation: f4TypeURL 4s ease-out infinite;
          }
          @keyframes f4TypeURL {
            0%             { clip-path: inset(0 100% 0 0); }
            30%, 100%      { clip-path: inset(0 0% 0 0); }
          }

          .f4-cursor {
            animation: f4Blink 0.8s step-end infinite;
          }
          @keyframes f4Blink {
            0%, 49%  { opacity: 1; }
            50%, 100% { opacity: 0; }
          }

          .f4-weak {
            animation: f4WeakFade 4s ease-in-out infinite;
          }
          @keyframes f4WeakFade {
            0%, 20%  { opacity: 0; }
            50%, 85% { opacity: 1; }
            100%     { opacity: 0; }
          }

          .f4-improve {
            animation: f4WeakFade 4s ease-in-out infinite 1s;
          }

          .f4-arrow {
            animation: f4ArrowDraw 4s ease-in-out infinite;
          }
          @keyframes f4ArrowDraw {
            0%, 25%  { stroke-dashoffset: 30; }
            55%, 85% { stroke-dashoffset: 0; }
            100%     { stroke-dashoffset: 30; }
          }
        `}</style>

        {/* URL input bar */}
        <rect x="60" y="20" width="360" height="38" rx="8" fill="#120C04" stroke="#2A1A08" />
        <rect x="76" y="29" width="10" height="10" rx="2" fill="#3A2810" />
        <g className="f4-url">
          <text x="95" y="44" fontSize="10" fill="#6A5030">https://www.etsy.com/listing/...</text>
        </g>
        <rect className="anim f4-cursor" x="340" y="30" width="2" height="16" fill="#FFB800" />

        <rect x="340" y="24" width="70" height="28" rx="14" fill="url(#brand4)" />
        <text x="375" y="42" textAnchor="middle" fontSize="9" fill="#fff">Analyze</text>

        {/* Left card — competitor */}
        <rect x="25" y="78" width="200" height="205" rx="10" fill="#1A1208" stroke="#EF4444" strokeWidth="1" />
        <text x="125" y="98" textAnchor="middle" fontSize="8" fill="#EF4444" letterSpacing="0.5">COMPETITOR</text>

        <rect x="40" y="108" width="170" height="8" rx="4" fill="#2A1A08" />
        <rect x="40" y="120" width="120" height="8" rx="4" fill="#2A1A08" />

        <g className="anim f4-weak">
          <circle cx="49" cy="140" r="7" fill="#EF4444" />
          <path d="M45 136 L53 144 M53 136 L45 144" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <text x="58" y="144" fontSize="8" fill="#EF4444">Title too short</text>

          <circle cx="49" cy="162" r="7" fill="#EF4444" />
          <path d="M45 158 L53 166 M53 158 L45 166" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <text x="58" y="166" fontSize="8" fill="#EF4444">Missing keywords</text>

          <circle cx="49" cy="184" r="7" fill="#EF4444" />
          <path d="M45 180 L53 188 M53 180 L45 188" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
          <text x="58" y="188" fontSize="8" fill="#EF4444">Only 6 tags</text>
        </g>

        <rect x="40" y="248" width="160" height="24" rx="12" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" />
        <text x="120" y="264" textAnchor="middle" fontSize="10" fill="#EF4444">Score: 42/100</text>

        {/* Arrow between cards */}
        <text x="242" y="172" textAnchor="middle" fontSize="8" fill="#FFB800">Better</text>
        <path className="anim f4-arrow" d="M230 180 L255 180" stroke="url(#brand4)" strokeWidth="2" strokeDasharray="30" />
        <polygon points="252,176 260,180 252,184" fill="#FF3D8B" />

        {/* Right card — improved */}
        <rect x="258" y="78" width="200" height="205" rx="10" fill="#1A1208" stroke="#22C55E" strokeWidth="1" />
        <text x="358" y="98" textAnchor="middle" fontSize="8" fill="#22C55E" letterSpacing="0.5">YOUR VERSION</text>

        <rect x="272" y="108" width="170" height="8" rx="4" fill="#F5EDE0" />
        <rect x="272" y="120" width="155" height="8" rx="4" fill="#F5EDE0" />
        <rect x="272" y="132" width="140" height="8" rx="4" fill="#3A2810" />

        <g className="anim f4-improve">
          <circle cx="281" cy="152" r="7" fill="#22C55E" />
          <path d="M277 152 L280 155 L285 148" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="290" y="156" fontSize="8" fill="#22C55E">Strong title</text>

          <circle cx="281" cy="174" r="7" fill="#22C55E" />
          <path d="M277 174 L280 177 L285 170" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="290" y="178" fontSize="8" fill="#22C55E">All 13 keywords</text>

          <circle cx="281" cy="196" r="7" fill="#22C55E" />
          <path d="M277 196 L280 199 L285 192" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x="290" y="200" fontSize="8" fill="#22C55E">All 13 tags added</text>
        </g>

        <rect x="272" y="248" width="160" height="24" rx="12" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" />
        <text x="352" y="264" textAnchor="middle" fontSize="10" fill="#22C55E">Score: 91/100 ✓</text>
      </svg>
    </div>
  )
}
