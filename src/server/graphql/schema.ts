import "server-only";
import { createSchema } from "graphql-yoga";
import { checkDatabaseConnection } from "@/server/services/database.service";
import { teacherTypeDefs } from "@/server/graphql/typeDefs/teacher.typeDefs";
import { teacherResolvers } from "@/server/graphql/resolvers/teacher.resolver";
import { principalTypeDefs } from "@/server/graphql/typeDefs/principal.typeDefs";
import { principalResolvers } from "@/server/graphql/resolvers/principal.resolver";

export const schema = createSchema({
  typeDefs: [/* GraphQL */ `
    type Query {
      "Returns true when the configured MySQL database can be queried; otherwise false."
      databaseConnected: Boolean!
      "Returns paginated active teachers for development testing."
      teachers(page: Int = 1, limit: Int = 25, filters: TeacherFiltersInput): TeacherResult!
      "Returns paginated active principals for development testing."
      principals(page: Int = 1, limit: Int = 25): PrincipalResult!
    }

  `, teacherTypeDefs, principalTypeDefs],
  resolvers: {
    Query: {
      databaseConnected: () => checkDatabaseConnection(),
      ...teacherResolvers.Query,
      ...principalResolvers.Query,
    },
  },
});
