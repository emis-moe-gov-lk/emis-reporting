import { GenericReport } from "@/types";

export const cadreReports: Record<"cadre" | "vacancy" | "surplus" | "ratio", GenericReport & { filters: string[] }> = {
  cadre: {
    title: "Approved Cadre vs Filled Posts",
    filters: ["Province", "Zonal", "School", "Subject", "Grade", "Medium"],
    statusCol: "Fill %",
    cols: ["Province", "Zonal", "School", "Subject", "Grade", "Medium", "Approved cadre", "Filled", "Vacant", "Fill %"],
    rows: [
      { Province: "Western", Zonal: "Colombo", School: "Maharagama Central College", Subject: "Mathematics", Grade: "6–11", Medium: "Sinhala", "Approved cadre": 8, Filled: 7, Vacant: 1, "Fill %": "88%" },
      { Province: "Western", Zonal: "Colombo", School: "Kesbewa MV", Subject: "Science", Grade: "6–11", Medium: "Sinhala", "Approved cadre": 5, Filled: 5, Vacant: 0, "Fill %": "100%" },
      { Province: "Southern", Zonal: "Galle", School: "Galle Sangamitta MV", Subject: "English", Grade: "6–11", Medium: "Sinhala", "Approved cadre": 4, Filled: 3, Vacant: 1, "Fill %": "75%" },
      { Province: "Central", Zonal: "Kandy", School: "Kandy Girls' High School", Subject: "Tamil", Grade: "12–13", Medium: "Tamil", "Approved cadre": 3, Filled: 2, Vacant: 1, "Fill %": "67%" },
    ],
  },
  vacancy: {
    title: "Vacancy Report with Ageing",
    filters: ["Province", "Zonal", "School"],
    cols: ["School", "Post / subject", "Zonal", "Province", "Vacant since", "Duration vacant"],
    rows: [
      { School: "Kesbewa MV", "Post / subject": "Science teacher", Zonal: "Colombo", Province: "Western", "Vacant since": "01 Mar 2025", "Duration vacant": "18 months" },
      { School: "Galle Sangamitta MV", "Post / subject": "English teacher", Zonal: "Galle", Province: "Southern", "Vacant since": "12 Jan 2026", "Duration vacant": "8 months" },
      { School: "Kurunegala Central College", "Post / subject": "ICT teacher", Zonal: "Kurunegala", Province: "North Western", "Vacant since": "05 Jun 2026", "Duration vacant": "3 months" },
    ],
  },
  surplus: {
    title: "Surplus & Deficit Report",
    filters: ["Province", "Zonal", "School", "Subject", "Medium"],
    statusCol: "Surplus / deficit",
    cols: ["Level", "Subject", "Medium", "Required", "Actual", "Surplus / deficit"],
    rows: [
      { Level: "Maharagama Central College", Subject: "Mathematics", Medium: "Sinhala", Required: 6, Actual: 8, "Surplus / deficit": "+2" },
      { Level: "Kesbewa MV", Subject: "Science", Medium: "Sinhala", Required: 5, Actual: 4, "Surplus / deficit": "-1" },
      { Level: "Colombo zone", Subject: "Tamil", Medium: "Tamil", Required: 40, Actual: 33, "Surplus / deficit": "-7" },
      { Level: "Western province", Subject: "English", Medium: "English", Required: 210, Actual: 224, "Surplus / deficit": "+14" },
    ],
  },
  ratio: {
    title: "Teacher–Student Ratio Report",
    filters: ["School", "Subject", "Grade"],
    cols: ["School", "Subject", "Grade", "Students", "Teachers", "Ratio"],
    rows: [
      { School: "Maharagama Central College", Subject: "Mathematics", Grade: "10", Students: 620, Teachers: 8, Ratio: "78:1" },
      { School: "Kesbewa MV", Subject: "Science", Grade: "11", Students: 340, Teachers: 5, Ratio: "68:1" },
      { School: "Galle Sangamitta MV", Subject: "English", Grade: "9", Students: 410, Teachers: 3, Ratio: "137:1" },
    ],
  },
};
