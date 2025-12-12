import { HomepageHeader } from '@/components/homepage/homepage-header'
import { HeroSection } from '@/components/homepage/hero-section'
import Services from '@/components/Services'
import DemoTrades from '@/components/DemoTrades'
import HowItWorks from '@/components/HowItWorks'
import ChooseYourPlan from '@/components/ChooseYourPlan'
import ContactUs from '@/components/ContactUs'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* <HomepageHeader /> */}
      <HeroSection />
      <Services />
      <DemoTrades />
      <HowItWorks />
      <ChooseYourPlan />
      <ContactUs />
      <Footer />
    </main>
  )
}
