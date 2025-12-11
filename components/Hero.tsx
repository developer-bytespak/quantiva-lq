import React from 'react'
import CanvasScrollAnimation from './CanvasScrollAnimation'

const Hero: React.FC = () => {
  return (
    <section className="relative">
      <CanvasScrollAnimation 
        frameCount={359}
        scrollDuration={4} /* total scroll length in viewport heights */
        useSmoothScroll={true}
        showNavigation={true}
      />
    </section>
  )
}

export default Hero

