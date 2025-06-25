// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Student } from "../data/studentListData";
import axios from "axios";
import {
	AREAS,
	MODE_CREATION,
	MODE_DELETE,
	MODE_EDITION,
	PROGRAMS,
	QUALIFICATIONS,
} from "../constants";

interface ModalProps {
	isOpen: boolean;
	student: Student | null;
	onClose: () => void;
	onSave: (updatedStudent: Student) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, student, onClose, onSave }) => {
	const [formData, setFormData] = useState<Student | null>(student);
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const [qualifications, setQualifications] = useState<string[]>();
	const [selectedQualif, setSelectedQualif] = useState<string>("");

	const [areas, setAreas] = useState<string[]>();
	const [selectedArea, setSelectedArea] = useState<string>("");

	useEffect(() => {
		console.log("useEffect", student);

		if (student) {
			setQualifications([]);
			setAreas([]);

			setMode(MODE_EDITION);
			setFormData(student);

			const fetchQualifs = async () => {
				try {
					if (student != null) {
						const response = await axios.get(
							`http://localhost:5000/student_qualifications/${student.id}`
						);

						setQualifications(response.data);
						return response.data;
					} else {
						return null;
					}
				} catch (error: unknown) {
					if (axios.isAxiosError(error)) {
						// Gérer les erreurs d'axios
						console.error("Axios Error:", error.message);
					} else {
						// Gérer les autres erreurs
						console.error("Error:", error);
					}

					return false;
				}
			};
			fetchQualifs();

			const fetchAreas = async () => {
				try {
					if (student != null) {
						const response = await axios.get(
							`http://localhost:5000/student_areas/${student.id}`
						);

						setAreas(response.data);
						return response.data;
					} else {
						return null;
					}
				} catch (error: unknown) {
					if (axios.isAxiosError(error)) {
						// Gérer les erreurs d'axios
						console.error("Axios Error:", error.message);
					} else {
						// Gérer les autres erreurs
						console.error("Error:", error);
					}

					return false;
				}
			};
			fetchAreas();
		} else {
			// We are in creation mode

			setFormData({
				id: 0,
				student_number: 0,
				l_name: "",
				f_names: "",
				unoff_name: "",
				program: "",
				date_joined: new Date(),
				expected_grad_year: 0,
				expected_grad_semester: "Spring",
				ta_available: 0,
				available: true,
				deleted: false,
				dropZone: 0,
				multiCourses: false,
				qualification: [],
				area: [],
			});
			setQualifications([]);
			setAreas([]);
			setMode(MODE_CREATION);
		}
	}, [student]); // Add student to the dependency array

	const handleChange = (
		e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
	) => {
		const { name, type, value } = e.target;
		let newValue;

		if (type === "checkbox") {
			// Utiliser une assertion de type pour accéder à checked
			newValue = (e.target as HTMLInputElement).checked;
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

	function addQualif(): void {
		// get the currently selected area and add it to the areas array
		//in the formData

		setErrorMessage("");

		// the currently selected area is in the select whose idea is "area"

		if (selectedQualif === "") {
			setErrorMessage("Please select a qualification");
			return;
		}
		if (qualifications && qualifications.includes(selectedQualif)) {
			setErrorMessage("Qualification already added");
			return;
		}

		if (qualifications) {
			setQualifications([...qualifications, selectedQualif]);
		} else {
			setQualifications([selectedQualif]);
		}
	}

	function addArea(): void {
		// get the currently selected area and add it to the areas array
		//in the formData

		setErrorMessage("");

		// the currently selected area is in the select whose idea is "area"

		if (selectedArea === "") {
			setErrorMessage("Please select an area");
			return;
		}
		if (areas && areas.includes(selectedArea)) {
			setErrorMessage("Area already added");
			return;
		}

		if (areas) {
			setAreas([...areas, selectedArea]);
		} else {
			setAreas([selectedArea]);
		}
	}

	const createStudent = async (studentData: Student) => {
		try {
			let response = await fetch("http://localhost:5000/students", {
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

			// Delete all qualifications for student first
			response = await fetch(
				`http://localhost:5000/student_qualifications/${studentData.id}`,
				{
					method: "DELETE",
				}
			);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			// Delete all areas for student first
			response = await fetch(
				`http://localhost:5000/student_areas/${studentData.id}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			// Add qualifications
			if (qualifications && qualifications.length > 0) {
				qualifications.forEach(async (qualif) => {
					const studentQualif = {
						studentId: data.id,
						qualification: qualif,
					};
					response = await fetch(
						"http://localhost:5000/student_qualifications",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(studentQualif),
						}
					);
				});
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			// Add areas


			if (areas && areas.length > 0) {
				areas.forEach(async (area) => {
					const studentArea = {
						studentId: data.id,
						area: area,
					};
					response = await fetch("http://localhost:5000/student_areas", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(studentArea),
					});
				});
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return data; // Return the newly created student ID or object
		} catch (error) {
			console.error("Error adding student:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const updateStudent = async (id: number, updatedData: Student) => {


		try {


			await axios.put(`http://localhost:5000/students/${id}`, updatedData);
		
			// Delete all qualifs for student first
			await fetch(`http://localhost:5000/student_qualifications/${id}`, {
				method: "DELETE",
			});

			// Delete all areas for student first
			await fetch(`http://localhost:5000/student_areas/${id}`, {
				method: "DELETE",
			});
		
			// Add qualifs

	

			if (qualifications && qualifications.length > 0) {
				qualifications.forEach(async (qualif) => {
					const qualifStudent = {
						studentId: id,
						qualification: qualif,
					};
					await fetch("http://localhost:5000/student_qualifications", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(qualifStudent),
					});
				});
			}

			// Add areas
	

			if (areas && areas.length > 0) {
				areas.forEach(async (area) => {
					const areaStudent = {
						studentId: id,
						area: area,
					};

					await fetch("http://localhost:5000/student_areas", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(areaStudent),
					});
				});
			}
		} catch (error) {
			console.error("Error updating student:", error);
		}
	};

	const deleteStudent = async (id: number) => {
		try {
			let response = await fetch(`http://localhost:5000/students/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			// Delete all qualifs for student first
			response = await fetch(
				`http://localhost:5000/student_qualifications/${id}`,
				{
					method: "DELETE",
				}
			);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			// Delete all qualifs for student first
			response = await fetch(`http://localhost:5000/student_areas/${id}`, {
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
		if (student) {
			setMode(MODE_DELETE);

			setErrorMessage("");
			onClose();
			deleteStudent(student.id);

			student = {
				id: student.id,
				student_number: 0,
				l_name: "",
				f_names: "",
				unoff_name: "",
				program: "",
				date_joined: new Date(),
				expected_grad_year: 0,
				expected_grad_semester: "Spring",
				ta_available: 0,
				available: false,
				deleted: true,
				dropZone: 0,
				multiCourses: false,
				area:[],
				qualification:[]
			};

			onSave(student);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		setErrorMessage("");

		e.preventDefault();
		if (formData) {
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

			onClose();
		}
	};

	if (!isOpen) return null;

	return (
		<div className={styles.modal}>
			<div className={styles.modal2}>
				<span className={styles.close} onClick={onClose}>
					&times;
				</span>

				<button className={styles.buttonCancel} onClick={() => handleCancel()}>
					Cancel
				</button>

				<form onSubmit={handleSubmit} className={styles.modalContent}>
					<div className={styles.modalContentRow}>
						<div className={styles.modalContentColumn}>
							{mode === MODE_EDITION ? (
								<h2>Edit Student</h2>
							) : (
								<h2>Add Student</h2>
							)}
							Student number
							<input
								name='student_number'
								value={
									formData && formData.student_number
										? formData.student_number
										: 0
								}
								onChange={handleChange}
								placeholder='Student number'
								type='number'
							/>
							Surname
							<input
								name='l_name'
								value={formData && formData.l_name ? formData.l_name : ""}
								onChange={handleChange}
								placeholder='Surname'
							/>
							Other names{" "}
							<input
								name='f_names'
								value={formData && formData.f_names ? formData.f_names : ""}
								onChange={handleChange}
								placeholder='Other names'
							/>
							Unofficial name
							<input
								name='unoff_name'
								value={
									formData && formData.unoff_name ? formData.unoff_name : ""
								}
								onChange={handleChange}
								placeholder='Unofficial name'
							/>
							<br />
							Program
							<select
								name='program'
								onChange={handleChange}
								value={formData && formData.program ? formData.program : ""}>
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
								value={
									formData
										? formData.date_joined instanceof Date
											? formData.date_joined.toISOString().split("T")[0]
											: formData.date_joined
										: ""
								}
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
							Student available
							<input
								name='available'
								type='checkbox'
								checked={formData ? formData.available : true}
								onChange={handleChange}></input>
						</div>

						<div className={styles.modalContentColumn}>
							Qualifications
							<div>
								<select
									id='qualifications'
									onChange={(e) => setSelectedQualif(e.target.value)}>
									<option key='' value=''>
										-- Choose a qualification --
									</option>

									{QUALIFICATIONS.map((qualif) => (
										<option key={qualif} value={qualif}>
											{qualif}
										</option>
									))}
								</select>
								<div onClick={() => addQualif()} className={styles.add}>
									+{" "}
								</div>
								{qualifications && qualifications.length > 0 && (
									<div>
										{qualifications.map((qualif) => (
											<div key={qualif}>
												<div className={styles.smalltext}>{qualif}</div>
												<div
													className={styles.remove}
													onClick={() => {
														setQualifications(
															qualifications.filter((a) => a !== qualif)
														);
														qualifications.filter((a) => a !== qualif);
													}}>
													x
												</div>
											</div>
										))}
									</div>
								)}
							</div>
							Areas
							<div>
								<select
									id='areas'
									onChange={(e) => setSelectedArea(e.target.value)}>
									<option key='' value=''>
										-- Choose an area --
									</option>

									{AREAS.map((area) => (
										<option key={area} value={area}>
											{area}
										</option>
									))}
								</select>
								<div onClick={() => addArea()} className={styles.add}>
									+{" "}
								</div>
								{areas && areas.length > 0 && (
									<div>
										{areas.map((area) => (
											<div key={area}>
												<div className={styles.smalltext}>{area}</div>
												<div
													className={styles.remove}
													onClick={() => {
														setAreas(areas.filter((a) => a !== area));
														areas.filter((a) => a !== area);
													}}>
													x
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Add more fields as needed */}
					<button className={styles.buttonSave} type='submit'>
						Save
					</button>
					{errorMessage.length > 0 && (
						<div className={styles.error}>{errorMessage}</div>
					)}
				</form>
				{mode === MODE_EDITION && (
					<button
						className={styles.buttonDelete}
						onClick={() => handleDelete()}>
						Delete
					</button>
				)}
			</div>
		</div>
	);
};

export default Modal;
