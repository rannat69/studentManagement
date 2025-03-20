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
	student: any;
	onClose: () => void;
	onSave: (updatedStudent: any) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, student, onClose, onSave }) => {
	const [formData, setFormData] = useState<Student>(student);
	const [mode, setMode] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");

	const [qualifications, setQualifications] = useState<string[]>();
	const [selectedQualif, setSelectedQualif] = useState<string>("");

	const [areas, setAreas] = useState<string[]>();
	const [selectedArea, setSelectedArea] = useState<string>("");

	useEffect(() => {
		if (student) {
			setMode(MODE_EDITION);
			setFormData(student);

			const fetchQualifs = async () => {
				try {
					const response = await axios.get(
						`http://localhost:5000/student_qualifications/${student.id}`
					);

					for (let i = 0; i < response.data.length; i++) {
						response.data[i] = response.data[i].qualification;
					}

					setQualifications(response.data);
					return response.data;
				} catch (error) {
					// Handle other errors
					console.error("Error:", error.message);

					return false;
				}
			};
			fetchQualifs();

			const fetchAreas = async () => {
				try {
					const response = await axios.get(
						`http://localhost:5000/student_areas/${student.id}`
					);

					for (let i = 0; i < response.data.length; i++) {
						response.data[i] = response.data[i].area;
					}

					setAreas(response.data);
					return response.data;
				} catch (error) {
					// Handle other errors
					console.error("Error:", error.message);

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
			});
			setQualifications([]);
			setAreas([]);
			setMode(MODE_CREATION);
		}
	}, [student]); // Add student to the dependency array

	const handleChange = (e: any) => {
		const { name, value, checked } = e.target;

		if (name === "date_joined") {
			//convert value to date format
			const date = new Date(value);

			formData.expected_grad_year = date.getFullYear() + 4;
		}

		if (name === "available") {
			if (checked) {
				formData.available = true;
			} else {
				formData.available = false;
			}
		}

		setFormData({
			...formData,
			[name]: name === "available" ? checked : value,
		});
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
			setErrorMessage("Please select a qualification");
			return;
		}
		if (areas && areas.includes(selectedArea)) {
			setErrorMessage("Qualification already added");
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
		console.log("Updating student with ID:", id);

		try {
			let response = await axios.put(
				`http://localhost:5000/students/${id}`,
				updatedData
			);

			// Delete all qualifs for student first
			let responseCourse = await fetch(
				`http://localhost:5000/student_qualifications/${id}`,
				{
					method: "DELETE",
				}
			);

			// Delete all areas for student first
			responseCourse = await fetch(
				`http://localhost:5000/student_areas/${id}`,
				{
					method: "DELETE",
				}
			);

			// Add qualifs
			if (qualifications && qualifications.length > 0) {
				qualifications.forEach(async (qualif) => {
					const qualifStudent = {
						studentId: id,
						qualification: qualif,
					};
					responseCourse = await fetch(
						"http://localhost:5000/student_qualifications",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(qualifStudent),
						}
					);
				});
			}

			// Add areas
			if (areas && areas.length > 0) {
				areas.forEach(async (area) => {
					const areaStudent = {
						studentId: id,
						area: area,
					};
					responseCourse = await fetch("http://localhost:5000/student_areas", {
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
		setMode(MODE_DELETE);

		setErrorMessage("");
		onClose();
		deleteStudent(student.id);

		student.deleted = true;

		student = null;

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
			program: "",
			date_joined: new Date(),
			expected_grad_year: 0,
			expected_grad_semester: "Spring",
			ta_available: 0,
			available: false,
			deleted: false,
			dropZone: 0,
			multiCourses: false,
		});

		student = null;

		setQualifications([]);
		setAreas([]);
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
						type='number'
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
					Student available
					<input
						name='available'
						type='checkbox'
						checked={formData ? formData.available : true}
						onChange={handleChange}></input>
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
