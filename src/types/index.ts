export type ServiceBand = "1–5" | "6–10" | "11–15" | "16–20" | "21–25" | "26–30" | "31–35" | "36–40";

export interface Teacher {
  name: string;
  nic: string;
  school: string;
  zonal: string;
  province?: string;
  district?: string;
  divisional?: string;
  subject: string;
  gender: "Male" | "Female";
  category: "1AB" | "1C" | "Type 2" | "Type 3";
  medium: "Sinhala" | "Tamil" | "English";
  serviceYears: number;
}

export interface TransferApplication {
  id: string;
  name: string;
  nic: string;
  dob: string;
  currentSchool: string;
  currentZone: string;
  subject: string;
  apptSubject: string;
  serviceYears: number;
  firstDate: string;
  firstSchool: string;
  currentDate: string;
  targetProvince?: string;
  targetZone?: string;
  schools: string[];
  status: "full" | "partial" | "pending";
}

export type TransferKind = "interzonal" | "anotherzonal" | "interprov";

export interface GenericRow {
  [key: string]: string | number;
}

export interface GenericReport {
  title: string;
  cols: string[];
  rows: GenericRow[];
  statusCol?: string;
}

export interface RetirementRow {
  name: string;
  nic: string;
  dob: string;
  province: string;
  zonal: string;
  school: string;
  serviceYears: number;
  date55: string;
}

/** province -> district -> zone -> division -> schools */
export type GeoHierarchy = Record<string, Record<string, Record<string, Record<string, string[]>>>>;
/** province -> zone -> schools (used by the Retirement report) */
export type SimpleGeo = Record<string, Record<string, string[]>>;
