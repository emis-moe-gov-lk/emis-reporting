import "server-only";
import { createSchema } from "graphql-yoga";
import { checkDatabaseConnection } from "@/server/services/database.service";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      "Returns true when the configured MySQL database can be queried."
      databaseConnected: Boolean!
    }
  `,
  resolvers: {
    Query: {
      databaseConnected: () => checkDatabaseConnection(),
    },
  },
});
