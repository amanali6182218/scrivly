'use client'

import { useState, useEffect, useRef } from 'react'

export default function Step4Publish() {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef}>
      <svg
        viewBox="0 0 480 300"
        width="100%"
        height="auto"
        style={{ '--play': isVisible ? 'running' : 'paused', display: 'block' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="step4Brand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .s4-anim { animation-play-state: var(--play, paused); animation-iteration-count: infinite; animation-timing-function: ease-in-out; animation-duration: 5s; }

          .s4-copy-pulse { animation-name: s4CopyPulse; animation-duration: 1.6s; animation-iteration-count: infinite; animation-play-state: var(--play, paused); }
          @keyframes s4CopyPulse {
            0%, 100% { opacity: 1; }
            50%      { opacity: 0.65; }
          }

          .s4-travel1 { animation-name: s4Travel1; }
          @keyframes s4Travel1 {
            0%, 19%   { opacity: 0; transform: translateX(0px); }
            21%       { opacity: 1; transform: translateX(0px); }
            34%       { opacity: 1; transform: translateX(70px); }
            36%, 100% { opacity: 0; transform: translateX(70px); }
          }
          .s4-travel2 { animation-name: s4Travel2; }
          @keyframes s4Travel2 {
            0%, 25%   { opacity: 0; transform: translateX(0px); }
            27%       { opacity: 1; transform: translateX(0px); }
            40%       { opacity: 1; transform: translateX(70px); }
            42%, 100% { opacity: 0; transform: translateX(70px); }
          }
          .s4-travel3 { animation-name: s4Travel3; }
          @keyframes s4Travel3 {
            0%, 31%   { opacity: 0; transform: translateX(0px); }
            33%       { opacity: 1; transform: translateX(0px); }
            46%       { opacity: 1; transform: translateX(70px); }
            48%, 100% { opacity: 0; transform: translateX(70px); }
          }

          .s4-field1 { animation-name: s4Field1; }
          @keyframes s4Field1 {
            0%, 34%   { opacity: 0; }
            37%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }
          .s4-field2 { animation-name: s4Field2; }
          @keyframes s4Field2 {
            0%, 40%   { opacity: 0; }
            43%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }
          .s4-field3 { animation-name: s4Field3; }
          @keyframes s4Field3 {
            0%, 46%   { opacity: 0; }
            49%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }

          .s4-publish { animation-name: s4PublishBtn; }
          @keyframes s4PublishBtn {
            0%, 58%   { opacity: 0; }
            62%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }

          .s4-success { animation-name: s4Success; transform-box: fill-box; transform-origin: 50% 50%; }
          @keyframes s4Success {
            0%, 78%   { opacity: 0; transform: translateY(20px); }
            82%, 88%  { opacity: 1; transform: translateY(0px); }
            94%, 100% { opacity: 0; transform: translateY(20px); }
          }
        `}</style>

        {/* Scrivly results panel */}
        <rect x="30" y="30" width="190" height="240" rx="10" fill="var(--ill-card, #1A1208)" stroke="#2A1A08" strokeWidth="1.5" />
        <text x="45" y="48" fontSize="9" fill="#FF3D8B" letterSpacing="1">SCRIVLY</text>

        {/* Title block */}
        <rect x="45" y="62" width="160" height="28" rx="6" fill="#120C04" stroke="#2A1A08" />
        <rect x="55" y="72" width="120" height="8" rx="4" fill="#FFB800" />

        {/* Description block */}
        <rect x="45" y="98" width="160" height="60" rx="6" fill="#120C04" stroke="#2A1A08" />
        <rect x="55" y="110" width="140" height="6" rx="3" fill="#6A5030" />
        <rect x="55" y="124" width="130" height="6" rx="3" fill="#6A5030" />
        <rect x="55" y="138" width="100" height="6" rx="3" fill="#6A5030" />

        {/* Tags block */}
        <rect x="45" y="166" width="160" height="44" rx="6" fill="#120C04" stroke="#2A1A08" />
        <rect x="55" y="178" width="46" height="16" rx="8" fill="#3A1A2A" />
        <rect x="106" y="178" width="56" height="16" rx="8" fill="#2A1A3A" />
        <rect x="55" y="198" width="66" height="16" rx="8" fill="#3A2810" />

        {/* Copy button */}
        <g className="s4-copy-pulse">
          <rect x="50" y="220" width="150" height="30" rx="15" fill="url(#step4Brand)" />
          <text x="125" y="240" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">Copy listing ✓</text>
        </g>

        {/* Connector dotted lines */}
        <line x1="205" y1="76" x2="275" y2="76" stroke="#3A2810" strokeWidth="2" strokeDasharray="4,4" />
        <line x1="205" y1="128" x2="275" y2="128" stroke="#3A2810" strokeWidth="2" strokeDasharray="4,4" />
        <line x1="205" y1="188" x2="275" y2="188" stroke="#3A2810" strokeWidth="2" strokeDasharray="4,4" />

        {/* Traveling content dots */}
        <circle className="s4-anim s4-travel1" cx="205" cy="76" r="5" fill="#FFB800" />
        <circle className="s4-anim s4-travel2" cx="205" cy="128" r="5" fill="#FF3D8B" />
        <circle className="s4-anim s4-travel3" cx="205" cy="188" r="5" fill="#7B2FFF" />

        {/* Etsy listing panel */}
        <rect x="260" y="30" width="190" height="240" rx="10" fill="var(--ill-card, #1A1208)" stroke="#2A1A08" strokeWidth="1.5" />
        <text x="275" y="48" fontSize="9" fill="#FFB800" letterSpacing="1">ETSY LISTING</text>

        {/* Empty fields (outlines) */}
        <rect x="275" y="62" width="160" height="28" rx="6" fill="#120C04" stroke="#2A1A08" />
        <rect x="275" y="98" width="160" height="60" rx="6" fill="#120C04" stroke="#2A1A08" />
        <rect x="275" y="166" width="160" height="44" rx="6" fill="#120C04" stroke="#2A1A08" />

        {/* Filled fields */}
        <g className="s4-anim s4-field1">
          <rect x="285" y="72" width="120" height="8" rx="4" fill="#FFB800" />
        </g>
        <g className="s4-anim s4-field2">
          <rect x="285" y="110" width="140" height="6" rx="3" fill="#6A5030" />
          <rect x="285" y="124" width="130" height="6" rx="3" fill="#6A5030" />
          <rect x="285" y="138" width="100" height="6" rx="3" fill="#6A5030" />
        </g>
        <g className="s4-anim s4-field3">
          <rect x="285" y="178" width="46" height="16" rx="8" fill="#3A1A2A" />
          <rect x="336" y="178" width="56" height="16" rx="8" fill="#2A1A3A" />
          <rect x="285" y="198" width="66" height="16" rx="8" fill="#3A2810" />
        </g>

        {/* Publish button */}
        <g className="s4-anim s4-publish">
          <rect x="280" y="220" width="150" height="30" rx="15" fill="#FF6000" />
          <text x="355" y="240" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">Publish listing</text>
        </g>

        {/* Success banner */}
        <g className="s4-anim s4-success">
          <rect x="260" y="200" width="190" height="70" rx="10" fill="#22C55E" />
          <text x="355" y="240" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">✓ Published!</text>
        </g>
      </svg>
    </div>
  )
}
