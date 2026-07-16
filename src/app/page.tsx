import type { Person, WithContext } from "schema-dts";
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
import { profile } from "@/data/profile";

const jsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: profile.domain,
  image: `${profile.domain}/images/devin-hero.jpg`,
  jobTitle: "Founder & CEO, Parasource",
  email: `mailto:${profile.email}`,
  alumniOf: "University of California, Irvine",
  sameAs: [profile.github, profile.linkedin, profile.parasource],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
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
