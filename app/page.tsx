import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import WhyThisExists from "./components/WhyThisExists";
import WhoItsFor from "./components/WhoItsFor";
import WhatYouGet from "./components/WhatYouGet";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <WhyThisExists />
      <WhoItsFor />
      <WhatYouGet />
      <Footer />
    </>
  );
}
