import type { Employee } from "@/server/models/employee.model";

/** Reserved for the principal report module. */
export type Principal = Employee & {
  currentSchoolId: string | null;
  currentSchool: string | null;
  currentZonalId: string | null;
  currentZonal: string | null;
  serviceId: string | null;
  service: string | null;
  rankId: string | null;
  rank: string | null;
};
