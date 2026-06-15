'use client'

import { useState, useEffect, useRef } from 'react'

export default function Step3Upload() {
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
          <linearGradient id="step3Photo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF3D8B" />
          </linearGradient>
        </defs>

        <style>{`
          .s3-anim { animation-play-state: var(--play, paused); animation-iteration-count: infinite; animation-timing-function: ease-in-out; }

          .s3-zone { animation-name: s3Zone; animation-duration: 4s; }
          @keyframes s3Zone {
            0%, 12%   { opacity: 1; }
            22%, 88%  { opacity: 0; }
            98%, 100% { opacity: 1; }
          }

          .s3-stroke { animation-name: s3Stroke; animation-duration: 2s; }
          @keyframes s3Stroke {
            0%, 100% { stroke: #2A1A08; }
            50%      { stroke: #FF3D8B; }
          }

          .s3-bounce {
            animation-name: s3Bounce;
            animation-duration: 1s;
            transform-box: fill-box;
            transform-origin: 50% 50%;
          }
          @keyframes s3Bounce {
            0%, 100% { transform: translateY(0px); }
            50%      { transform: translateY(-8px); }
          }

          .s3-photo {
            animation-name: s3Photo;
            animation-duration: 4s;
            transform-box: fill-box;
            transform-origin: 50% 50%;
          }
          @keyframes s3Photo {
            0%, 14%   { opacity: 0; transform: translateY(-80px); }
            28%, 60%  { opacity: 1; transform: translateY(0px); }
            74%, 100% { opacity: 0; transform: translateY(-80px); }
          }

          .s3-pill1 { animation-name: s3Pill1; animation-duration: 4s; }
          @keyframes s3Pill1 {
            0%, 36%   { opacity: 0; }
            42%, 88%  { opacity: 1; }
            96%, 100% { opacity: 0; }
          }
          .s3-pill2 { animation-name: s3Pill2; animation-duration: 4s; }
          @keyframes s3Pill2 {
            0%, 48%   { opacity: 0; }
            54%, 88%  { opacity: 1; }
            96%, 100% { opacity: 0; }
          }
          .s3-pill3 { animation-name: s3Pill3; animation-duration: 4s; }
          @keyframes s3Pill3 {
            0%, 60%   { opacity: 0; }
            66%, 88%  { opacity: 1; }
            96%, 100% { opacity: 0; }
          }

          .s3-dot { animation-name: s3Dot; animation-duration: 1s; }
          @keyframes s3Dot {
            0%, 100% { opacity: 0.25; }
            50%      { opacity: 1; }
          }
        `}</style>

        {/* Upload zone */}
        <g className="s3-anim s3-zone">
          <rect className="s3-anim s3-stroke" x="80" y="30" width="320" height="160" rx="12" fill="#120C04" strokeWidth="2" strokeDasharray="6,4" />
          <g className="s3-anim s3-bounce">
            <path d="M240 65 L240 105 M225 85 L240 65 L255 85" fill="none" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          <text x="240" y="135" textAnchor="middle" fontSize="13" fill="#6A5030">Drag photo here</text>
        </g>

        {/* Floating product photo */}
        <g className="s3-anim s3-photo">
          <rect x="160" y="40" width="160" height="120" rx="8" fill="url(#step3Photo)" />
          {/* simple mug shape */}
          <path d="M210 80 H260 V120 Q260 130 250 130 H220 Q210 130 210 120 Z" fill="#0D0A06" opacity="0.25" />
          <path d="M260 90 H272 Q280 90 280 100 Q280 110 272 110 H260" fill="none" stroke="#0D0A06" strokeWidth="4" opacity="0.25" />
        </g>

        {/* Analysis pills */}
        <g className="s3-anim s3-pill1">
          <rect x="90" y="210" width="130" height="26" rx="13" fill="#3A2810" />
          <text x="155" y="227" textAnchor="middle" fontSize="11" fill="#FFB800">📷 Photo analyzed</text>
        </g>
        <g className="s3-anim s3-pill2">
          <rect x="230" y="210" width="140" height="26" rx="13" fill="#3A1A2A" />
          <text x="300" y="227" textAnchor="middle" fontSize="11" fill="#FF3D8B">🏷 Category detected</text>
        </g>
        <g className="s3-anim s3-pill3">
          <rect x="165" y="245" width="150" height="26" rx="13" fill="#2A1A3A" />
          <text x="232" y="262" textAnchor="middle" fontSize="11" fill="#C9A8FF">✨ Generating listing...</text>
          <circle className="s3-anim s3-dot" cx="298" cy="258" r="2.5" fill="#C9A8FF" style={{ animationDelay: '0s' }} />
          <circle className="s3-anim s3-dot" cx="304" cy="258" r="2.5" fill="#C9A8FF" style={{ animationDelay: '0.15s' }} />
          <circle className="s3-anim s3-dot" cx="310" cy="258" r="2.5" fill="#C9A8FF" style={{ animationDelay: '0.3s' }} />
        </g>
      </svg>
    </div>
  )
}
