import { principalController } from "@/server/controllers/principal.controller";

export const principalResolvers = {
  Query: {
    principals: (_parent: unknown, args: { page?: number; limit?: number }) =>
      principalController.list(args),
  },
};
