// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Teacher } from "../data/teacherListData";
import axios from "axios";
import { MODE_CREATION, MODE_DELETE, MODE_EDITION } from "../constants";

interface ModalProps {
	isOpen: boolean;
	teacher: Teacher | null;
	onClose: () => void;
	onSave: (updatedTeacher: Teacher) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, teacher, onClose, onSave }) => {
	const [formData, setFormData] = useState<Teacher>({
		id: 0, // ou une autre valeur par défaut
		l_name: '',
		f_names: '',
		unoff_name: '',
		field: '',
		deleted: false,
	});
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	useEffect(() => {
		if (teacher) {
			setMode(MODE_EDITION);
			setFormData(teacher);
		} else {
			// We are in creation mode

			setFormData({
				id: 0,
				l_name: "",
				f_names: "",
				unoff_name: "",
				field: "",
				deleted: false,
			});
			setMode(MODE_CREATION);
		}
	}, [teacher]); // Add teacher to the dependency array

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData(prevFormData => {
			const updatedData = {
				...prevFormData,
				[name]: value,
			};
	
			// Assurez-vous que id est défini
			if (updatedData.id === undefined) {
				updatedData.id = 0; // ou une autre valeur par défaut
			}
	
			return updatedData;
		});

	
	};

	const createTeacher = async (teacherData: Teacher) => {
		try {
			const response = await fetch("http://localhost:5000/teachers", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(teacherData),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			return data; // Return the newly created teacher ID or object
		} catch (error) {
			console.error("Error adding teacher:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const updateTeacher = async (id: number, updatedData: Teacher) => {
		try {
			await axios.put(`http://localhost:5000/teachers/${id}`, updatedData);
		} catch (error) {
			console.error("Error updating teacher:", error);
		}
	};

	const deleteTeacher = async (id: number) => {
		try {
			const response = await fetch(`http://localhost:5000/teachers/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			console.log("Teacher deleted:", data);
			return data; // Return the deleted teacher ID or any other info
		} catch (error) {
			console.error("Error deleting teacher:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const handleCancel = () => {
		setErrorMessage("");
		onClose();
	};

	const handleDelete = () => {
		if (teacher) {
			setMode(MODE_DELETE);

			setErrorMessage("");
			onClose();
			deleteTeacher(teacher.id);

			teacher.deleted = true;

			onSave(teacher);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		setErrorMessage("");

		if (formData) {
			e.preventDefault();

			if (!formData.l_name || formData.l_name.length === 0) {
				setErrorMessage("Please enter a surname");
				return;
			}

			if (!formData.field || formData.field.length === 0) {
				setErrorMessage("Please enter a field");
				return;
			}

			if (mode === MODE_CREATION) {
				createTeacher(formData).then((newTeacher) => {
					// Update the state with the new teacher
					formData.id = newTeacher.id;

					onSave(formData);
				});
			} else {
				if (mode === MODE_DELETE) {
					formData.deleted = true;
				} else {
					updateTeacher(formData.id, formData);
				}
				onSave(formData);
			}

			setFormData({
				id: 0,
				l_name: "",
				f_names: "",
				unoff_name: "",
				field: "",
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

				<button  className={styles.buttonCancel}  onClick={() => handleCancel()}>Cancel</button>

				<form onSubmit={handleSubmit} className={styles.modalContent}>
					<div className={styles.modalContentColumn}>
						{mode === MODE_EDITION ? (
							<h2>Edit Teacher</h2>
						) : (
							<h2>Add Teacher</h2>
						)}
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
						Field
						<input
							name='field'
							value={formData ? formData.field : ""}
							onChange={handleChange}
							placeholder='field'
						/>
						{/* Add more fields as needed */}
						<button className={styles.buttonSave} type='submit'>Save</button>
						{errorMessage.length > 0 && (
							<div className={styles.error}>{errorMessage}</div>
						)}
					</div>
				</form>
				{mode === MODE_EDITION && (
					<button className={styles.buttonDelete} onClick={() => handleDelete()}>Delete</button>
				)}
			</div>
		</div>
	);
};

export default Modal;
