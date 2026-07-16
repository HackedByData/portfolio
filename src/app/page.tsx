import BootOverlay from "@/components/BootOverlay";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import SpecSheet from "@/components/SpecSheet";
import Benchmarks from "@/components/Benchmarks";
import Modules from "@/components/Modules";
import TrainingData from "@/components/TrainingData";
import Changelog from "@/components/Changelog";
import Terminal from "@/components/Terminal";
import Uplink from "@/components/Uplink";

export default function Home() {
  return (
    <>
      <BootOverlay />
      <Nav />
      <main id="top">
        <Hero />
        <SpecSheet />
        <Benchmarks />
        <Modules />
        <TrainingData />
        <Changelog />
        <Terminal />
        <Uplink />
      </main>
    </>
  );
}
