export const teacherTypeDefs = /* GraphQL */ `
  input TeacherFiltersInput {
    province: String
    district: String
    zonal: String
    divisional: String
    school: String
    subject: String
    gender: String
    teacherCategory: String
    medium: String
  }

  type TeacherFilterOptions {
    provinces: [String!]!
    districts: [String!]!
    zonals: [String!]!
    divisionals: [String!]!
    schools: [String!]!
    subjects: [String!]!
    genders: [String!]!
    teacherCategories: [String!]!
    mediums: [String!]!
  }

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
