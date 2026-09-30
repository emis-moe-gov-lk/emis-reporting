import { TransferApplication, TransferKind } from "@/types";

export const transferData: Record<TransferKind, { cols: string[]; rows: TransferApplication[] }> = {
  interzonal: {
    cols: ["Teacher", "NIC / DOB", "Current school & zone", "Subject / appointment", "Service yrs", "Applied schools", "Status"],
    rows: [
      { id: "TR-2026-0001", name: "W.A. Sunethra Perera", nic: "691234567V", dob: "03 Jun 1969", currentSchool: "Maharagama Central College", currentZone: "Colombo", subject: "Mathematics", apptSubject: "Mathematics", serviceYears: 15, firstDate: "10 Jan 2011", firstSchool: "Deniyaya MMV", currentDate: "14 Mar 2011", schools: ["Homagama Central College", "Godagama MV", "Padukka National School"], status: "full" },
      { id: "TR-2026-0002", name: "K.M. Nishantha Silva", nic: "821987654V", dob: "21 Nov 1980", currentSchool: "Kesbewa MV", currentZone: "Colombo", subject: "Biology", apptSubject: "Science", serviceYears: 10, firstDate: "05 Feb 2016", firstSchool: "Matara Rahula College", currentDate: "02 Jan 2016", schools: ["Piliyandala MV", "Bandaragama Central"], status: "partial" },
      { id: "TR-2026-0003", name: "R.M. Chathurika Fernando", nic: "965432198V", dob: "09 Feb 1993", currentSchool: "Nugegoda Boys' School", currentZone: "Colombo", subject: "English", apptSubject: "English", serviceYears: 6, firstDate: "01 Jul 2019", firstSchool: "Galle Sangamitta MV", currentDate: "19 Aug 2019", schools: ["Negombo Girls' School", "Katunayake MV", "Wattala MV", "Ja-Ela National School"], status: "pending" },
    ],
  },
  anotherzonal: {
    cols: ["Teacher", "NIC / DOB", "Current school & zone", "Subject / appointment", "Service yrs", "Target zonal", "Applied schools", "Status"],
    rows: [
      { id: "TR-2026-0004", name: "S. Kajanthan", nic: "780654321V", dob: "14 Apr 1978", currentSchool: "Colombo Hindu College", currentZone: "Colombo", subject: "Tamil", apptSubject: "Tamil", serviceYears: 21, firstDate: "12 Mar 2001", firstSchool: "Jaffna Hindu College", currentDate: "20 Jun 2005", targetZone: "Homagama", schools: ["Homagama Tamil MV", "Seethawaka MV"], status: "full" },
      { id: "TR-2026-0005", name: "P.G. Ishara Madushanka", nic: "901122334V", dob: "30 Sep 1988", currentSchool: "Piliyandala MV", currentZone: "Piliyandala", subject: "Geography", apptSubject: "Geography", serviceYears: 9, firstDate: "18 May 2013", firstSchool: "Kalutara MV", currentDate: "01 Jan 2017", targetZone: "Negombo", schools: ["Negombo Girls' School", "Katunayake MV"], status: "pending" },
    ],
  },
  interprov: {
    cols: ["Teacher", "NIC / DOB", "Current school & zone", "Subject / appointment", "Service yrs", "Target province", "Target zonal", "Applied schools", "Status"],
    rows: [
      { id: "TR-2026-0006", name: "D.M. Ranjani Kumari", nic: "751145623V", dob: "22 Aug 1975", currentSchool: "Colombo Girls' High School", currentZone: "Colombo", subject: "Sinhala", apptSubject: "Sinhala", serviceYears: 23, firstDate: "04 Jan 1999", firstSchool: "Matale MV", currentDate: "14 Feb 2003", targetProvince: "Central", targetZone: "Kandy", schools: ["Kandy Girls' High School", "Katugastota MV"], status: "full" },
      { id: "TR-2026-0007", name: "A.L. Faslan Hussain", nic: "890345612V", dob: "11 Dec 1989", currentSchool: "Colombo Zahira College", currentZone: "Colombo", subject: "ICT", apptSubject: "ICT", serviceYears: 7, firstDate: "09 Sep 2018", firstSchool: "Puttalam MV", currentDate: "03 Jan 2019", targetProvince: "North Western", targetZone: "Kurunegala", schools: ["Kurunegala Central College"], status: "partial" },
    ],
  },
};
