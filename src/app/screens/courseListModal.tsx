// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Course } from "../data/courseListData";
import axios from "axios";
import {
	AREAS,
	MODE_CREATION,
	MODE_DELETE,
	MODE_EDITION,
	PROGRAMS,
} from "../constants";

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

	const [areas, setAreas] = useState<string[]>();
	const [selectedArea, setSelectedArea] = useState<string>("");

	useEffect(() => {
		if (course) {
			setMode(MODE_EDITION);
			setFormData(course);

			const fetchAreas = async () => {
				try {
					const response = await axios.get(
						`http://localhost:5000/coursearea/${course.id}`
					);

					console.log(response.data);

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
				hkust_identifier: "",
				name: "",
				description: "",
				field: "",
				keywords: "",
				semester: 0,
				year: 0,
				ta_needed: 0,
				ta_assigned: 0,
				deleted: false,
			});
			setAreas([]);
			setMode(MODE_CREATION);
		}
	}, [course]); // Add course to the dependency array

	const handleChange = (e: any) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const createCourse = async (courseData: Course) => {
		console.log("courseData", courseData);

		try {
			let response = await fetch("http://localhost:5000/courses", {
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

			// Delete all areas for course first
			response = await fetch(`http://localhost:5000/coursearea/${data.id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			// Add areas
			if (areas && areas.length > 0) {
				areas.forEach(async (area) => {
					const courseArea = {
						course_id: data.id,
						area: area,
					};
					response = await fetch("http://localhost:5000/coursearea", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(courseArea),
					});
				});
			}

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			return data; // Return the newly created course ID or object
		} catch (error) {
			console.error("Error adding course:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const updateCourse = async (id: number, updatedData: Course) => {
		try {
			let response = await axios.put(
				`http://localhost:5000/courses/${id}`,
				updatedData
			);

			// Delete all areas for course first
			let responseCourse = await fetch(
				`http://localhost:5000/coursearea/${id}`,
				{
					method: "DELETE",
				}
			);

			// Add areas
			if (areas && areas.length > 0) {
				areas.forEach(async (area) => {
					const courseArea = {
						course_id: id,
						area: area,
					};
					responseCourse = await fetch("http://localhost:5000/coursearea", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(courseArea),
					});
				});
			}
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

		if (
			!formData.hkust_identifier ||
			formData.hkust_identifier.length === 0 ||
			!formData.name ||
			formData.name.length === 0
		) {
			setErrorMessage("Please enter an identifier and a name");
			return;
		}

		// check if ta_available is number
		if (isNaN(Number(formData.ta_needed))) {
			setErrorMessage("T.A. available must be a number");
			return;
		}

		if (formData.ta_needed < 0) {
			setErrorMessage("T.A. available must be a positive number");
			return;
		}

		if (formData.year <= 0) {
			setErrorMessage("Year must be a positive number");
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
			ta_assigned: 0,
			deleted: false,
		});

		onClose();
	};

	if (!isOpen) return null;

	function addArea(): void {
		// get the currently selected area and add it to the areas array
		//in the formData

		setErrorMessage("");

		// the currently selected area is in the select whose idea is "area"

		console.log(selectedArea);
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
			formData.keywords = areas.join(",");
		} else {
			setAreas([selectedArea]);
			formData.keywords = selectedArea;
		}
	}

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
					<select
						name='semester'
						onChange={handleChange}
						value={formData ? formData.semester : "Spring"}>
						<option value='Spring'>Spring</option>

						<option value='Summer'>Summer</option>

						<option value='Fall'>Fall</option>
						<option value='Winter'>Winter</option>
					</select>
					T.A. needed
					<input
						name='ta_needed'
						value={formData ? formData.ta_needed : ""}
						onChange={handleChange}
						placeholder='Number of T.A. needed'
						type='number'
					/>
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
						<div onClick={() => addArea()}>+ </div>
						{areas && areas.length > 0 && (
							<div>
								{areas.map((area) => (
									<div key={area}>
										{area}
										<div
											onClick={() => {
												setAreas(areas.filter((a) => a !== area));
												formData.keywords = areas
													.filter((a) => a !== area)
													.join(", ");
											}}>
											x
										</div>
									</div>
								))}
							</div>
						)}
					</div>
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
