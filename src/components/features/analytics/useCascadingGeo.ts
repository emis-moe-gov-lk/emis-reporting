"use client";
import { useState } from "react";
import { GeoHierarchy } from "@/types";

/**
 * Drives the province -> district -> zonal -> divisional -> school chain.
 * Each level's options depend on everything picked above it, and a level
 * only becomes selectable once its parent has a value — this is what makes
 * the filter panel reveal one step at a time instead of showing every field
 * at once.
 */
export function useCascadingGeo(tree: GeoHierarchy) {
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [zonal, setZonal] = useState("");
  const [divisional, setDivisional] = useState("");
  const [school, setSchool] = useState("");

  const districts = province ? Object.keys(tree[province]) : [];
  const zones = province && district ? Object.keys(tree[province][district]) : [];
  const divisions = province && district && zonal ? Object.keys(tree[province][district][zonal]) : [];
  const schools = province && district && zonal && divisional ? tree[province][district][zonal][divisional] : [];

  return {
    values: { province, district, zonal, divisional, school },
    options: { districts, zones, divisions, schools },
    setProvince: (v: string) => { setProvince(v); setDistrict(""); setZonal(""); setDivisional(""); setSchool(""); },
    setDistrict: (v: string) => { setDistrict(v); setZonal(""); setDivisional(""); setSchool(""); },
    setZonal: (v: string) => { setZonal(v); setDivisional(""); setSchool(""); },
    setDivisional: (v: string) => { setDivisional(v); setSchool(""); },
    setSchool,
  };
}
