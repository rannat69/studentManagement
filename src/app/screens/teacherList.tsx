"use client";

import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";
import Modal from "./teacherListModal"; // Adjust the import path as necessary
import { Teacher } from "../data/teacherListData";

import axios from "axios";

export default function TeacherList() {
	const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [teacherListState, setTeacherListState] = useState<Teacher[]>();

	const [orderByField, setOrderByField] = useState<string | null>(null);
	const [orderByDirection, setOrderByDirection] = useState<"asc" | "desc">(
		"asc"
	);

	useEffect(() => {
		const fetchTeachers = async () => {
			const response = await axios.get("/api/teacher/all/");

			setTeacherListState(response.data);
		};

		fetchTeachers();
	}, []);

	const handleClickTeacher = (teacher: Teacher): void => {
		setSelectedTeacher(teacher);
		setIsModalOpen(true);
	};

	const handleClickTeacherNew = (): void => {
		setSelectedTeacher(null);
		setIsModalOpen(true);
	};

	const handleSaveTeacher = (updatedTeacher: Teacher) => {
		// Update the teacher list with the new data
		if (!teacherListState) {
			return;
		}

		let updatedList;

		// Check if the teacher is marked for deletion
		if (updatedTeacher.deleted) {
			// Remove the teacher from the list
			updatedList = teacherListState.filter(
				(teacher) => teacher.id !== updatedTeacher.id
			);
		} else {
			// Check if the teacher exists in the list
			const teacherExists = teacherListState.some(
				(teacher) => teacher.id === updatedTeacher.id
			);

			updatedList = teacherExists
				? teacherListState.map((teacher) =>
					teacher.id === updatedTeacher.id ? updatedTeacher : teacher
				)
				: [...teacherListState, updatedTeacher];
		}

		// Update the state with the new teacher list
		setTeacherListState(updatedList);
	};

	const handleOrderBy = (column: string) => {
		if (!teacherListState) {
			return;
		}

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
		const sortedList = [...teacherListState].sort((a, b) => {
			const aValue = a[column as keyof Teacher];
			const bValue = b[column as keyof Teacher];

			if (typeof aValue === "string" && typeof bValue === "string") {
				return aValue > bValue ? 1 : -1;
			} else if (typeof aValue === "number" && typeof bValue === "number") {
				return aValue - bValue;
			} else {
				return 0;
			}
		});


		// Reverse the list if the order direction is 'desc'
		if (orderByDirectionTemp === "desc") {
			sortedList.reverse();
		}

		// Update the state
		setOrderByField(column);
		setTeacherListState(sortedList);
	};

	return (
		<div className={ styles.page }>
			Teacher list{ " " }
			<div className={ styles.add } onClick={ () => handleClickTeacherNew() }>
				Add teacher
			</div>
			<div className={ styles.main }>
				<table className={ styles.tableStudent }>
					<thead>
						<tr>


							<th onClick={ () => handleOrderBy("l_name") }>Surname</th>
							<th onClick={ () => handleOrderBy("f_names") }>First name</th>
							<th onClick={ () => handleOrderBy("unoff_name") }>Unofficial name</th>
							<th onClick={ () => handleOrderBy("field") }>Field</th>
						</tr>
					</thead>
					<tbody>
						{ teacherListState &&
							teacherListState.map((teacher) => (
								<tr
									key={ teacher.id }
									onClick={ () => handleClickTeacher(teacher) }>
									<td>{ teacher.l_name }</td>
									<td>{ teacher.f_names }</td>
									<td>{ teacher.unoff_name }</td>
									<td>{ teacher.field }</td>
								</tr>
							)) }
					</tbody>
				</table>
			</div>
			<footer className={ styles.footer }></footer>
			<Modal
				isOpen={ isModalOpen }
				teacher={ selectedTeacher }
				onClose={ () => setIsModalOpen(false) }
				onSave={ handleSaveTeacher }
			/>
		</div>
	);
}
