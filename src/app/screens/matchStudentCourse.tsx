import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";

import { Course } from "../data/courseListData";

import axios from "axios";
import { Student } from "../data/studentListData";

export default function MatchStudentCourse() {
	// List students that have TA available
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [studentListAvail, setStudentListAvail] = useState<Student[]>([]);
	const [studentListAssigned, setStudentListAssigned] = useState<Student[]>([]);

	const [courseListNeeded, setCourseListNeeded] = useState<Course[]>([]);

	useEffect(() => {
		// list of students with at least 1 T.A.
		const fetchStudents = async () => {
			let response = await axios.get("http://localhost:5000/students");

			let studentListTemp = response.data;
			const studentListAssignedTemp: Student[] = [];
			// Check students already assigned to courses

			response = await axios.get("http://localhost:5000/studentcourse");

			const studentCourseList = response.data;
			studentListTemp.forEach((student: Student) => {
				studentCourseList.forEach((studentCourse: any) => {
					if (student.id === studentCourse.student_id) {
						// remove record from studentListTemp

						student.dropZone = studentCourse.course_id;

						studentListAssignedTemp.push(student);
					}
				});
			});

			studentListTemp = studentListTemp.filter(
				(student: Student) => student.ta_available !== 0
			);

			console.log("studentListAssignedTemp", studentListAssignedTemp);

			setStudentListAvail(studentListTemp);
			setStudentListAssigned(studentListAssignedTemp);
		};

		fetchStudents();

		// list of courses with at least one TA needed

		const fetchCourses = async () => {
			const response = await axios.get("http://localhost:5000/courses");

			setCourseListNeeded(response.data);
		};

		fetchCourses();
	}, []);

	const handleDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		student: Student
	) => {
		event.dataTransfer.setData("student", JSON.stringify(student));
		console.log("Dragging:", student);
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault(); // Prevent default to allow drop
	};

	const updateStudent = async (updatedStudent: Student) => {
		// update student
		try {
			const response = await axios.put(
				`http://localhost:5000/students/${updatedStudent.id}`,
				updatedStudent
			);
		} catch (error) {
			console.error("Error updating student:", error);
		}
	};

	const updateCourse = async (updatedCourse: Course) => {
		// update course
		try {
			const response = await axios.put(
				`http://localhost:5000/courses/${updatedCourse.id}`,
				updatedCourse
			);
		} catch (error) {
			console.error("Error updating course:", error);
		}
	};

	// add student to course
	const addStudentCourse = async (
		updatedStudent: Student,
		updatedCourse: Course
	) => {
		try {
			const response = await fetch("http://localhost:5000/studentcourse/", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},

				body: JSON.stringify({
					student_id: updatedStudent.id,
					course_id: updatedCourse.id,
				}),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			return data; // Return the newly created student ID or object
		} catch (error) {
			console.error("Error adding student:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	// remove student from course
	const deleteStudentCourse = async (
		updatedStudent: Student,
		updatedCourse: Course
	) => {
		try {
			const response = await fetch(
				"http://localhost:5000/studentcourse/delete",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},

					body: JSON.stringify({
						student_id: updatedStudent.id,
						course_id: updatedCourse.id,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();

			return data; // Return the newly created student ID or object
		} catch (error) {
			console.error("Error adding student:", error);
			throw error; // Rethrow the error for handling in the caller
		}
	};

	const dropHandler = (
		event: React.DragEvent<HTMLDivElement>,
		dropZone: number
	) => {
		event.preventDefault();
		const student = event.dataTransfer.getData("student");

		var courseTemp = null;

		// if destination is Students Available, remove record from its drop area and add it back to Students available
		if (dropZone === 0) {
			// find the student in the list and remove it
			let index = studentListAssigned.findIndex(
				(s) => s.id === JSON.parse(student).id
			);

			if (index > -1) {
				studentListAssigned.splice(index, 1);
			}

			var studentTemp = JSON.parse(student);

			studentTemp.dropZone = "";
			// If back to student available, ta available again
			studentTemp.ta_available += 1;

			// check if student already in studentListAvail
			const studentExists = studentListAvail.some(
				(student) => student.id === studentTemp.id
			);
			if (!studentExists) {
				setStudentListAvail([...studentListAvail, studentTemp]);
			}

			// course T.A.  +1 when removing a student from it

			// find record of courseList with id = student.dropzone and make +1 to ta_needed
			const courseIndex = courseListNeeded.findIndex(
				(course) => course.id === JSON.parse(student).dropZone
			);

			if (courseIndex > -1) {
				courseTemp = courseListNeeded[courseIndex];
				courseTemp.ta_needed += 1;

				// Update the course in the list
				const updatedCourseList = [...courseListNeeded];
				updatedCourseList[courseIndex] = courseTemp;

				setCourseListNeeded(updatedCourseList);

				deleteStudentCourse(studentTemp, courseTemp);
			}

			// Update student and course record
			updateCourse(courseTemp);

			// Remove student from course
			deleteStudentCourse(studentTemp, courseTemp);
		} else {
			// If destination is a drop zone, then either move from other drop zone or from student available

			// check if course has at least T.A. needed. If not, cancel.

			let courseIndex = courseListNeeded.findIndex(
				(course) => course.id === dropZone
			);
			if (courseIndex > -1) {
				courseTemp = courseListNeeded[courseIndex];

				if (courseTemp.ta_needed < 1) {
					return;
				}
			}

			var studentTemp = JSON.parse(student);

			console.log(studentTemp);

			var courseTemp = null;

			if (
				!studentTemp.dropZone ||
				studentTemp.dropZone === "" ||
				studentTemp.dropZone === 0
			) {
				// If from student available, ta available -  1

				studentTemp.ta_available -= 1;

				// find the student in the available list and remove it
				const index = studentListAvail.findIndex(
					(s) => s.id === studentTemp.id
				);

				if (index > -1) {
					studentListAvail.splice(index, 1);
				}
			} else {
				console.log("origin is " + studentTemp.dropZone);
				// find the student in the list and remove it
				const index = studentListAssigned.findIndex(
					(s) => s.id === studentTemp.id
				);

				if (index > -1) {
					studentListAssigned.splice(index, 1);
				}

				// course T.A.  +1 when removing a student from it

				// find record of courseList with id = student.dropzone and make +1 to ta_needed
				courseIndex = courseListNeeded.findIndex(
					(course) => course.id === JSON.parse(student).dropZone
				);
				if (courseIndex > -1) {
					courseTemp = courseListNeeded[courseIndex];
					courseTemp.ta_needed += 1;

					// Update the course in the list
					const updatedCourseList = [...courseListNeeded];
					updatedCourseList[courseIndex] = courseTemp;

					setCourseListNeeded(updatedCourseList);

					// Update course record
					updateCourse(courseTemp);

					// Remove student from course
					deleteStudentCourse(studentTemp, courseTemp);
				}
			}
			// Implement your logic here to handle the drop

			studentTemp.dropZone = dropZone;

			// check if student already in studentListAssigned
			const studentExists = studentListAssigned.some(
				(student) => student.id === studentTemp.id
			);
			if (!studentExists) {
				setStudentListAssigned([...studentListAssigned, studentTemp]);
			}

			// Update student and course record
			updateStudent(studentTemp);

			courseIndex = courseListNeeded.findIndex(
				(course) => course.id === dropZone
			);

			if (courseIndex > -1) {
				courseTemp = courseListNeeded[courseIndex];
				courseTemp.ta_needed -= 1;

				// Update the course in the list
				const updatedCourseList = [...courseListNeeded];
				updatedCourseList[courseIndex] = courseTemp;

				setCourseListNeeded(updatedCourseList);

				// Update course record
				updateCourse(courseTemp);

				addStudentCourse(studentTemp, courseTemp);
			}
		}
	};

	return (
		<div className={styles.page}>
			<div className={styles.columns}>
				{/* Column for available students */}
				<div
					className={styles.availableColumn}
					onDrop={(event) => dropHandler(event, 0)}
					onDragOver={handleDragOver}>
					<h2>Students Available</h2>
					<div className={styles.dropArea}>
						{studentListAvail.map((student) => (
							<div
								draggable='true'
								key={student.id.toString()}
								className={styles.element}
								onDragStart={(event) => handleDragStart(event, student)}>
								<h2>
									{student.l_name} {student.f_names}
								</h2>
								<h2>{student.unoff_name}</h2>
								<p>
									{new Date(student.expected_grad_date).getDate() +
										"/" +
										(new Date(student.expected_grad_date).getMonth() + 1) +
										"/" +
										new Date(student.expected_grad_date).getFullYear()}
								</p>
								<p>{"T.A. available: " + student.ta_available}</p>
							</div>
						))}
					</div>
				</div>

				{/* Columns for drop areas */}

				{courseListNeeded.map((course) => (
					<div key={course.id} className={styles.dropAreas}>
						<h2>{course.id}</h2>
						<h2>{course.name}</h2>
						<h3>T.A. needed : {course.ta_needed}</h3>
						<div className={styles.dropArea}>
							<h3></h3>
							<div
								onDrop={(event) => dropHandler(event, course.id)}
								onDragOver={handleDragOver}
								className={styles.innerDropArea}>
								{studentListAssigned
									.filter((student) => student.dropZone === course.id)
									.map((student) => (
										<div
											draggable='true'
											key={student.id.toString()}
											className={styles.element}
											onDragStart={(event) => handleDragStart(event, student)}>
											<h2>
												{student.l_name} {student.f_names}
											</h2>
											<h2>{student.unoff_name}</h2>
											<p>
												{new Date(student.expected_grad_date).getDate() +
													"/" +
													(new Date(student.expected_grad_date).getMonth() +
														1) +
													"/" +
													new Date(student.expected_grad_date).getFullYear()}
											</p>
											<p>{"T.A. available: " + student.ta_available}</p>
										</div>
									))}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
