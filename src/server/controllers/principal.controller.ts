import "server-only";
import { listPrincipals, type ListPrincipalsInput } from "@/server/services/principal/list-principals.service";

export const principalController = {
  list(input: ListPrincipalsInput = {}) {
    return listPrincipals(input);
  },
};
