import Header from "@/components/wwa/Header"
import Hero from "@/components/wwa/Hero"
import ProofBand from "@/components/wwa/ProofBand"
import Mission from "@/components/wwa/Mission"
import Programs from "@/components/wwa/Programs"
import MiaSection from "@/components/wwa/MiaSection"
import Footer from "@/components/wwa/Footer"
import ApplyModal from "@/components/wwa/ApplyModal"

export default function Home() {
  return (
    <main className="min-h-screen bg-background" id="top">
      <Header />
      <Hero />
      <ProofBand />
      <Mission />
      <Programs />
      <MiaSection />
      <Footer />
      <ApplyModal />
    </main>
  )
}
