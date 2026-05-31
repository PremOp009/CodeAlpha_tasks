/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          pink:    '#FFACC7',
          rose:    '#FF8DC7',
          purple:  '#C084FC',
          violet:  '#8B5CF6',
        },
        surface: {
          900: '#0B0B12',
          800: '#111827',
          700: '#1A1025',
          600: '#1e1b2e',
          500: '#252040',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(139,92,246,0.25) 0%, transparent 70%)',
        'card-gradient':  'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        'glow-purple':    'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)',
        'glow-pink':      'radial-gradient(circle, rgba(255,141,199,0.35) 0%, transparent 70%)',
      },
      animation: {
        'float':       'float 8s ease-in-out infinite',
        'float-slow':  'float 12s ease-in-out infinite reverse',
        'fade-up':     'fadeUp 0.7s ease-out forwards',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
        'shimmer':     'shimmer 2.5s linear infinite',
        'pulse-soft':  'pulseSoft 3s ease-in-out infinite',
        'counter':     'counter 2s ease-out forwards',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite alternate',
        'slide-left':  'slideLeft 0.4s ease-out forwards',
        'blob':        'blob 20s infinite alternate ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%':      { transform: 'translateY(-30px) scale(1.02)' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%':      { opacity: '0.85', transform: 'scale(1.04)' },
        },
        glowPulse: {
          '0%':   { boxShadow: '0 0 20px rgba(139,92,246,0.3), 0 0 40px rgba(139,92,246,0.1)' },
          '100%': { boxShadow: '0 0 35px rgba(139,92,246,0.55), 0 0 80px rgba(139,92,246,0.2)' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(50px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-40px, 40px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'card':        '0 1px 1px rgba(0,0,0,0.3), 0 4px 24px rgba(0,0,0,0.2)',
        'card-hover':  '0 2px 2px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-purple': '0 0 30px rgba(139,92,246,0.5)',
        'glow-pink':   '0 0 30px rgba(255,141,199,0.4)',
        'btn-primary': '0 4px 14px rgba(139,92,246,0.4)',
        'btn-hover':   '0 6px 20px rgba(139,92,246,0.6)',
      },
    },
  },
  plugins: [],
}
