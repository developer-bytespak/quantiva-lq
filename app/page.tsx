import Hero from '@/components/Hero'
import Services from '@/components/Features'
import DemoTrades from '@/components/DemoTrades'
import HowItWorks from '@/components/HowItWorks'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* <Hero /> */}
      <Services />
      <DemoTrades />
      <HowItWorks />
      <Footer />
    </main>
  )
}

