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

	const [semester, setSemester] = useState<string>("Spring");
	const [year, setYear] = useState<number>(0);

	useEffect(() => {
		const fetchCourses = async () => {
			// get current year
			const currentYear = new Date().getFullYear();
			setYear(currentYear);

			// get current semester + 1
			// if between february and august, it is spring
			let semester = "";
			if (new Date().getMonth() >= 1 && new Date().getMonth() <= 7) {
				// current semester is spring, assign students for fall
				semester = "Fall";
				setSemester("Fall");
			} else if (new Date().getMonth() >= 8 && new Date().getMonth() <= 10) {
				// current semester is fall, assign students for winter
				semester = "Winter";
				setSemester("Winter");
			} else {
				// current semester is winter, assign students for spring of next year
				semester = "Spring";
				setSemester("Spring");
				setYear(currentYear + 1);
			}

			// get students and courses assignment for current semester and year
			fetchCourseForSemester(currentYear, semester);
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

	const fetchCourseForSemester = async (year: number, semester: String) => {
		let response = await axios.get("http://localhost:5000/courses");

		let courseList = response.data;

		// filter elements of studentCourseList : only take those with year and semester
		courseList = courseList.filter((course: any) => {
			return course.year === year && course.semester === semester;
		});

		setCourseListState(courseList);
	};

	// Module that create a student react object
	const handleChangeSemester = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		console.log(year);

		setSemester(event.target.value);

		fetchCourseForSemester(year, event.target.value);
	};

	const handleChangeYear = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log(semester);
		setYear(parseInt(event.target.value));

		fetchCourseForSemester(parseInt(event.target.value), semester);
	};

	return (
		<div className={styles.page}>
			Course list{" "}
			<>
				{" "}
				<b>Year :</b>{" "}
				<input type='number' onChange={handleChangeYear} value={year} />
				<b>Semester :</b>
				<select
					name='semester'
					onChange={handleChangeSemester}
					value={semester ? semester : "Spring"}>
					<option value={"Spring"}>Spring</option>
					<option value={"Fall"}>Fall</option>
					<option value={"Winter"}>Winter</option>
				</select>
			</>
			<div className={styles.main}>
				{courseListState &&
					courseListState.map((course) => (
						<div
							key={course.id}
							className={styles.element}
							onClick={() => handleClickCourse(course)}>
							<h2>{course.hkust_identifier + " - " + course.name}</h2>

							<p>{"T.A. needed : " + course.ta_needed}</p>
							<p>
								{course.ta_assigned
									? "T.A. assigned : " + course.ta_assigned
									: "No T.A. assigned"}
							</p>
						</div>
					))}
			</div>
			<div className={styles.add} onClick={() => handleClickCourseNew()}>
				Add course
			</div>
			<footer className={styles.footer}></footer>
			<Modal
				isOpen={isModalOpen}
				course={selectedCourse}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveCourse}
			/>
		</div>
	);
}
