import { teacherController } from "@/server/controllers/teacher.controller";

export const teacherResolvers = {
  Query: {
    teachers: (_parent: unknown, args: { page?: number; limit?: number }) =>
      teacherController.list(args),
  },
};
