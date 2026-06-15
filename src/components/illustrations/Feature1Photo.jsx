'use client'

import { useState, useEffect, useRef } from 'react'

export default function Feature1Photo() {
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
          <linearGradient id="brand1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .anim { animation-play-state: ${isVisible ? 'running' : 'paused'}; }

          .f1-glow { animation: f1PhotoGlow 3s ease-in-out infinite; }
          @keyframes f1PhotoGlow {
            0%, 100% { stroke: #2A1A08; }
            40%, 60% { stroke: #FFB800; }
          }

          .f1-spark {
            animation-duration: 3s;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
            transform-box: fill-box;
            transform-origin: center;
          }
          .f1-spark1 { animation-name: f1Spark; animation-delay: 0s; }
          .f1-spark2 { animation-name: f1Spark; animation-delay: 0.75s; }
          .f1-spark3 { animation-name: f1Spark; animation-delay: 1.5s; }
          .f1-spark4 { animation-name: f1Spark; animation-delay: 2.25s; }
          @keyframes f1Spark {
            0%   { transform: translate(240px,105px) scale(1);   opacity: 1; }
            25%  { transform: translate(285px,150px) scale(0.5); opacity: 0.5; }
            50%  { transform: translate(240px,195px) scale(1);   opacity: 1; }
            75%  { transform: translate(195px,150px) scale(0.5); opacity: 0.5; }
            100% { transform: translate(240px,105px) scale(1);   opacity: 1; }
          }

          .f1-title1 { animation: f1TitleGrow 3s ease-out infinite; }
          .f1-title2 { animation: f1TitleGrow2 3s ease-out infinite 0.1s; }
          @keyframes f1TitleGrow {
            0%, 30%  { width: 0px; }
            60%, 90% { width: 120px; }
            100%     { width: 0px; }
          }
          @keyframes f1TitleGrow2 {
            0%, 30%  { width: 0px; }
            60%, 90% { width: 80px; }
            100%     { width: 0px; }
          }

          .f1-line { animation: f1LinesFade 3s ease-in-out infinite; }
          @keyframes f1LinesFade {
            0%, 35%  { opacity: 0; }
            65%, 90% { opacity: 1; }
            100%     { opacity: 0; }
          }

          .f1-tags { animation: f1LinesFade 3s ease-in-out infinite 1.2s; }
        `}</style>

        {/* LEFT — input photo frame */}
        <rect className="anim f1-glow" x="30" y="60" width="140" height="140" rx="12" fill="#120C04" stroke="#2A1A08" strokeWidth="1.5" />
        <rect x="55" y="85" width="90" height="80" rx="8" fill="url(#brand1)" />
        <path d="M145 100 Q175 100 175 125 Q175 150 145 150" stroke="#FFB800" strokeWidth="3" fill="none" />
        <text x="100" y="218" textAnchor="middle" fontSize="10" fill="#6A5030">Your photo</text>

        {/* Arrow into processor */}
        <line x1="172" y1="150" x2="193" y2="150" stroke="#FFB800" strokeWidth="2" />
        <polygon points="193,145 200,150 193,155" fill="#FFB800" />

        {/* CENTER — AI processor */}
        <rect x="195" y="105" width="90" height="90" rx="12" fill="#120C04" stroke="#2A1A08" strokeWidth="1.5" />
        <g stroke="#FF3D8B" strokeWidth="2">
          <line x1="240" y1="150" x2="229" y2="139" />
          <line x1="240" y1="150" x2="251" y2="139" />
          <line x1="240" y1="150" x2="229" y2="161" />
          <line x1="240" y1="150" x2="251" y2="161" />
        </g>
        <circle cx="240" cy="150" r="8" fill="url(#brand1)" />

        <circle className="anim f1-spark f1-spark1" r="4" fill="#FFB800" />
        <circle className="anim f1-spark f1-spark2" r="4" fill="#FF3D8B" />
        <circle className="anim f1-spark f1-spark3" r="4" fill="#7B2FFF" />
        <circle className="anim f1-spark f1-spark4" r="4" fill="#22C55E" />

        {/* Arrow into output card */}
        <line x1="287" y1="150" x2="303" y2="150" stroke="#FFB800" strokeWidth="2" />
        <polygon points="303,145 310,150 303,155" fill="#FFB800" />

        {/* RIGHT — output listing card */}
        <rect x="305" y="30" width="155" height="240" rx="12" fill="#1A1208" stroke="url(#brand1)" strokeWidth="1.5" />

        <text x="382" y="55" textAnchor="middle" fontSize="7" fill="#FF3D8B" letterSpacing="0.5">LISTING TITLE</text>
        <rect className="anim f1-title1" x="320" y="62" height="8" rx="4" fill="#F5EDE0" />
        <rect className="anim f1-title2" x="320" y="76" height="8" rx="4" fill="#3A2810" />

        <text x="382" y="98" textAnchor="middle" fontSize="7" fill="#FF3D8B" letterSpacing="0.5">DESCRIPTION</text>
        <rect className="anim f1-line" x="320" y="102" width="115" height="5" rx="2" fill="#3A2810" style={{ animationDelay: '0.6s' }} />
        <rect className="anim f1-line" x="320" y="114" width="95" height="5" rx="2" fill="#3A2810" style={{ animationDelay: '0.7s' }} />
        <rect className="anim f1-line" x="320" y="126" width="110" height="5" rx="2" fill="#3A2810" style={{ animationDelay: '0.8s' }} />
        <rect className="anim f1-line" x="320" y="138" width="85" height="5" rx="2" fill="#3A2810" style={{ animationDelay: '0.9s' }} />
        <rect className="anim f1-line" x="320" y="150" width="100" height="5" rx="2" fill="#3A2810" style={{ animationDelay: '1.0s' }} />

        <text x="382" y="172" textAnchor="middle" fontSize="7" fill="#FF3D8B" letterSpacing="0.5">TAGS</text>
        <rect className="anim f1-tags" x="320" y="179" width="50" height="16" rx="8" fill="rgba(255,184,0,0.2)" stroke="rgba(255,184,0,0.4)" />
        <rect className="anim f1-tags" x="378" y="179" width="65" height="16" rx="8" fill="rgba(255,184,0,0.2)" stroke="rgba(255,184,0,0.4)" />
        <rect className="anim f1-tags" x="320" y="199" width="45" height="16" rx="8" fill="rgba(255,184,0,0.2)" stroke="rgba(255,184,0,0.4)" />

        <rect x="320" y="225" width="120" height="24" rx="12" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.4)" />
        <text x="380" y="241" textAnchor="middle" fontSize="10" fill="#22C55E">91/100 ✓</text>
      </svg>
    </div>
  )
}
