import Header from "./Header";
import Hero from "./Hero";
import SocialProof from "./SocialProof";
import FeatureGrid from "./FeatureGrid";
import Workflow from "./Workflow";
import Integrations from "./Integrations";
import Security from "./Security";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import FinalCTA from "./FinalCTA";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        <Hero />
        <SocialProof />
        <FeatureGrid />
        <Workflow />
        <Integrations />
        <Security />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}