import "server-only";
import {
  listTeacherFilterOptions,
  listTeachers,
  type ListTeachersInput,
  type TeacherFilters,
} from "@/server/services/teacher/list-teachers.service";

export const teacherController = {
  list(input: ListTeachersInput = {}) {
    return listTeachers(input);
  },
  filterOptions(filters: TeacherFilters) {
    return listTeacherFilterOptions(filters);
  },
};
