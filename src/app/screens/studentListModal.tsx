// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Student } from "../data/studentListData";
import axios from "axios";
import { MODE_CREATION, MODE_DELETE, MODE_EDITION, PROGRAMS } from "../constants";

interface ModalProps {
	isOpen: boolean;
	student: any;
	onClose: () => void;
	onSave: (updatedStudent: any) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, student, onClose, onSave }) => {
	const [formData, setFormData] = useState<Student>(student);
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		if (student) {
			setMode(MODE_EDITION);
			setFormData(student);
		} else {
			// We are in creation mode

			setFormData({
				id: 0,
				student_number: 0,
				l_name: "",
				f_names: "",
				unoff_name: "",
				date_joined: new Date(),
				expected_grad_year: 0,
				expected_grad_semester: 0,
				ta_available: 0,
				deleted: false,
				dropZone: 0,
				multiCourses: false,
			});
			setMode(MODE_CREATION);
		}
	}, [student]); // Add student to the dependency array

	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const createStudent = async (studentData: Student) => {
		try {
			const response = await fetch("http://localhost:5000/students", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(studentData),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			return data; // Return the newly created student ID or object
		} catch (error) {
			console.error("Error adding student:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const updateStudent = async (id: number, updatedData: Student) => {
		try {
			const response = await axios.put(
				`http://localhost:5000/students/${id}`,
				updatedData
			);
		} catch (error) {
			console.error("Error updating student:", error);
		}
	};

	const deleteStudent = async (id: number) => {
		try {
			const response = await fetch(`http://localhost:5000/students/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			console.log("Student deleted:", data);
			return data; // Return the deleted student ID or any other info
		} catch (error) {
			console.error("Error deleting student:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const handleCancel = () => {
		setErrorMessage("");
		onClose();
	};

	const handleDelete = () => {
		setMode(MODE_DELETE);

		setErrorMessage("");
		onClose();
		deleteStudent(student.id);

		student.deleted = true;

		onSave(student);
	};

	const handleSubmit = (e: React.FormEvent) => {
		setErrorMessage("");

		e.preventDefault();

		if (!formData.l_name || formData.l_name.length === 0) {
			setErrorMessage("Please enter a surname");
			return;
		}

		// check if ta_available is number
		if (isNaN(Number(formData.ta_available))) {
			setErrorMessage("T.A. available must be a number");
			return;
		}

		if (formData.ta_available < 0) {
			setErrorMessage("T.A. available must be a positive number");
			return;
		}

		if (formData.expected_grad_year <= 0) {
			setErrorMessage("Year must be a positive number");
			return;
		}

		if (mode === MODE_CREATION) {
			createStudent(formData).then((newStudent) => {
				// Update the state with the new student
				formData.id = newStudent.id;

				onSave(formData);
			});
		} else {
			if (mode === MODE_DELETE) {
				formData.deleted = true;
			} else {
				updateStudent(formData.id, formData);
			}
			onSave(formData);
		}

		setFormData({
			id: 0,
			student_number: 0,
			l_name: "",
			f_names: "",
			unoff_name: "",
			date_joined: new Date(),
			expected_grad_year: 0,
			expected_grad_semester: 0,
			ta_available: 0,
			deleted: false,
			dropZone: 0,
			multiCourses: false,
		});

		onClose();
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
					{mode === MODE_EDITION ? <h2>Edit Student</h2> : <h2>Add Student</h2>}
					Student number
					<input
						name='student_number'
						value={formData ? formData.student_number : 0}
						onChange={handleChange}
						placeholder='Student number'
					/>
					Surname
					<input
						name='l_name'
						value={formData ? formData.l_name : ""}
						onChange={handleChange}
						placeholder='Surname'
					/>
					Other names{" "}
					<input
						name='f_names'
						value={formData ? formData.f_names : ""}
						onChange={handleChange}
						placeholder='Other names'
					/>
					Unofficial name
					<input
						name='unoff_name'
						value={formData ? formData.unoff_name : ""}
						onChange={handleChange}
						placeholder='Unofficial name'
					/>
					<br />
					Program
					<select
						name='program'
						onChange={handleChange}
						value={formData ? formData.program : ""}>
						<option value=''>None</option>

						{PROGRAMS.map((program) => (
							<option key={program} value={program}>
								{program}
							</option>
						))}
					</select>
					Date joined
					<input
						name='date_joined'
						type='date'
						value={formData ? formData.date_joined : ""}
						onChange={handleChange}
					/>
					Expected graduation date
					<br /> Year
					<input
						name='expected_grad_year'
						type='number'
						value={formData ? formData.expected_grad_year : ""}
						onChange={handleChange}
					/>
					Semester
					<select
						name='expected_grad_semester'
						onChange={handleChange}
						value={formData ? formData.expected_grad_semester : "Spring"}>
						<option value='Spring'>Spring</option>

						<option value='Summer'>Summer</option>

						<option value='Fall'>Fall</option>
						<option value='Winter'>Winter</option>
					</select>
					T.A. available
					<input
						name='ta_available'
						type='number'
						value={formData ? formData.ta_available : ""}
						onChange={handleChange}
						placeholder='Number of T.A. available'
					/>
					{/* Add more fields as needed */}
					<button type='submit'>Save</button>
					{errorMessage.length > 0 && (
						<div className={styles.error}>{errorMessage}</div>
					)}
				</form>
				{mode === MODE_EDITION && (
					<button onClick={() => handleDelete()}>Delete</button>
				)}
			</div>
		</div>
	);
};

export default Modal;
