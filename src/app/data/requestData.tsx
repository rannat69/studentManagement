export interface Request {
	id: number;
	student_id: number;
	teacher_id: number;
	course_id: number;
	message: string;
	status: string;
	request_from: string;
	want: number;
	deleted: boolean;
	student_name?: string;
	teacher_name?: string;
	course_name?: string;
}
