export interface Student {
  id: number;
  student_number: string;
  l_name: string;
  f_names: string;
  unoff_name: string;
  program: string;
  email: string;
  date_joined: Date;
  expected_grad_year: number;
  expected_grad_semester: string;
  ta_available: number;
  ta_assigned: number;
  available: boolean;
  manual_match_only: boolean;
  deleted: boolean;
  dropZone: number;
  multiCourses: boolean;
}
