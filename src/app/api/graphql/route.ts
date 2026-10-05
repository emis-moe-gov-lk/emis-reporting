import { createYoga } from "graphql-yoga";
import { schema } from "@/server/graphql/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  graphiql: process.env.NODE_ENV === "development",
  maskedErrors: true,
  cors: false,
  fetchAPI: { Response },
});

export { handleRequest as GET, handleRequest as POST, handleRequest as OPTIONS };
