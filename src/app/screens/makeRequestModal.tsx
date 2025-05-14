// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Request } from "../data/requestData";
import axios from "axios";
import { MODE_CREATION, MODE_DELETE, MODE_EDITION } from "../constants";
import { Teacher } from "../data/teacherListData";
import { Student } from "../data/studentListData";
import { Course } from "../data/courseListData";

interface ModalProps {
	isOpen: boolean;
	request: Request | null;
	onClose: () => void;
	onSave: (updatedRequest: Request) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, request, onClose, onSave }) => {
	const [formData, setFormData] = useState<Request | null>(request);
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const [teachersListState, setTeachersListState] = useState<Teacher[]>([]);
	const [studentsListState, setStudentsListState] = useState<Student[]>([]);
	const [coursesListState, setCoursesListState] = useState<Course[]>([]);

	useEffect(() => {
		// get teachers
		const fetchTeachers = async () => {
			const response = await axios.get("http://localhost:5000/teachers");

			setTeachersListState(response.data);
		};

		fetchTeachers();

		// get students
		const fetchStudents = async () => {
			const response = await axios.get("http://localhost:5000/students");

			setStudentsListState(response.data);
		};

		fetchStudents();

		// get courses
		const fetchCourses = async () => {
			const response = await axios.get("http://localhost:5000/courses");

			setCoursesListState(response.data);
		};

		fetchCourses();
	}, []);

	useEffect(() => {
		if (request) {
			setMode(MODE_EDITION);
			setFormData(request);
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
				want: true,
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

			const response = await fetch("http://localhost:5000/requests", {
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
				`http://localhost:5000/requests/${id}`,
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
			const response = await fetch(`http://localhost:5000/requests/${id}`, {
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

		e.preventDefault();
		if (formData) {
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
				want: true,
				deleted: false,
			});

			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className={styles.modal}>
			<div>
				<span className={styles.close} onClick={onClose}>
					&times;
				</span>

				<button onClick={() => handleCancel()}>Cancel</button>

				<form onSubmit={handleSubmit} className={styles.modalContent}>
					<div className={styles.modalContentColumn}>
						{mode === MODE_EDITION ? (
							<h2>Edit Request</h2>
						) : (
							<h2>Create Request</h2>
						)}
						Request made by{" "}
						<select
							name='request_from'
							onChange={handleChange}
							value={formData ? formData.request_from : ""}>
							<option value={""}>-- Who made the request ? --</option>
							<option value={"Teacher"}>Teacher</option>
							<option value={"Student"}>Student</option>
						</select>
						<select
							name='want'
							onChange={handleChange}
							value={formData ? String(formData.want) : "true"}>
							<option value={"true"}>Want</option>
							<option value={"false"}>Do not want</option>
						</select>
						Student list
						<select
							name='student_id'
							onChange={handleChange}
							value={formData ? formData.student_id : 0}>
							<option value={0}>-- Which student ? --</option>
							{studentsListState.map((student) => (
								<option key={student.id} value={student.id}>
									{student.l_name + " " + student.f_names}
								</option>
							))}
						</select>
						Teacher list
						<select
							name='teacher_id'
							onChange={handleChange}
							value={formData ? formData.teacher_id : 0}>
							<option value={0}>-- Which teacher ? --</option>
							{teachersListState.map((teacher) => (
								<option key={teacher.id} value={teacher.id}>
									{teacher.l_name}
								</option>
							))}
						</select>
						Course list
						<select
							name='course_id'
							onChange={handleChange}
							value={formData ? formData.course_id : 0}>
							<option value={0}>-- Which course ? --</option>
							{coursesListState.map((course) => (
								<option key={course.id} value={course.id}>
									{course.name}
								</option>
							))}
						</select>
						Message
						<input
							name='message'
							value={formData ? formData.message : ""}
							onChange={handleChange}
							placeholder='Message'
						/>
						{/* Add more fields as needed */}
						<button type='submit'>Save</button>
						{errorMessage.length > 0 && (
							<div className={styles.error}>{errorMessage}</div>
						)}
					</div>
				</form>
				{mode === MODE_EDITION && (
					<button onClick={() => handleDelete()}>Delete</button>
				)}
			</div>
		</div>
	);
};

export default Modal;
