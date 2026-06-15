'use client'

import { useState, useEffect, useRef } from 'react'

export default function Feature5Category() {
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
          <linearGradient id="brand5" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .anim { animation-play-state: ${isVisible ? 'running' : 'paused'}; }

          .f5-scan {
            animation: f5ScanLine 2.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: top;
          }
          @keyframes f5ScanLine {
            0%   { transform: translateY(0px); opacity: 1; }
            80%  { transform: translateY(100px); opacity: 1; }
            85%  { opacity: 0; }
            100% { transform: translateY(0px); opacity: 0; }
          }

          .f5-detect {
            animation: f5Pulse 2.5s ease-in-out infinite;
          }
          @keyframes f5Pulse {
            0%, 100% { opacity: 0.5; }
            50%      { opacity: 1; }
          }

          .f5-pill {
            animation: f5PillFade 3.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          @keyframes f5PillFade {
            0%, 30%  { opacity: 0; transform: translateY(10px); }
            60%, 85% { opacity: 1; transform: translateY(0px); }
            100%     { opacity: 0; transform: translateY(10px); }
          }
        `}</style>

        {/* Product photo */}
        <rect x="175" y="20" width="130" height="100" rx="10" fill="url(#brand5)" stroke="#2A1A08" strokeWidth="1.5" />
        <circle cx="240" cy="65" r="28" stroke="#fff" strokeOpacity="0.6" fill="none" strokeWidth="6" />
        <circle cx="240" cy="65" r="12" stroke="#fff" strokeOpacity="0.3" fill="none" strokeWidth="3" />
        <text x="240" y="138" textAnchor="middle" fontSize="9" fill="#6A5030">Your photo</text>

        {/* Scan line */}
        <rect className="anim f5-scan" x="175" y="20" width="130" height="2" fill="rgba(255,184,0,0.8)" />

        {/* Detection label */}
        <text className="anim f5-detect" x="240" y="158" textAnchor="middle" fontSize="9" fill="#FFB800" letterSpacing="0.5">AI DETECTING CATEGORY...</text>

        {/* Pill 1 — high confidence, auto-selected */}
        <g className="anim f5-pill" style={{ animationDelay: '1s' }}>
          <rect x="60" y="175" width="360" height="36" rx="8" fill="rgba(255,184,0,0.12)" stroke="#FFB800" strokeWidth="1.5" />
          <circle cx="80" cy="193" r="8" fill="#FFB800" />
          <text x="100" y="197" fontSize="11" fill="#F5EDE0" fontWeight="500">Jewelry › Rings</text>
          <text x="380" y="197" fontSize="10" fill="#22C55E">● High</text>
          <rect x="408" y="181" width="24" height="24" rx="12" fill="#22C55E" />
          <path d="M414 193 L418 197 L426 187" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Pill 2 — medium confidence */}
        <g className="anim f5-pill" style={{ animationDelay: '1.3s' }}>
          <rect x="60" y="220" width="360" height="32" rx="8" fill="#120C04" stroke="#2A1A08" />
          <circle cx="80" cy="236" r="8" stroke="#3A2810" fill="none" />
          <text x="100" y="240" fontSize="10" fill="#6A5030">Accessories › Bracelets</text>
          <text x="380" y="240" fontSize="9" fill="#FFB800">● Medium</text>
        </g>

        {/* Pill 3 — low confidence */}
        <g className="anim f5-pill" style={{ animationDelay: '1.6s' }}>
          <rect x="60" y="262" width="360" height="32" rx="8" fill="#120C04" stroke="#2A1A08" />
          <circle cx="80" cy="278" r="8" stroke="#3A2810" fill="none" />
          <text x="100" y="282" fontSize="10" fill="#6A5030">Accessories › Earrings</text>
          <text x="380" y="282" fontSize="9" fill="#EF4444">● Low</text>
        </g>
      </svg>
    </div>
  )
}
