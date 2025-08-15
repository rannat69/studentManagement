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
	const [courseListStateUnfiltered, setCourseListStateUnfiltered] = useState<Course[]>();

	const [semester, setSemester] = useState<string>("Spring");
	const [year, setYear] = useState<number>(0);
	const [name, setName] = useState<string>("");

	const [orderByField, setOrderByField] = useState<string | null>(null);
	const [orderByDirection, setOrderByDirection] = useState<"asc" | "desc">(
		"asc"
	);

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

			// We use it to fill courseListUnfiltered
			fetchCoursesUnfiltered();
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

	const fetchCoursesUnfiltered = async () => {
		const response = await axios.get("/api/course/all");

		const courseList = response.data;
		setCourseListStateUnfiltered(courseList);
	}

	const fetchCourseForSemester = async (year: number, semester: string) => {
		const response = await axios.get("/api/course/all");

		let courseList = response.data;



		// filter elements of studentCourseList : only take those with year and semester
		courseList = courseList.filter(
			(course: { year: number; semester: string }) => {
				return (isNaN(year) || course.year === year) && (semester === "" || course.semester === semester);
			}
		);

		for (const course of courseList) {
			if (course.ta_available === null) {
				course.ta_available = 0;
			}

			if (course.ta_assigned === null) {
				course.ta_assigned = 0;
			}
		}

		setCourseListState(courseList);
	};

	const handleSearchCourse = (property: string, searchTerm: string) => {
		if (!courseListStateUnfiltered) {
			return;
		}

		let currentSearchName = name;
		let currentSearchYear = year;
		let currentSearchSemester = semester;


		if (property === "name") {
			currentSearchName = searchTerm;
			setName(searchTerm);
		}
		if (property === "year") {
			currentSearchYear = Number(searchTerm);
			setYear(currentSearchYear);
		}
		if (property === "semester") {
			currentSearchSemester = searchTerm;
			setSemester(searchTerm);
		}

		// Si tous les termes de recherche sont vides, réinitialiser la liste
		if (currentSearchName.length === 0 && currentSearchSemester.length === 0 && currentSearchYear === 0) {
			setCourseListState(courseListStateUnfiltered);
			return; // Sortir de la fonction
		}

		// Filtrer la liste des étudiants
		const filteredList = courseListStateUnfiltered.filter((course) => {

			const matchesName = currentSearchName.length === 0 || (
				(course.hkust_identifier && course.hkust_identifier.toLowerCase().includes(currentSearchName.toLowerCase())) ||
				(course.name && course.name.toLowerCase().includes(currentSearchName.toLowerCase()))
			);

			const matchesYear = currentSearchYear === 0 || course.year === currentSearchYear;

			const matchesSemester = currentSearchSemester.length === 0 || course.semester === currentSearchSemester;

			return matchesName && matchesYear && matchesSemester;
		});



		// Mettre à jour l'état avec la liste filtrée
		setCourseListState(filteredList);
	};


	const handleOrderBy = (column: string) => {
		if (!courseListState) {
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
		const sortedList = [...courseListState].sort((a, b) => {
			const aValue = a[column as keyof Course];
			const bValue = b[column as keyof Course];

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
		setCourseListState(sortedList);
	};

	return (
		<div className={ styles.page }>

			<h1>Courses</h1>
			<h4>Total { courseListState?.length } course(s)</h4>
			<br />
			<div className={ styles.center }>
				<div className={ styles.header }>
					<b>Year :</b>{ " " }

					<select
						name='year'
						onChange={ (e) => handleSearchCourse("year", e.target.value) } value={ year ? year : "" } className={ styles.select }>


						<option value="">-</option>
						{ Array.from({ length: 2100 - 1990 }, (_, index) => {
							const year = 1991 + index;
							return <option key={ year } value={ year }>{ year }</option>;
						}) }


					</select>

					<b>Semester :</b>
					<select
						name='semester'
						onChange={ (e) => handleSearchCourse("semester", e.target.value) }
						value={ semester ? semester : "Spring" } className={ styles.select }>
						<option value={ "" }>-</option>
						<option value={ "Spring" }>Spring</option>
						<option value={ "Fall" }>Fall</option>
						<option value={ "Winter" }>Winter</option>
					</select>

					<input type="text" className={ styles.input } placeholder="&#128269;   Search courses ..." onChange={ (e) => handleSearchCourse("name", e.target.value) }></input>


					<div className={ styles.add } onClick={ () => handleClickCourseNew() }>
						Add course
					</div>
				</div>
				<div className={ styles.main }>


					<table className={ styles.tableStudent }>
						<thead>
							<tr>


								<th onClick={ () => handleOrderBy("hkust_identifier") }>ID</th>
								<th onClick={ () => handleOrderBy("name") }>Name</th>

								<th onClick={ () => handleOrderBy("ta_assigned") }>T.A. assigned</th>


							</tr>
						</thead>
						<tbody>
							{ courseListState &&
								courseListState.map((course) => (
									<tr key={ course.id } onClick={ () => handleClickCourse(course) }>
										<td>{ course.hkust_identifier }</td>
										<td>{ course.name }</td>
										<td>
											{ (course.ta_assigned === course.ta_needed) || !course.ta_needed ? (<div className={ styles.semesterSpring }>{ (course.ta_assigned ? course.ta_assigned : 0) + "/" + course.ta_needed }</div>
											) : (<div className={ styles.semesterFall }>{ (course.ta_assigned ? course.ta_assigned : 0) + "/" + course.ta_needed }</div>
											) }
										</td>
									</tr>
								)) }
						</tbody>
					</table>
				</div>

				<footer className={ styles.footer }></footer>

				<Modal
					isOpen={ isModalOpen }
					course={ selectedCourse }
					onClose={ () => setIsModalOpen(false) }
					onSave={ handleSaveCourse }
				/>
			</div>
		</div >
	);
}
