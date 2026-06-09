import Header from "@/components/wwa/Header"
import Hero from "@/components/wwa/Hero"
import ProofBand from "@/components/wwa/ProofBand"
import Programs from "@/components/wwa/Programs"
import MiaSection from "@/components/wwa/MiaSection"
import Footer from "@/components/wwa/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <ProofBand />
      <Programs />
      <MiaSection />
      <Footer />
    </main>
  )
}
