import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

/* ─────── Floating Gradient Orbs ─────── */
const orbs = [
  { size: 700, x: '-5%',  y: '-15%', color: 'rgba(139,92,246,0.18)',  delay: 0,   duration: 22 },
  { size: 550, x: '70%',  y: '10%',  color: 'rgba(192,132,252,0.12)',  delay: 3,   duration: 28 },
  { size: 600, x: '30%',  y: '55%',  color: 'rgba(255,141,199,0.10)',  delay: 6,   duration: 25 },
  { size: 450, x: '80%',  y: '70%',  color: 'rgba(99,102,241,0.12)',   delay: 9,   duration: 30 },
  { size: 500, x: '10%',  y: '80%',  color: 'rgba(139,92,246,0.08)',   delay: 12,  duration: 26 },
]

/* ─────── Particles ─────── */
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  opacity: Math.random() * 0.3 + 0.05,
  duration: Math.random() * 25 + 15,
  delay: Math.random() * 10,
}))

const AnimatedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 30, damping: 40 })
  const springY = useSpring(mouseY, { stiffness: 30, damping: 40 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* ── Noise texture overlay ── */}
      <div
        className="absolute inset-0 z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.035,
          mixBlendMode: 'soft-light' as React.CSSProperties['mixBlendMode'],
        }}
      />

      {/* ── Animated grid lines ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      {/* ── Gradient orbs ── */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: `blur(120px)`,
          }}
          animate={{
            x: [0, 60, -40, 30, 0],
            y: [0, -50, 40, -30, 0],
            scale: [1, 1.08, 0.94, 1.05, 1],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ── Floating particles ── */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.id % 3 === 0
              ? 'rgba(255,172,199,0.6)'
              : p.id % 3 === 1
                ? 'rgba(192,132,252,0.6)'
                : 'rgba(139,92,246,0.5)',
            boxShadow: `0 0 ${p.size * 3}px ${
              p.id % 2 === 0 ? 'rgba(139,92,246,0.3)' : 'rgba(255,172,199,0.25)'
            }`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 20, -15, 0],
            x: [0, 15, -20, 10, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity * 0.6, p.opacity * 1.4, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* ── Mouse reactive glow ── */}
      <motion.div
        className="absolute rounded-full pointer-events-none z-40"
        style={{
          width: 500,
          height: 500,
          x: springX,
          y: springY,
          translateX: '-50%',
          translateY: '-50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, rgba(192,132,252,0.03) 30%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* ── Deep gradient base ── */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0B12] via-[#111827] to-[#0B0B12]" />
    </div>
  )
}

export default AnimatedBackground
