// This component is used to import and export dtatabase elements to/from excel files
"use client";

import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";
import Modal from "./studentListModal"; // Adjust the import path as necessary
import { Student } from "../data/studentListData";
import * as XLSX from "xlsx";

import axios from "axios";
import { Course } from "../data/courseListData";
import { Teacher } from "../data/teacherListData";

export default function ImportExport() {
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string>("");

	const handleImport = (e: any) => {
		setSuccessMessage("");
		setErrorMessage("");
		// Open file from local drive.

		const file = e.target.files[0];
		const reader = new FileReader();

		const errors: string[] = [];

		const validateStudent = (item: any): boolean => {
			const validKeys = [
				"id",
				"student_number",
				"l_name",
				"f_names",
				"unoff_name",
				"program",
				"date_joined",
				"expected_grad_year",
				"expected_grad_semester",
				"ta_available",
				"deleted",
				"dropZone",
				"multiCourses",
			];

			// Check for missing required fields
			if (
				!item.l_name ||
				item.ta_available === undefined ||
				!item.expected_grad_year
			) {
				errors.push("Error: Missing required fields for a student");
				return false;
			}

			// Check for invalid properties
			const studentKeys = Object.keys(item);
			for (const key of studentKeys) {
				if (!validKeys.includes(key)) {
					errors.push(
						`Error: Invalid property "${key}" found in student object.`
					);
					return false;
				}
			}
			return true;
		};

		const validateCourse = (item: any): boolean => {
			const validKeys = [
				"id",
				"hkust_identifier",
				"name",
				"description",
				"semester",
				"year",
				"field",
				"keywords",
				"ta_needed",
				"ta_assigned",
				"deleted",
			];

			// Check for missing required fields
			if (!item.hkust_identifier || !item.name) {
				errors.push("Error: Missing required fields for a course");
				return false;
			}

			// Check for invalid properties
			const courseKeys = Object.keys(item);
			for (const key of courseKeys) {
				if (!validKeys.includes(key)) {
					errors.push(
						`Error: Invalid property "${key}" found in course object.`
					);
					return false;
				}
			}
			return true;
		};

		const validateTeacher = (item: any): boolean => {
			const validKeys = ["id", "l_name", "f_names", "unoff_name", "field"];

			// Check for missing required fields
			if (!item.l_name || !item.field) {
				errors.push("Error: Missing required fields for a teacher");
				return false;
			}

			// Check for invalid properties
			const courseKeys = Object.keys(item);
			for (const key of courseKeys) {
				if (!validKeys.includes(key)) {
					errors.push(
						`Error: Invalid property "${key}" found in teacher object.`
					);
					return false;
				}
			}
			return true;
		};

		reader.onload = async (event) => {
			if (event && event.target) {
				const data = new Uint8Array(event.target.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: "array" });

				// Student import
				let sheetName = workbook.SheetNames[0];
				let sheet = workbook.Sheets[sheetName];
				let sheetDataStudent: Student[] = XLSX.utils.sheet_to_json(sheet);

				for (const item of sheetDataStudent) {
					// if id is present, update
					if (validateStudent(item)) {
						if (item.id && item.id > 0) {
							// check item properties, at least l_name, ta_available, and expected_grad_year have to be present

							// read record
							// if not found, error
							const fetchStudent = async (id: number) => {
								try {
									const response = await axios.get(
										`http://localhost:5000/students/${id}`
									);

									return response.data;
								} catch (error) {
									// Handle other errors
									console.error("Error:", error.message);

									return false;
								}
							};

							const fetchStudentResponse = await fetchStudent(item.id);
							if (fetchStudentResponse) {
								updateStudent(item.id, item);
							} else {
								errors.push(`Error: Student with id ${item.id} not found`);
							}
						} else {
							// if id not present, create
							createStudent(item);
						}
					}
				}

				// Course import
				sheetName = workbook.SheetNames[1];
				sheet = workbook.Sheets[sheetName];
				let sheetDataCourse: Course[] = XLSX.utils.sheet_to_json(sheet);

				for (const item of sheetDataCourse) {
					console.log(item);

					// if id is present, update
					if (validateCourse(item)) {
						if (item.id && item.id > 0) {
							// check item properties, at least l_name, ta_available, and expected_grad_year have to be present

							// read record
							// if not found, error
							const fetchCourse = async (id: number) => {
								try {
									const response = await axios.get(
										`http://localhost:5000/courses/${id}`
									);

									return response.data;
								} catch (error) {
									// Handle other errors
									console.error("Error:", error.message);

									return false;
								}
							};

							const fetchCourseResponse = await fetchCourse(item.id);
							if (fetchCourseResponse) {
								updateCourse(item.id, item);
							} else {
								errors.push(`Error: Course with id ${item.id} not found`);
							}
						} else {
							// if id not present, create
							createCourse(item);
						}
					}
				}

				// Teacher import
				sheetName = workbook.SheetNames[2];
				sheet = workbook.Sheets[sheetName];
				let sheetDataTeacher: Teacher[] = XLSX.utils.sheet_to_json(sheet);

				for (const item of sheetDataTeacher) {
					console.log(item);

					// if id is present, update
					if (validateTeacher(item)) {
						if (item.id && item.id > 0) {
							// check item properties, at least l_name, ta_available, and expected_grad_year have to be present

							// read record
							// if not found, error
							const fetchTeacher = async (id: number) => {
								try {
									const response = await axios.get(
										`http://localhost:5000/teachers/${id}`
									);

									return response.data;
								} catch (error) {
									// Handle other errors
									console.error("Error:", error.message);

									return false;
								}
							};

							const fetchCourseResponse = await fetchTeacher(item.id);
							if (fetchCourseResponse) {
								updateTeacher(item.id, item);
							} else {
								errors.push(`Error: Course with id ${item.id} not found`);
							}
						} else {
							// if id not present, create
							createTeacher(item);
						}
					}
				}

				if (errors.length > 0) {
					setErrorMessage(errors.join("\n")); // Display all errors
				} else {
					setSuccessMessage("Imported successfully");
				}
			}
		};
		reader.readAsArrayBuffer(file);
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

			if (data.error) {
				setErrorMessage(data.error);
			}

			return data; // Return the newly created student ID or object
		} catch (error) {
			console.error("Error adding student:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const createCourse = async (courseData: Course) => {
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

			if (data.error) {
				setErrorMessage(data.error);
			}

			return data; // Return the newly created course ID or object
		} catch (error) {
			console.error("Error adding course:", error);
			throw error; // Rethrow the error for handling in the caller
		}
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

			if (data.error) {
				setErrorMessage(data.error);
			}

			return data; // Return the newly created course ID or object
		} catch (error) {
			console.error("Error adding course:", error);
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

	const updateTeacher = async (id: number, updatedData: Teacher) => {
		try {
			const response = await axios.put(
				`http://localhost:5000/teachers/${id}`,
				updatedData
			);
		} catch (error) {
			console.error("Error updating teacher:", error);
		}
	};

	async function handleExport(): Promise<void> {
		// Read DB, then export in Excel file

		const fetchStudents = async () => {
			const response = await axios.get("http://localhost:5000/students");

			return response.data;
		};

		const fetchCourses = async () => {
			const response = await axios.get("http://localhost:5000/courses");

			return response.data;
		};

		const fetchTeachers = async () => {
			const response = await axios.get("http://localhost:5000/teachers");

			return response.data;
		};

		const fetchStudentCourses = async () => {
			const response = await axios.get("http://localhost:5000/studentcourse");

			return response.data;
		};

		const courses: Course[] = await fetchCourses();

		const students: Student[] = await fetchStudents();

		const teachers: Teacher[] = await fetchTeachers();

		const studentCourses = await fetchStudentCourses();

		// put students in an Excel file in a tab, and courses in another tab
		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.json_to_sheet(students);
		XLSX.utils.book_append_sheet(wb, ws, "Students");

		const ws2 = XLSX.utils.json_to_sheet(courses);
		XLSX.utils.book_append_sheet(wb, ws2, "Courses");

		const ws3 = XLSX.utils.json_to_sheet(teachers);
		XLSX.utils.book_append_sheet(wb, ws3, "Teachers");

		const ws4 = XLSX.utils.json_to_sheet(studentCourses);
		XLSX.utils.book_append_sheet(wb, ws4, "Students and courses");

		XLSX.writeFile(wb, "students.xlsx");

		/*const exportToExcel = (data: Student[]) => {
			const ws = XLSX.utils.json_to_sheet(data);
			const wb = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(wb, ws, "Students");
			XLSX.writeFile(wb, "students.xlsx");
		};
		exportToExcel(students);*/
	}

	return (
		<div className={styles.page}>
			<div className={styles.main}>
				<div className={styles.element}>
					<div className={styles.text}>
						Import
						<input type='file' onChange={handleImport} />
					</div>
				</div>
				<div className={styles.element} onClick={() => handleExport()}>
					<div className={styles.text}>Export</div>
				</div>
			</div>
			<footer className={styles.footer}>
				{errorMessage && errorMessage.length > 0 && (
					<div className={styles.error}>{errorMessage} </div>
				)}
				{successMessage && successMessage.length > 0 && (
					<div className={styles.success}>{successMessage} </div>
				)}
			</footer>
		</div>
	);
}
