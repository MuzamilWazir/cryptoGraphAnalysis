import GraphSection from "@/components/sections/GraphSection";
import HeroSection from "@/components/sections/HeroSection";
import Navbar from "@/components/sections/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <GraphSection/>
    </div>
  );
}
