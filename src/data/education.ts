export type EducationEntry = {
  school: string;
  credential: string;
  period: string;
  details: string[];
};

export const education: EducationEntry[] = [
  {
    school: "University of California, Irvine",
    credential: "BS, Computer Science & Engineering · Minor in Innovation & Entrepreneurship",
    period: "2025 – 2027 (expected)",
    details: [
      "GPA 3.846 / 4.0",
      "Dean's Honor List — every quarter to date",
      "Coursework: ML & data mining, AI, algorithms, embedded software, operating systems, digital systems",
    ],
  },
  {
    school: "Chaffey College",
    credential: "Four AS degrees: Computer Science, Math, Physics, Physical Science — with Honors",
    period: "2022 – 2025",
    details: ["GPA 3.6 / 4.0", "113 units transferred"],
  },
];

export const overclockLine =
  "CURRENT LOAD: 24 units (summer quarter) — unit is overclocked";
