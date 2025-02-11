"use client";

import React, { useEffect, useState } from "react";

import styles from "./page.module.css";
import Modal from "./studentListModal"; // Adjust the import path as necessary
import { Student } from "./studentListData";

import axios from "axios";

export default function StudentList() {
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [studentListState, setStudentListState] = useState<Student[]>();

	useEffect(() => {
		const fetchStudents = async () => {
			const response = await axios.get("http://localhost:5000/students");

			setStudentListState(response.data);
		};

		fetchStudents();
	}, []);

	const handleClickStudent = (student: Student): void => {
		setSelectedStudent(student);
		setIsModalOpen(true);
	};

	const handleClickStudentNew = (): void => {
		setSelectedStudent(null);
		setIsModalOpen(true);
	};

	const handleSaveStudent = (updatedStudent: Student) => {
		// Update the student list with the new data
		if (!studentListState) {
			return;
		}

		let updatedList;

		console.log("Updated Student:", updatedStudent);

		// Check if the student is marked for deletion
		if (updatedStudent.deleted) {
			// Remove the student from the list
			updatedList = studentListState.filter(
				(student) => student.id !== updatedStudent.id
			);
		} else {
			// Check if the student exists in the list
			const studentExists = studentListState.some(
				(student) => student.id === updatedStudent.id
			);

			updatedList = studentExists
				? studentListState.map((student) =>
						student.id === updatedStudent.id ? updatedStudent : student
				  )
				: [...studentListState, updatedStudent];
		}

		// Log the updated list for debugging
		console.log("Updated Student List:", updatedList);

		// Update the state with the new student list
		setStudentListState(updatedList);
	};

	return (
		<div className={styles.page}>
			Student list
			<div className={styles.main}>
				{studentListState &&
					studentListState.map((student) => (
						<div
							key={student.id}
							className={styles.element}
							onClick={() => handleClickStudent(student)}>
							<h2>{student.name}</h2>
							<p>
								{new Date(student.expected_grad_date).getDate() +
									"/" +
									(new Date(student.expected_grad_date).getMonth() + 1) +
									"/" +
									new Date(student.expected_grad_date).getFullYear()}
							</p>
							<p>{"T.A. available : " + student.ta_available}</p>
						</div>
					))}
			</div>
			<div className={styles.add} onClick={() => handleClickStudentNew()}>
				Add student
			</div>
			<footer className={styles.footer}>Le Footer</footer>
			<Modal
				isOpen={isModalOpen}
				student={selectedStudent}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveStudent}
			/>
		</div>
	);
}
