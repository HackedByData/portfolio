import Image from "next/image";
import { profile } from "@/data/profile";

export default function Hero() {
  return (
    <section className="bg-blueprint border-b border-signal/10">
      <div className="mx-auto grid max-w-5xl gap-10 px-4 pb-20 pt-16 md:grid-cols-[1fr_minmax(280px,380px)] md:items-center">
        <div>
          <p className="font-mono text-xs tracking-widest text-phosphor">
            CLASSIFIED // UNIT DOSSIER — CLEARED FOR PUBLIC DISCLOSURE
          </p>
          <h1 className="mt-4 font-sans text-5xl font-bold tracking-tight text-body sm:text-6xl">
            DEVIN McCAW
          </h1>
          <p className="mt-2 font-mono text-sm text-signal">
            {profile.unitId} · {profile.unitClass}
          </p>
          <p className="mt-1 font-mono text-xs text-phosphor">
            STATUS: {profile.status} · LOCATION: {profile.location}
          </p>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-body/90">
            {profile.tagline}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-sm">
            <a
              href="#terminal"
              className="border border-signal bg-signal/10 px-4 py-2 text-signal hover:bg-signal hover:text-bg"
            >
              &gt; INTERROGATE THE UNIT
            </a>
            <a
              href="#uplink"
              className="border border-phosphor/40 px-4 py-2 text-phosphor hover:border-signal hover:text-signal"
            >
              &gt; CONTACT
            </a>
          </div>
        </div>

        <figure className="panel-brackets relative aspect-[4/5] overflow-hidden">
          <Image
            src="/images/devin-hero.jpg"
            alt="Devin McCaw in a navy blazer at the AILA annual immigration-law conference"
            fill
            priority
            sizes="(min-width: 768px) 380px, 100vw"
            className="object-cover brightness-95 contrast-105 saturate-[0.65] [object-position:42%_18%]"
          />
          {/* green duotone wash + scanlines over the photo */}
          <div
            aria-hidden
            className="absolute inset-0 bg-signal/10 mix-blend-color"
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(to bottom, transparent 0 2px, rgba(0,0,0,0.28) 3px)",
            }}
          />
          <figcaption className="absolute inset-x-0 bottom-0 flex justify-between bg-bg/70 px-3 py-2 font-mono text-[10px] tracking-widest text-signal">
            <span>FOCUS: LOCKED</span>
            <span>THREAT LEVEL: FRIENDLY</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
