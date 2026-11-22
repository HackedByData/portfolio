export type Benchmark = {
  id: string;
  end: number;
  format: (n: number) => string;
  label: string;
  caption: string;
  /** Span the full grid width (use for an odd card out). */
  wide?: boolean;
};

export const benchmarks: Benchmark[] = [
  {
    id: "quota",
    end: 200,
    format: (n) => `${n}%`,
    label: "REVENUE VS QUOTA",
    caption: "Averaged 150–200% of sales quota at Verizon, 2024–2025.",
  },
  {
    id: "rank",
    end: 802,
    format: (n) => `#1/${n}`,
    label: "NATIONWIDE STORE RANK",
    caption:
      "Drove his MarketSource store to #1 in the nation out of 802 stores.",
  },
  {
    id: "productivity",
    end: 600,
    format: (n) => `+${n}%`,
    label: "TEAM SALES PRODUCTIVITY",
    caption:
      "Increased sales productivity 600%+ YTD by training new reps at MarketSource.",
  },
  {
    id: "growth",
    end: 350,
    format: (n) => `${n}%`,
    label: "ORG GROWTH, ONE QUARTER",
    caption:
      "Grew Triangle Fraternity 350% in one quarter — fastest-growing chapter nationwide.",
  },
  {
    id: "pitch",
    end: 2,
    format: (n) => `${n}× WINNER`,
    label: "VERIZON PITCH COMPETITION",
    caption:
      "Won a Verizon pitch competition at both the store and district level.",
    wide: true,
  },
];
