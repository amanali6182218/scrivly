'use client'

import { useState, useEffect, useRef } from 'react'

export default function Step2Redeem() {
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
          <linearGradient id="step2Brand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
        </defs>

        <style>{`
          .s2-anim { animation-play-state: var(--play, paused); animation-iteration-count: infinite; animation-duration: 5s; animation-timing-function: ease-in-out; }

          .s2-signup { animation-name: s2Signup; }
          @keyframes s2Signup {
            0%, 33%   { opacity: 1; }
            38%, 100% { opacity: 0; }
          }

          .s2-redeem { animation-name: s2Redeem; }
          @keyframes s2Redeem {
            0%, 38%   { opacity: 0; }
            42%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }

          .s2-success { animation-name: s2Success; }
          @keyframes s2Success {
            0%, 73%   { opacity: 0; }
            77%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }

          .s2-input-stroke { animation-name: s2InputStroke; }
          @keyframes s2InputStroke {
            0%, 40%   { stroke: #2A1A08; }
            45%, 88%  { stroke: #FF3D8B; }
            94%, 100% { stroke: #2A1A08; }
          }

          .s2-seg1 { animation-name: s2Seg1; }
          @keyframes s2Seg1 {
            0%, 41%   { opacity: 0; }
            43%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }
          .s2-seg2 { animation-name: s2Seg2; }
          @keyframes s2Seg2 {
            0%, 49%   { opacity: 0; }
            51%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }
          .s2-seg3 { animation-name: s2Seg3; }
          @keyframes s2Seg3 {
            0%, 57%   { opacity: 0; }
            59%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }
          .s2-seg4 { animation-name: s2Seg4; }
          @keyframes s2Seg4 {
            0%, 65%   { opacity: 0; }
            67%, 88%  { opacity: 1; }
            94%, 100% { opacity: 0; }
          }

          .s2-cursorblink { animation-name: s2CursorBlink; animation-duration: 0.8s; }
          @keyframes s2CursorBlink {
            0%, 50%  { opacity: 1; }
            51%, 100% { opacity: 0; }
          }

          .s2-checkmark { animation-name: s2Success; }
        `}</style>

        {/* Main card */}
        <rect x="60" y="25" width="360" height="250" rx="12" fill="var(--ill-card, #1A1208)" stroke="#2A1A08" strokeWidth="1.5" />

        {/* ── Phase 1: Signup form ───────────────────── */}
        <g className="s2-anim s2-signup">
          <text x="240" y="58" textAnchor="middle" fontSize="18" fontWeight="bold" fill="url(#step2Brand)">scrivly</text>

          {/* Email input */}
          <rect x="90" y="72" width="300" height="36" rx="8" fill="#120C04" stroke="#2A1A08" />
          <text x="108" y="95" fontSize="11" fill="#3A2810">your@email.com</text>

          {/* Password input */}
          <rect x="90" y="118" width="300" height="36" rx="8" fill="#120C04" stroke="#2A1A08" />
          {[108, 120, 132, 144, 156].map((cx) => (
            <circle key={cx} cx={cx} cy="136" r="3" fill="#3A2810" />
          ))}

          {/* Signup button */}
          <rect x="90" y="164" width="300" height="36" rx="18" fill="url(#step2Brand)" />
          <text x="240" y="187" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">Create free account</text>
        </g>

        {/* ── Phase 2: Redeem panel ──────────────────── */}
        <g className="s2-anim s2-redeem">
          <rect x="75" y="60" width="330" height="200" rx="12" fill="#120C04" stroke="#FF3D8B" strokeWidth="1.5" />

          <text x="240" y="90" textAnchor="middle" fontSize="9" fill="#FF3D8B" letterSpacing="1">REDEEM YOUR CODE</text>

          {/* Code input box */}
          <rect className="s2-anim s2-input-stroke" x="90" y="100" width="300" height="44" rx="8" fill="#0D0A06" stroke="#2A1A08" />

          {/* Typed code */}
          <g fontSize="14" fontFamily="monospace" fill="#F5EDE0">
            <text className="s2-anim s2-seg1" x="108" y="128">ETY-</text>
            <text className="s2-anim s2-seg2" x="148" y="128">X7K2</text>
            <text className="s2-anim s2-seg3" x="198" y="128">-M9PQ</text>
            <text className="s2-anim s2-seg4" x="258" y="128">-4R</text>
            <text className="s2-anim s2-cursorblink" x="290" y="128">|</text>
          </g>

          {/* Activate button */}
          <rect x="130" y="158" width="220" height="36" rx="18" fill="url(#step2Brand)" />
          <text x="240" y="181" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">Activate Credits →</text>
        </g>

        {/* ── Phase 3: Success ───────────────────────── */}
        <g className="s2-anim s2-success">
          <rect x="75" y="60" width="330" height="200" rx="12" fill="#120C04" stroke="#22C55E" strokeWidth="1.5" />
          <text x="240" y="145" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#FFB800">+100 credits added</text>
          <circle cx="240" cy="190" r="20" fill="#22C55E" />
          <path d="M230 190 L238 198 L252 180" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  )
}
