import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/data/profile";

export const alt =
  "Devin McCaw — Founder, Engineer, Salesman-Class Unit. UNIT MCW-2027 dossier card.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/,
  );
  if (resource) {
    const response = await fetch(resource[1]);
    if (response.status === 200) return await response.arrayBuffer();
  }
  throw new Error("failed to load font data");
}

export default async function Image() {
  const headline = "DEVIN McCAW";
  const sub = "UNIT MCW-2027 · FOUNDER-CLASS";
  const tag = "Founder & CEO, Parasource · CS&E @ UC Irvine";
  const domainDisplay = profile.domain.replace(/^https?:\/\//, "");
  const footer = `${domainDisplay} — interrogate the unit`;

  const photoData = await readFile(
    join(process.cwd(), "public", "images", "devin-hero.jpg"),
    "base64",
  );
  const photoSrc = `data:image/jpeg;base64,${photoData}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: 64,
          background: "#0a0e0f",
          color: "#e6edea",
          fontFamily: "Space Grotesk",
          border: "6px solid #00ff9c",
        }}
      >
        <img
          src={photoSrc}
          alt=""
          width={340}
          height={420}
          style={{
            objectFit: "cover",
            objectPosition: "42% 18%",
            border: "2px solid #00ff9c",
            filter: "saturate(0.65)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#63b891" }}>
            CLASSIFIED // UNIT DOSSIER
          </div>
          <div style={{ fontSize: 84, fontWeight: 700, marginTop: 8 }}>
            {headline}
          </div>
          <div style={{ fontSize: 34, color: "#00ff9c", marginTop: 8 }}>
            {sub}
          </div>
          <div style={{ fontSize: 28, color: "#e6edea", marginTop: 24 }}>
            {tag}
          </div>
          <div style={{ fontSize: 24, color: "#63b891", marginTop: 24 }}>
            {footer}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: await loadGoogleFont(
            "Space+Grotesk:wght@700",
            headline + sub + tag + "CLASSIFIED // UNIT DOSSIER" + footer,
          ),
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
