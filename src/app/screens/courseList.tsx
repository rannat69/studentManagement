"use client";

import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";
import Modal from "./courseListModal"; // Adjust the import path as necessary
import { Course } from "../data/courseListData";

import axios from "axios";

export default function CourseList() {
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [courseListState, setCourseListState] = useState<Course[]>();

	useEffect(() => {
		const fetchCourses = async () => {
			const response = await axios.get("http://localhost:5000/courses");

			setCourseListState(response.data);
		};

		fetchCourses();
	}, []);

	const handleClickCourse = (course: Course): void => {
		setSelectedCourse(course);
		setIsModalOpen(true);
	};

	const handleClickCourseNew = (): void => {
		setSelectedCourse(null);
		setIsModalOpen(true);
	};

	const handleSaveCourse = (updatedCourse: Course) => {
		// Update the course list with the new data
		if (!courseListState) {
			return;
		}

		let updatedList;

		// Check if the course is marked for deletion
		if (updatedCourse.deleted) {
			// Remove the course from the list
			updatedList = courseListState.filter(
				(course) => course.id !== updatedCourse.id
			);
		} else {
			// Check if the course exists in the list
			const courseExists = courseListState.some(
				(course) => course.id === updatedCourse.id
			);

			updatedList = courseExists
				? courseListState.map((course) =>
						course.id === updatedCourse.id ? updatedCourse : course
				  )
				: [...courseListState, updatedCourse];
		}

		// Update the state with the new course list
		setCourseListState(updatedList);
	};

	return (
		<div className={styles.page}>
			Course list
			<div className={styles.main}>
				{courseListState &&
					courseListState.map((course) => (
						<div
							key={course.id}
							className={styles.element}
							onClick={() => handleClickCourse(course)}>
							<h2>{course.hkust_identifier + " - " + course.name}</h2>

							<p>{"T.A. needed : " + course.ta_needed}</p>
						</div>
					))}
			</div>
			<div className={styles.add} onClick={() => handleClickCourseNew()}>
				Add course
			</div>
			<footer className={styles.footer}>Le Footer</footer>
			<Modal
				isOpen={isModalOpen}
				course={selectedCourse}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveCourse}
			/>
		</div>
	);
}
