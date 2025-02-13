// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Course } from "../data/courseListData";
import axios from "axios";
import { MODE_CREATION, MODE_DELETE, MODE_EDITION } from "../constants";

interface ModalProps {
	isOpen: boolean;
	course: any;
	onClose: () => void;
	onSave: (updatedCourse: any) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, course, onClose, onSave }) => {
	const [formData, setFormData] = useState<Course>(course);
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		if (course) {
			setMode(MODE_EDITION);
			setFormData(course);
		} else {
			// We are in creation mode
			setFormData({
				id: 0,
				hkust_identifier: "",
				name: "",
				description: "",
				field: "",
				keywords: "",
				semester: 0,
				year: 0,
				ta_needed: 0,
				deleted: false,
			});
			setMode(MODE_CREATION);
		}
	}, [course]); // Add course to the dependency array

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const createCourse = async (courseData: Course) => {
		console.log("courseData", courseData);

		try {
			const response = await fetch("http://localhost:5000/courses", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(courseData),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			console.log("Course added:", data);
			return data; // Return the newly created course ID or object
		} catch (error) {
			console.error("Error adding course:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const updateCourse = async (id: number, updatedData: Course) => {
		try {
			const response = await axios.put(
				`http://localhost:5000/courses/${id}`,
				updatedData
			);
		} catch (error) {
			console.error("Error updating course:", error);
		}
	};

	const deleteCourse = async (id: number) => {
		try {
			const response = await fetch(`http://localhost:5000/courses/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			console.log("Course deleted:", data);
			return data; // Return the deleted course ID or any other info
		} catch (error) {
			console.error("Error deleting course:", error);
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
		deleteCourse(course.id);

		course.deleted = true;

		onSave(course);
	};

	const handleSubmit = (e: React.FormEvent) => {
		setErrorMessage("");

		e.preventDefault();

		// check if ta_available is number
		if (isNaN(Number(formData.ta_needed))) {
			setErrorMessage("T.A. available must be a number");
			return;
		}

		// same for  semester
		if (isNaN(Number(formData.semester))) {
			setErrorMessage("Semester must be a number");
			return;
		}

		// same for  semester
		if (isNaN(Number(formData.year))) {
			setErrorMessage("Semester must be a number");
			return;
		}

		if (mode === MODE_CREATION) {
			createCourse(formData).then((newCourse) => {
				// Update the state with the new course
				formData.id = newCourse.id;

				onSave(formData);
			});
		} else {
			if (mode === MODE_DELETE) {
				formData.deleted = true;

				console.log("formData", formData);
			} else {
				updateCourse(formData.id, formData);
			}
			onSave(formData);
		}

		setFormData({
			id: 0,
			hkust_identifier: "",
			name: "",
			description: "",
			field: "",
			keywords: "",
			semester: 0,
			year: 0,
			ta_needed: 0,
			deleted: false,
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
					{mode === MODE_EDITION ? <h2>Edit Course</h2> : <h2>Add Course</h2>}
					Identifier
					<input
						name='hkust_identifier'
						value={formData ? formData.hkust_identifier : ""}
						onChange={handleChange}
						placeholder='Identifier'
					/>
					Name
					<input
						name='name'
						value={formData ? formData.name : ""}
						onChange={handleChange}
						placeholder='Name'
					/>
					Description
					<input
						name='description'
						value={formData ? formData.description : ""}
						onChange={handleChange}
						placeholder='Description'
					/>
					Field
					<input
						name='field'
						value={formData ? formData.field : ""}
						onChange={handleChange}
						placeholder='Field'
					/>
					Keywords
					<input
						name='keywords'
						value={formData ? formData.keywords : ""}
						onChange={handleChange}
						placeholder='Keywords'
					/>
					Year
					<input
						name='year'
						value={formData ? formData.year : ""}
						onChange={handleChange}
						placeholder='Year'
						type='number'
					/>
					Semester
					<input
						name='semester'
						value={formData ? formData.semester : ""}
						onChange={handleChange}
						placeholder='Semester'
						type='number'
					/>
					T.A. needed
					<input
						name='ta_needed'
						value={formData ? formData.ta_needed : ""}
						onChange={handleChange}
						placeholder='Number of T.A. needed'
						type='number'
					/>
					{/* Add more fields as needed */}
					<button type='submit'>Save</button>
					{errorMessage.length > 0 && (
						<div className={styles.error}>{errorMessage}</div>
					)}
				</form>

				{mode != MODE_CREATION && (
					<button onClick={() => handleDelete()}>Delete</button>
				)}
			</div>
		</div>
	);
};

export default Modal;
