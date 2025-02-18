export interface Student {
	id: number;
	l_name: string;
	f_names: string;
	unoff_name: string;
	date_joined: Date;
	expected_grad_year: number;
	expected_grad_semester: number;
	ta_available: number;
	deleted: boolean;
	dropZone: number;
	multiCourses: boolean;
}
