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

		reader.onload = async (event) => {
			if (event && event.target) {
				const data = new Uint8Array(event.target.result as ArrayBuffer);
				const workbook = XLSX.read(data, { type: "array" });
				const sheetName = workbook.SheetNames[0];
				const sheet = workbook.Sheets[sheetName];
				const sheetData: Student[] = XLSX.utils.sheet_to_json(sheet);

				console.log("sheetData", sheetData);

				for (const item of sheetData) {
					console.log("item", item);

					// if id is present, update
					if (validateStudent(item)) {
						if (item.id && item.id > 0) {
							// check item properties, at least l_name, ta_available, and expected_grad_year have to be present

							console.log("item update", item);

							// read record
							// if not found, error
							const fetchStudent = async (id: number) => {
								try {
									const response = await axios.get(
										`http://localhost:5000/students/${id}`
									);

									console.log("fetchStudent", response);

									return response.data;
								} catch (error) {
									// Handle other errors
									console.error("Error:", error.message);

									return false;
								}
							};

							const fetchStudentResponse = await fetchStudent(item.id);
							console.log("fetchStudentResponse", fetchStudentResponse);
							if (fetchStudentResponse) {
								updateStudent(item.id, item);
							} else {
								errors.push(`Error: Student with id ${item.id} not found`);
							}
						} else {
							console.log("item create", item);
							// if id not present, create
							createStudent(item);
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
				Le Footer
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
