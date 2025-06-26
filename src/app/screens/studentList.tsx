"use client";

import React, { useEffect, useState } from "react";

import Modal from "./studentListModal"; // Adjust the import path as necessary
import { Student } from "../data/studentListData";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles/page.module.css";
import axios from "axios";

export default function StudentList() {
	const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [studentListState, setStudentListState] = useState<Student[]>();
	const [orderByField, setOrderByField] = useState<string | null>(null);
	const [orderByDirection, setOrderByDirection] = useState<"asc" | "desc">(
		"asc"
	);

	useEffect(() => {
		const fetchStudents = async () => {
			const response = await axios.get("http://localhost:5000/students");

			for (let i = 0; i < response.data.length; i++) {
				response.data[i].available = response.data[i].available === 1;

				response.data[i].unoff_name = response.data[i].unoff_name != null &&  response.data[i].unoff_name != undefined ? response.data[i].unoff_name : "";
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


	const handleOrderBy = (column: string) => {
		if (!studentListState) {
			return;
		}

		console.log("column", column);

		let orderByDirectionTemp = "asc";

		// Check if the current column is the same as the previous one
		if (column === orderByField) {
			// Toggle order direction
			setOrderByDirection(orderByDirection === "asc" ? "desc" : "asc");

			orderByDirectionTemp = orderByDirection === "asc" ? "desc" : "asc";

		} else {
			// Reset to ascending order for a new column
			setOrderByDirection("asc");
		}

		// Sort the student list
		const sortedList = [...studentListState].sort((a, b) => {
			const aValue = a[column as keyof Student];
			const bValue = b[column as keyof Student];

			if (typeof aValue === "string" && typeof bValue === "string") {
				return aValue > bValue ? 1 : -1;
			} else if (typeof aValue === "number" && typeof bValue === "number") {
				return aValue - bValue;
			} else {
				return 0;
			}
		});

		console.log(orderByDirectionTemp);

		// Reverse the list if the order direction is 'desc'
		if (orderByDirectionTemp === "desc") {
			sortedList.reverse();
		}

		// Update the state
		setOrderByField(column);
		setStudentListState(sortedList);
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
							<th onClick={() => handleOrderBy("l_name")}>Surname</th>
							<th onClick={() => handleOrderBy("f_names")}>First name</th>
							<th onClick={() => handleOrderBy("unoff_name")}>Unofficial name</th>
							<th onClick={() => handleOrderBy("expected_grad_year")}>Expected graduation year</th>
							<th onClick={() => handleOrderBy("expected_grad_semester")}>Graduation semester</th>
							<th onClick={() => handleOrderBy("ta_available")}>T.A. available</th>
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
