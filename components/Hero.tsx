import React from 'react'
import CanvasScrollAnimation from './CanvasScrollAnimation'

const Hero: React.FC = () => {
  return (
    <section className="relative">
      <CanvasScrollAnimation 
        frameCount={182}
        useSmoothScroll={true}
        showNavigation={true}
      />
    </section>
  )
}

export default Hero