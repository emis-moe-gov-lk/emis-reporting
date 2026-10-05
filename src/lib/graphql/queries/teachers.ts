export const TEACHERS_QUERY = /* GraphQL */ `
  query MyQuery($page: Int!, $limit: Int!, $filters: TeacherFiltersInput) {
    teachers(page: $page, limit: $limit, filters: $filters) {
      total
      page
      limit
      totalPages
      rows {
        employeeId
        nic
        currentZonal
        name
        currentSchool
        subject
        gender
        teacherCategory
        medium
        firstServiceDate
        serviceYears
      }
    }
  }
`;
