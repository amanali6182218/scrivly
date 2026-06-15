'use client'

import { useState, useEffect, useRef } from 'react'

export default function Step1Etsy() {
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
          <linearGradient id="step1Brand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="50%" stopColor="#FF3D8B" />
            <stop offset="100%" stopColor="#7B2FFF" />
          </linearGradient>
          <linearGradient id="step1Icon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB800" />
            <stop offset="100%" stopColor="#FF3D8B" />
          </linearGradient>
        </defs>

        <style>{`
          .s1-anim { animation-play-state: var(--play, paused); animation-iteration-count: infinite; }

          .s1-cursor {
            animation-name: s1CursorMove;
            animation-duration: 3s;
            animation-timing-function: ease-in-out;
            transform-box: fill-box;
            transform-origin: 0 0;
          }
          @keyframes s1CursorMove {
            0%   { transform: translate(320px, 60px); }
            30%  { transform: translate(230px, 165px); }
            45%  { transform: translate(230px, 168px) scale(0.9); }
            55%  { transform: translate(230px, 165px) scale(1); }
            85%  { transform: translate(230px, 165px); }
            100% { transform: translate(320px, 60px); }
          }

          .s1-envelope {
            animation-name: s1EnvelopeRise;
            animation-duration: 3s;
            animation-timing-function: ease-in-out;
            transform-box: fill-box;
            transform-origin: 0 0;
            opacity: 0;
          }
          @keyframes s1EnvelopeRise {
            0%   { opacity: 0; transform: translate(0px, 40px); }
            40%  { opacity: 0; transform: translate(0px, 40px); }
            60%  { opacity: 1; transform: translate(0px, 0px); }
            85%  { opacity: 1; transform: translate(0px, -5px); }
            100% { opacity: 0; transform: translate(0px, -20px); }
          }

          .s1-check {
            animation-name: s1EnvelopeRise;
            animation-duration: 3s;
            animation-timing-function: ease-in-out;
            animation-delay: 0.15s;
            transform-box: fill-box;
            transform-origin: 0 0;
            opacity: 0;
          }

          .s1-codetext {
            animation-name: s1EnvelopeRise;
            animation-duration: 3s;
            animation-timing-function: ease-in-out;
            transform-box: fill-box;
            transform-origin: 0 0;
            opacity: 0;
          }
        `}</style>

        {/* Browser window */}
        <rect x="60" y="30" width="360" height="240" rx="12" fill="var(--ill-card, #1A1208)" stroke="#2A1A08" strokeWidth="1.5" />
        {/* Browser dots */}
        <circle cx="80" cy="55" r="5" fill="#FF3D8B" />
        <circle cx="95" cy="55" r="5" fill="#FFB800" />
        <circle cx="110" cy="55" r="5" fill="#22C55E" />

        {/* Product card */}
        <rect x="90" y="75" width="300" height="120" rx="8" fill="#120C04" stroke="#2A1A08" />

        {/* Product icon */}
        <rect x="105" y="90" width="60" height="60" rx="10" fill="url(#step1Icon)" />
        <text x="135" y="162" textAnchor="middle" fontSize="10" fill="#6A5030">Scrivly</text>

        {/* Card text */}
        <text x="185" y="105" fontSize="13" fontWeight="bold" fill="#F5EDE0">Starter Pack</text>
        <text x="185" y="122" fontSize="11" fill="#6A5030">100 credits</text>
        <text x="185" y="145" fontSize="20" fontWeight="bold" fill="#FFB800">$9</text>

        {/* Buy button */}
        <rect x="185" y="158" width="100" height="28" rx="14" fill="url(#step1Brand)" />
        <text x="235" y="176" textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">Buy on Etsy</text>

        {/* Code sent text */}
        <text className="s1-anim s1-codetext" x="295" y="68" fontSize="9" fill="#22C55E">Code sent ✓</text>

        {/* Success envelope */}
        <g className="s1-anim s1-envelope" transform="translate(310, 80)">
          <path d="M0 0 H40 V28 H0 Z" fill="#1A1208" stroke="#FFB800" strokeWidth="1.5" />
          <path d="M0 0 L20 16 L40 0" fill="none" stroke="#FFB800" strokeWidth="1.5" />
        </g>
        {/* Checkmark circle */}
        <g className="s1-anim s1-check" transform="translate(345, 70)">
          <circle r="8" fill="#22C55E" />
          <path d="M-4 0 L-1 3 L4 -4" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Cursor */}
        <g className="s1-anim s1-cursor">
          <polygon points="0,0 0,20 6,15 10,24 13,22 9,13 16,13" fill="#F5EDE0" stroke="#0D0A06" strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}
