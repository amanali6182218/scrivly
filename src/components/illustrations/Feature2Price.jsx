'use client'

import { useState, useEffect, useRef } from 'react'

const BARS = [
  { x: 80, height: 60 },
  { x: 126, height: 95 },
  { x: 172, height: 120 },
  { x: 218, height: 110 },
  { x: 264, height: 130 },
  { x: 310, height: 100 },
  { x: 356, height: 85 },
  { x: 402, height: 70 },
]

export default function Feature2Price() {
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
          <linearGradient id="brand2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .anim { animation-play-state: ${isVisible ? 'running' : 'paused'}; }

          .f2-bar {
            transform-box: fill-box;
            transform-origin: bottom;
            animation-name: f2BarGrow;
            animation-duration: 3.5s;
            animation-timing-function: ease-out;
            animation-iteration-count: infinite;
          }
          @keyframes f2BarGrow {
            0%, 10%  { transform: scaleY(0); }
            40%, 90% { transform: scaleY(1); }
            100%     { transform: scaleY(0); }
          }

          .f2-band {
            animation: f2BandFade 3.5s ease-in-out infinite;
            animation-delay: 1.5s;
          }
          @keyframes f2BandFade {
            0%, 30%  { opacity: 0; }
            55%, 85% { opacity: 1; }
            100%     { opacity: 0; }
          }

          .f2-dot {
            animation: f2PulseDot 1.5s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          @keyframes f2PulseDot {
            0%, 100% { r: 4; opacity: 1; }
            50%      { r: 6; opacity: 0.6; }
          }
        `}</style>

        {/* Chart background */}
        <rect x="40" y="20" width="400" height="220" rx="12" fill="#120C04" stroke="#2A1A08" />

        {/* Grid lines */}
        {[60, 90, 120, 150, 180].map((y) => (
          <line key={y} x1="70" y1={y} x2="420" y2={y} stroke="#1A1208" strokeWidth="1" />
        ))}

        {/* Y axis labels */}
        <text x="62" y="62" textAnchor="end" fontSize="8" fill="#3A2810">$80</text>
        <text x="62" y="92" textAnchor="end" fontSize="8" fill="#3A2810">$60</text>
        <text x="62" y="122" textAnchor="end" fontSize="8" fill="#3A2810">$40</text>
        <text x="62" y="152" textAnchor="end" fontSize="8" fill="#3A2810">$20</text>
        <text x="62" y="182" textAnchor="end" fontSize="8" fill="#3A2810">$0</text>

        {/* Competitor bars */}
        {BARS.map((bar, i) => (
          <rect
            key={bar.x}
            className="anim f2-bar"
            x={bar.x}
            y={182 - bar.height}
            width="28"
            height={bar.height}
            fill="#2A1A08"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}

        {/* Suggested price band */}
        <rect className="anim f2-band" x="152" y="72" width="140" height="60" fill="rgba(255,184,0,0.12)" stroke="rgba(255,184,0,0.5)" strokeDasharray="4,3" />
        <line className="anim f2-band" x1="152" y1="72" x2="152" y2="132" stroke="#FFB800" strokeWidth="2" />
        <line className="anim f2-band" x1="292" y1="72" x2="292" y2="132" stroke="#FFB800" strokeWidth="2" />

        <text className="anim f2-band" x="222" y="98" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#FFB800">$28 – $45</text>
        <text className="anim f2-band" x="222" y="113" textAnchor="middle" fontSize="8" fill="#6A5030">Suggested range</text>

        {/* Demand badge */}
        <rect x="320" y="240" width="110" height="28" rx="14" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" />
        <circle className="anim f2-dot" cx="335" cy="254" r="4" fill="#22C55E" />
        <text x="385" y="258" textAnchor="middle" fontSize="10" fill="#22C55E">High demand</text>

        {/* Bottom labels */}
        <text x="200" y="262" fontSize="9" fill="#3A2810">Competitors</text>
        <text x="240" y="282" textAnchor="middle" fontSize="8" fill="#3A2810">Based on 24 similar Etsy listings</text>
      </svg>
    </div>
  )
}
