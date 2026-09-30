import { GeoHierarchy, SimpleGeo } from "@/types";

export const geoHierarchy: GeoHierarchy = {
  Western: {
    Colombo: {
      Colombo: {
        Maharagama: ["Maharagama Central College", "Maharagama MV"],
        Kesbewa: ["Kesbewa MV", "Kesbewa Central College"],
      },
      Homagama: { Homagama: ["Homagama Central College", "Godagama MV"] },
    },
    Gampaha: { Negombo: { Negombo: ["Negombo Girls' School", "Katunayake MV"] } },
  },
  Southern: { Galle: { Galle: { Galle: ["Galle Sangamitta MV", "Richmond College"] } } },
  Central: { Kandy: { Kandy: { Kandy: ["Kandy Girls' High School", "Dharmaraja College"] } } },
};

/** Simplified province -> zonal -> schools tree used by the Retirement report */
export const retireGeo: SimpleGeo = {
  Western: {
    Colombo: ["Maharagama Central College", "Kesbewa MV", "Colombo Hindu College"],
    Homagama: ["Homagama Central College", "Godagama MV"],
  },
  Southern: { Galle: ["Galle Sangamitta MV", "Richmond College"] },
  Central: { Kandy: ["Kandy Girls' High School", "Dharmaraja College"] },
};
