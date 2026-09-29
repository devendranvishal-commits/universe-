import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import LiveDashboard from "../components/LiveDashboard";
import Pillars from "../components/Pillars";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Navbar />
      <Hero />
      <LiveDashboard />
      <Pillars />
      <CTA />
    </main>
  );
}