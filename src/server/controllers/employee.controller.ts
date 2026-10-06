import "server-only";
import { principalController } from "@/server/controllers/principal.controller";
import { teacherController } from "@/server/controllers/teacher.controller";
import { AppError } from "@/server/errors/app-error";

export const employeeController = {
  list(type: string | null, page?: number, limit?: number) {
    if (type === "teacher") return teacherController.list({ page, limit });
    if (type === "principal") return principalController.list({ page, limit });
    throw new AppError("The type parameter must be teacher or principal.", 400, "type");
  },
};
