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
					<div className={styles.text}>Import</div>
				</div>
				<div className={styles.element} onClick={() => handleExport()}>
					<div className={styles.text}>Export</div>
				</div>
			</div>
			<footer className={styles.footer}>Le Footer</footer>
		</div>
	);
}
