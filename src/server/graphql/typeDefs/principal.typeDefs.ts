export const principalTypeDefs = /* GraphQL */ `
  type PrincipalResult {
    rows: [Principal!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type Principal {
    employeeId: String!
    name: String
    nic: String
    genderId: String
    gender: String
    currentSchoolId: String
    currentSchool: String
    currentZonalId: String
    currentZonal: String
    serviceId: String
    service: String
    rankId: String
    rank: String
  }
`;
