import { teacherController } from "@/server/controllers/teacher.controller";
import type { ListTeachersInput } from "@/server/services/teacher/list-teachers.service";

export const teacherResolvers = {
  Query: {
    teachers: (_parent: unknown, args: ListTeachersInput) =>
      teacherController.list(args),
    teacherFilterOptions: (_parent: unknown, args: ListTeachersInput) =>
      teacherController.filterOptions(args.filters ?? {}),
  },
};
