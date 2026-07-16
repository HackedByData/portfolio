import BootOverlay from "@/components/BootOverlay";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SpecSheet from "@/components/SpecSheet";

export default function Home() {
  return (
    <>
      <BootOverlay />
      <Nav />
      <main id="top">
        <Hero />
        <SpecSheet />
      </main>
    </>
  );
}
