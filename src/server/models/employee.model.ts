export type Employee = {
  employeeId: string;
  name: string | null;
  nic: string | null;
  genderId: string | null;
  gender: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
};
