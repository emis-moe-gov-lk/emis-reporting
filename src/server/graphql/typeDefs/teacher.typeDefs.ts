export const teacherTypeDefs = /* GraphQL */ `
  type TeacherResult {
    rows: [Teacher!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type Teacher {
    employeeId: String!
    name: String
    nic: String
    currentSchoolId: String
    currentSchool: String
    currentZonalId: String
    currentZonal: String
    subjectId: String
    subject: String
    genderId: String
    gender: String
    teacherCategoryId: String
    teacherCategory: String
    mediumId: String
    medium: String
    firstServiceDate: String
    serviceYears: Int
  }
`;
