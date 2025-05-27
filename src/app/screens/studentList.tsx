"use client";

import React, { useEffect, useState } from "react";

import Modal from "./studentListModal"; // Adjust the import path as necessary
import { Student } from "../data/studentListData";
import "bootstrap/dist/css/bootstrap.min.css";
import Table from "react-bootstrap/Table";
import styles from "./styles/page.module.css";
import axios from "axios";

export default function StudentList() {
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [studentListState, setStudentListState] = useState<Student[]>();

	useEffect(() => {
		const fetchStudents = async () => {
			const response = await axios.get("http://localhost:5000/students");

			for (let i = 0; i < response.data.length; i++) {
				response.data[i].available = response.data[i].available === 1;
			}

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

		console.log("updatedStudent", updatedStudent);

		let updatedList;

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

		// Update the state with the new student list
		setStudentListState(updatedList);
	};

	return (
		<div className={styles.page}>
			Student list
					<div className={styles.add} onClick={() => handleClickStudentNew()}>
					Add student
				</div>
			<div className={styles.main}>
		

				<table className={styles.tableStudent}>
					<thead>
						<tr>
							<th>Surname</th>
							<th>First name</th>
							<th>Unofficial name</th>
							<th>Expected graduation year</th>
							<th>Graduation semester</th>
							<th>T.A. available</th>
						</tr>
					</thead>
					<tbody>
						{studentListState &&
							studentListState.map((student) => (
								<tr
									key={student.id}
									onClick={() => handleClickStudent(student)}>
									<td>{student.l_name}</td>
									<td>{student.f_names}</td>
									<td>{student.unoff_name}</td>
									<td>{student.expected_grad_year}</td>
									<td>{student.expected_grad_semester}</td>
									<td>{student.ta_available}</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
			<footer className={styles.footer}></footer>
			<Modal
				isOpen={isModalOpen}
				student={selectedStudent}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveStudent}
			/>
		</div>
	);
}
