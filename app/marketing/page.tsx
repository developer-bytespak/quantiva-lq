import Hero from '@/components/Hero'
import Services from '@/components/Features'
import DemoTrades from '@/components/DemoTrades'
import HowItWorks from '@/components/HowItWorks'
import ContactFormSection from '@/components/ContactFormSection'
import Footer from '@/components/Footer'

export default function Marketing() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <DemoTrades />
      <HowItWorks />
      <ContactFormSection />
      <Footer />
    </main>
  )
}
