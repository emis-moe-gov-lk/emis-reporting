import "server-only";
import { listTeachers, type ListTeachersInput } from "@/server/services/teacher/list-teachers.service";

export const teacherController = {
  list(input: ListTeachersInput = {}) {
    return listTeachers(input);
  },
};
