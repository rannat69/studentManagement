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

	useEffect(() => {
		const fetchTeachers = async () => {
			const response = await axios.get("http://localhost:5000/teachers");

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

	return (
		<div className={styles.page}>
			Teacher list
			<div className={styles.main}>
				{teacherListState &&
					teacherListState.map((teacher) => (
						<div
							key={teacher.id}
							className={styles.element}
							onClick={() => handleClickTeacher(teacher)}>
							<h2>
								{teacher.l_name} {teacher.f_names}
							</h2>
							<h4>{teacher.unoff_name}</h4>

							<p>{"Field : " + teacher.field}</p>
						</div>
					))}
			</div>
			<div className={styles.add} onClick={() => handleClickTeacherNew()}>
				Add teacher
			</div>
			<footer className={styles.footer}>Le Footer</footer>
			<Modal
				isOpen={isModalOpen}
				teacher={selectedTeacher}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveTeacher}
			/>
		</div>
	);
}
