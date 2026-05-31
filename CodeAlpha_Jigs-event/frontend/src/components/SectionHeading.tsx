import React from 'react'

interface Props {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  badge?: string
  noMargin?: boolean
}

const SectionHeading: React.FC<Props> = ({ title, subtitle, align = 'center', badge, noMargin = false }) => {
  return (
    <div className={`${noMargin ? '' : 'mb-10 md:mb-14'} ${align === 'center' ? 'text-center' : 'text-left'}`}>
      {badge && (
        <span className="section-label">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 text-white tracking-tight leading-tight">
        {title.split(' ').map((word, i, arr) => {
          if (i === arr.length - 1) {
            return <span key={i} className="gradient-text">{word}</span>
          }
          return <span key={i}>{word} </span>
        })}
      </h2>
      {subtitle && (
        <p className="text-text-muted max-w-2xl text-base md:text-lg font-light leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeading
