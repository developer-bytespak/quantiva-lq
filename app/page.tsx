import Hero from '@/components/Hero'
import Services from '@/components/Features'
import DemoTrades from '@/components/DemoTrades'
import HowItWorks from '@/components/HowItWorks'
import ChooseYourPlan from '@/components/ChooseYourPlan'
import ContactUs from '@/components/ContactUs'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <DemoTrades />
      <HowItWorks />
      <ChooseYourPlan />
      <ContactUs />
      <Footer />
    </main>
  )
}

