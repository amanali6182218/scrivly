'use client'

import { useState, useEffect, useRef } from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 90 // 565.5
const PROGRESS = CIRCUMFERENCE * 0.91 // 514.6

export default function Feature3Health() {
  const [isVisible, setIsVisible] = useState(false)
  const [score, setScore] = useState(0)
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

  useEffect(() => {
    if (isVisible) {
      let count = 0
      const timer = setInterval(() => {
        count += 2
        if (count >= 91) {
          count = 91
          clearInterval(timer)
        }
        setScore(count)
      }, 30)
      return () => clearInterval(timer)
    } else {
      setScore(0)
    }
  }, [isVisible])

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
          <linearGradient id="brand3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
          <linearGradient id="healthGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#22C55E" />
          </linearGradient>
        </defs>

        <style>{`
          .anim { animation-play-state: ${isVisible ? 'running' : 'paused'}; }

          .f3-arc {
            animation: f3ArcDraw 3s ease-out infinite;
          }
          @keyframes f3ArcDraw {
            0%, 5%   { stroke-dashoffset: ${CIRCUMFERENCE}; }
            50%, 85% { stroke-dashoffset: 0; }
            100%     { stroke-dashoffset: ${CIRCUMFERENCE}; }
          }

          .f3-bar {
            animation-duration: 3s;
            animation-timing-function: ease-out;
            animation-iteration-count: infinite;
          }
          .f3-bar1 { animation-name: f3Bar1; animation-delay: 0s; }
          .f3-bar2 { animation-name: f3Bar2; animation-delay: 0.2s; }
          .f3-bar3 { animation-name: f3Bar3; animation-delay: 0.4s; }
          .f3-bar4 { animation-name: f3Bar4; animation-delay: 0.6s; }
          .f3-bar5 { animation-name: f3Bar5; animation-delay: 0.8s; }
          @keyframes f3Bar1 { 0%,15% { width: 0px; } 55%,85% { width: 72px; } 100% { width: 0px; } }
          @keyframes f3Bar2 { 0%,15% { width: 0px; } 55%,85% { width: 80px; } 100% { width: 0px; } }
          @keyframes f3Bar3 { 0%,15% { width: 0px; } 55%,85% { width: 40px; } 100% { width: 0px; } }
          @keyframes f3Bar4 { 0%,15% { width: 0px; } 55%,85% { width: 80px; } 100% { width: 0px; } }
          @keyframes f3Bar5 { 0%,15% { width: 0px; } 55%,85% { width: 56px; } 100% { width: 0px; } }

          .f3-btn {
            animation: f3BtnPulse 2s ease-in-out infinite;
            animation-delay: 2s;
          }
          @keyframes f3BtnPulse {
            0%, 100% { stroke: #2A1A08; }
            50%      { stroke: #FF3D8B; }
          }
        `}</style>

        {/* Circular progress */}
        <circle cx="160" cy="130" r="90" fill="none" stroke="#1A1208" strokeWidth="14" />
        <circle
          className="anim f3-arc"
          cx="160"
          cy="130"
          r="90"
          fill="none"
          stroke="url(#healthGrad3)"
          strokeWidth="14"
          strokeDasharray={`${PROGRESS} ${CIRCUMFERENCE}`}
          strokeLinecap="round"
          transform="rotate(-90 160 130)"
        />

        <text x="160" y="135" textAnchor="middle" fontSize="48" fontWeight="bold" fill="#22C55E">{score}</text>
        <text x="160" y="160" textAnchor="middle" fontSize="14" fill="#6A5030">/100</text>
        <text x="160" y="182" textAnchor="middle" fontSize="12" fontWeight="500" fill="#22C55E">Excellent</text>

        {/* Score bars */}
        <text x="290" y="68" fontSize="9" fill="#6A5030">Title length</text>
        <rect x="370" y="56" width="80" height="10" rx="5" fill="#1A1208" />
        <rect className="anim f3-bar f3-bar1" x="370" y="56" height="10" rx="5" fill="#22C55E" />
        <text x="455" y="67" fontSize="9" fill="#22C55E">18/20</text>

        <text x="290" y="98" fontSize="9" fill="#6A5030">Keywords</text>
        <rect x="370" y="86" width="80" height="10" rx="5" fill="#1A1208" />
        <rect className="anim f3-bar f3-bar2" x="370" y="86" height="10" rx="5" fill="#22C55E" />
        <text x="455" y="97" fontSize="9" fill="#22C55E">20/20</text>

        <text x="290" y="128" fontSize="9" fill="#6A5030">Description</text>
        <rect x="370" y="116" width="80" height="10" rx="5" fill="#1A1208" />
        <rect className="anim f3-bar f3-bar3" x="370" y="116" height="10" rx="5" fill="#FFB800" />
        <text x="455" y="127" fontSize="9" fill="#FFB800">10/20</text>

        <text x="290" y="158" fontSize="9" fill="#6A5030">All 13 tags</text>
        <rect x="370" y="146" width="80" height="10" rx="5" fill="#1A1208" />
        <rect className="anim f3-bar f3-bar4" x="370" y="146" height="10" rx="5" fill="#22C55E" />
        <text x="455" y="157" fontSize="9" fill="#22C55E">20/20</text>

        <text x="290" y="188" fontSize="9" fill="#6A5030">Tag variety</text>
        <rect x="370" y="176" width="80" height="10" rx="5" fill="#1A1208" />
        <rect className="anim f3-bar f3-bar5" x="370" y="176" height="10" rx="5" fill="#FFB800" />
        <text x="455" y="187" fontSize="9" fill="#FFB800">14/20</text>

        {/* Fix button */}
        <rect className="anim f3-btn" x="290" y="220" width="160" height="32" rx="16" fill="#120C04" stroke="#2A1A08" strokeWidth="1.5" />
        <text x="370" y="240" textAnchor="middle" fontSize="10" fill="#FF3D8B">Fix weak areas →</text>
      </svg>
    </div>
  )
}
