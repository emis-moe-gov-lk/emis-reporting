import { RetirementRow, ServiceBand } from "@/types";

export const retirementRows: RetirementRow[] = [
  { name: "W.M. Somasiri Bandara", nic: "711122334V", dob: "14 Apr 1971", province: "Western", zonal: "Colombo", school: "Maharagama Central College", serviceYears: 32, date55: "14 Apr 2026" },
  { name: "K.A. Padmini Ranasinghe", nic: "710965412V", dob: "02 Sep 1971", province: "Western", zonal: "Colombo", school: "Kesbewa MV", serviceYears: 29, date55: "02 Sep 2026" },
  { name: "S. Ponnambalam", nic: "711234987V", dob: "28 Nov 1971", province: "Western", zonal: "Colombo", school: "Colombo Hindu College", serviceYears: 34, date55: "28 Nov 2026" },
  { name: "H.M. Ariyasena", nic: "690456123V", dob: "15 Jan 1970", province: "Western", zonal: "Homagama", school: "Homagama Central College", serviceYears: 30, date55: "15 Jan 2025" },
  { name: "D.M. Ranjani Kumari", nic: "751145623V", dob: "22 Aug 1975", province: "Central", zonal: "Kandy", school: "Kandy Girls' High School", serviceYears: 23, date55: "22 Aug 2030" },
  { name: "R.K. Somapala", nic: "741122556V", dob: "05 May 1974", province: "Southern", zonal: "Galle", school: "Galle Sangamitta MV", serviceYears: 26, date55: "05 May 2029" },
];

export function bandFor(years: number): ServiceBand {
  if (years <= 5) return "1–5";
  if (years <= 10) return "6–10";
  if (years <= 15) return "11–15";
  if (years <= 20) return "16–20";
  if (years <= 25) return "21–25";
  if (years <= 30) return "26–30";
  if (years <= 35) return "31–35";
  return "36–40";
}

export const serviceBands: ServiceBand[] = ["1–5", "6–10", "11–15", "16–20", "21–25", "26–30", "31–35", "36–40"];
