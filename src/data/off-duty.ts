export type OffDutyEntry = {
  label: string;
  value: string;
  status: string;
};

/** Off-duty facts — numbers literal per the copy rule; jokes live in labels/status. */
export const offDuty: OffDutyEntry[] = [
  {
    label: "LOAD TEST",
    value: "Bench press: 335 lbs",
    status: "PASSED — within tolerance",
  },
  {
    label: "GRAPPLING FIRMWARE",
    value: "Wrestling — 4 years, since upgraded to Brazilian Jiu-Jitsu (current)",
    status: "v2 ACTIVE",
  },
  {
    label: "SPECTATOR MODULE",
    value: "MMA",
    status: "FAN — ENGAGED",
  },
];
