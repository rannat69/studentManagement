export interface Student {
	id: number;
	student_number: number;
	l_name: string;
	f_names: string;
	unoff_name: string;
	program: string;
	date_joined: Date;
	expected_grad_year: number;
	expected_grad_semester: string;
	ta_available: number;
	available: boolean;
	deleted: boolean;
	dropZone: number;
	multiCourses: boolean;
}
