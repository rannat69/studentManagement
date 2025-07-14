// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Request } from "../data/requestData";
import axios from "axios";
import { MODE_CREATION, MODE_DELETE, MODE_EDITION } from "../constants";
import { Teacher } from "../data/teacherListData";
import { Student } from "../data/studentListData";
import { Course } from "../data/courseListData";
import ReactSelect from "react-select";

interface ModalProps {
	isOpen: boolean;
	request: Request | null;
	onClose: () => void;
	onSave: (updatedRequest: Request) => void;
}

interface Dropbox {
	value: number,
	name: string
}

const Modal: React.FC<ModalProps> = ({ isOpen, request, onClose, onSave }) => {
	const [formData, setFormData] = useState<Request | null>(request);
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const [teachersListState, setTeachersListState] = useState<Teacher[]>([]);
	const [studentsListState, setStudentsListState] = useState<Student[]>([]);
	const [coursesListState, setCoursesListState] = useState<Course[]>([]);

	const [selectedCourse, setSelectedCourse] = useState<Dropbox>({ value: 0, name: "" });
	const [selectedTeacher, setSelectedTeacher] = useState<Dropbox>({ value: 0, name: "" });
	const [selectedStudent, setSelectedStudent] = useState<Dropbox>({ value: 0, name: "" });
	useEffect(() => {



		// get teachers
		const fetchTeachers = async () => {
			const response = await axios.get("/api/teacher/all");

			response.data = response.data.sort((a: Teacher, b: Teacher) => {
				if (a.l_name < b.l_name) {
					return -1;
				}
				if (a.l_name > b.l_name) {
					return 1;
				}
				return 0;
			});


			setTeachersListState(response.data);
		};

		fetchTeachers();

		// get students
		const fetchStudents = async () => {
			const response = await axios.get("/api/student/all");

			response.data = response.data.sort((a: Student, b: Student) => {
				if (a.l_name < b.l_name) {
					return -1;
				}
				if (a.l_name > b.l_name) {
					return 1;
				}
				return 0;
			});

			setStudentsListState(response.data);
		};

		fetchStudents();

		// get courses
		const fetchCourses = async () => {
			const response = await axios.get("/api/course/all");

			// order list response.data on response.data.name 
			response.data = response.data.sort((a: Course, b: Course) => {
				if (a.hkust_identifier < b.hkust_identifier) {
					return -1;
				}
				if (a.hkust_identifier > b.hkust_identifier) {
					return 1;
				}
				return 0;
			});

			// find course with id = formData.course_id im courseListState



			setCoursesListState(response.data);
		};

		fetchCourses();



		//setSelectedCourse({ value: 16 });

	}, []);

	useEffect(() => {
		if (request) {
			setMode(MODE_EDITION);
			setFormData(request);

			coursesListState.forEach((course: Course) => {
				if (course.id == request?.course_id) {


					setSelectedCourse({ value: course.id, name: course.hkust_identifier + " - " + course.name });
				}
			});

			studentsListState.forEach((student: Student) => {
				if (student.id == request?.student_id) {

					setSelectedStudent({ value: student.id, name: student.l_name + " " + student.f_names });
				}
			});

			teachersListState.forEach((teacher: Teacher) => {
				if (teacher.id == request?.teacher_id) {


					setSelectedTeacher({ value: teacher.id, name: teacher.l_name + " " + teacher.f_names });
				}
			});


		} else {
			// We are in creation mode

			setFormData({
				id: 0,
				student_id: 0,
				teacher_id: 0,
				course_id: 0,
				message: "",
				status: "",
				request_from: "",
				want: 1,
				deleted: false,
			});
			setMode(MODE_CREATION);
		}
	}, [request]); // Add request to the dependency array

	const handleChange = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	) => {
		const { name, type, value } = e.target;
		let newValue;

		if (type === "select-one") {
			newValue = value;
		} else if (name === "want") {
			newValue = value === "true";
		} else {
			newValue = value;
		}

		if (formData) {
			setFormData({
				...formData,
				[name]: newValue,
			});
		}
	};

	const createRequest = async (requestData: Request | null) => {
		try {
			console.log(requestData);

			const response = await fetch("/api/request/create", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(requestData),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			return data; // Return the newly created request ID or object
		} catch (error) {
			console.error("Error adding request:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const updateRequest = async (id: number, updatedData: Request) => {
		try {
			const response = await axios.put(
				`/api/request/${id}`,
				updatedData
			);

			if (response.statusText != "OK") {
				throw new Error("Network response was not ok");
			}
		} catch (error) {
			console.error("Error updating request:", error);
		}
	};

	const deleteRequest = async (id: number) => {
		try {
			const response = await fetch(`/api/request/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			console.log("Request deleted:", data);
			return data; // Return the deleted request ID or any other info
		} catch (error) {
			console.error("Error deleting request:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const handleCancel = () => {
		setErrorMessage("");
		onClose();
	};

	const handleDelete = () => {
		if (request) {
			setMode(MODE_DELETE);

			setErrorMessage("");
			onClose();
			deleteRequest(request.id);

			request.deleted = true;

			onSave(request);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		setErrorMessage("");

		let studentId = 0;
		let courseId = 0;
		let teacherId = 0;

		const student = document.getElementsByName("studentList") as NodeListOf<HTMLInputElement>;
		if (student.length > 0) {
			studentId = Number(student[0].value);
		}

		const teacher = document.getElementsByName("teacherList") as NodeListOf<HTMLInputElement>;
		if (teacher.length > 0) {
			teacherId = Number(teacher[0].value);
		}

		const course = document.getElementsByName("courseList") as NodeListOf<HTMLInputElement>;
		if (course.length > 0) {
			courseId = Number(course[0].value);
		}

		e.preventDefault();

		if (formData) {

			if (formData.request_from === "") {
				setErrorMessage("Please select who made the request.");
				return null;
			}

			if (studentId === 0) {
				setErrorMessage("Please select a student.");
				return null;
			} else {
				formData.student_id = studentId;
			}

			if (teacherId === 0) {
				setErrorMessage("Please select a teacher.");
				return null;
			} else {
				formData.teacher_id = teacherId;
			}

			if (courseId === 0) {
				setErrorMessage("Please select a course.");
				return null;
			} else {
				formData.course_id = courseId;
			}

			if (mode === MODE_CREATION) {
				createRequest(formData).then((newRequest) => {
					// Update the state with the new request
					formData.id = newRequest.id;

					onSave(formData);
				});
			} else {
				if (mode === MODE_DELETE) {
					formData.deleted = true;
				} else {
					updateRequest(formData.id, formData);
				}
				onSave(formData);
			}

			setFormData({
				id: 0,
				student_id: 0,
				teacher_id: 0,
				course_id: 0,
				message: "",
				status: "",
				request_from: "",
				want: 1,
				deleted: false,
			});

			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className={ styles.modal }>
			<div>
				<span className={ styles.close } onClick={ onClose }>
					&times;
				</span>

				<button className={ styles.buttonCancel } onClick={ () => handleCancel() }>Cancel</button>

				<form onSubmit={ handleSubmit } className={ styles.modalContent }>
					<div className={ styles.modalContentColumn }>
						{ mode === MODE_EDITION ? (
							<h2>Edit Request</h2>
						) : (
							<h2>Create Request</h2>
						) }
						Request made by{ " " }
						<select
							name='request_from'
							onChange={ handleChange }
							value={ formData ? formData.request_from : "" }>
							<option value={ "" }>-- Who made the request ? --</option>
							<option value={ "Teacher" }>Teacher</option>
							<option value={ "Student" }>Student</option>
						</select>
						<select
							name='want'
							onChange={ handleChange }
							value={ formData ? String(formData.want) : 1 }>
							<option value={ 1 }>Want</option>
							<option value={ 0 }>Do not want</option>
						</select>
						Student list

						<ReactSelect
							name="studentList"
							options={ studentsListState.map((student) => ({
								value: student.id,
								name: student.l_name + " " + student.f_names,
							})) }
							getOptionLabel={ (option) => option.name }
							value={ selectedStudent }
						/>

						Teacher list

						<ReactSelect
							name="teacherList"
							options={ teachersListState.map((teacher) => ({
								value: teacher.id,
								name: teacher.l_name + " " + teacher.f_names,
							})) }
							getOptionLabel={ (option) => option.name }
							value={ selectedTeacher }
						/>

						Course list

						<ReactSelect
							name="courseList"
							options={ coursesListState.map((course) => ({
								value: course.id,
								name: course.hkust_identifier + " - " + course.name,
							})) }
							getOptionLabel={ (option) => option.name }
							onChange={ (e) => console.log(e) } // Update the selected course
							value={ selectedCourse }
						/>

						Message
						<input
							name='message'
							value={ formData ? formData.message : "" }
							onChange={ handleChange }
							placeholder='Message'
						/>
						{/* Add more fields as needed */ }
						<button className={ styles.buttonSave } type='submit'>Save</button>
						{ errorMessage.length > 0 && (
							<div className={ styles.error }>{ errorMessage }</div>
						) }
					</div>
				</form>
				{ mode === MODE_EDITION && (
					<button className={ styles.buttonDelete } onClick={ () => handleDelete() }>Delete</button>
				) }
			</div>
		</div>
	);
};

export default Modal;
