import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";

import { Course } from "../data/courseListData";

import axios from "axios";
import { Student } from "../data/studentListData";
import { Qualification } from "../data/qualificationData";
import StudentBlock from "./studentBlock";

export default function MatchStudentCourse() {
	// List students that have TA available
	const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const [studentListAvail, setStudentListAvail] = useState<Student[]>([]);
	const [studentListAssigned, setStudentListAssigned] = useState<Student[]>([]);

	const [courseListNeeded, setCourseListNeeded] = useState<Course[]>([]);

	const [errorMessage, setErrorMessage] = useState<String>("");
	const [warningMessage, setWarningMessage] = useState<String>("");

	const [hoveredStudent, setHoveredStudent] = useState<number>(0);

	const [studentQualification, setStudentQualification] = useState<
		Qualification[]
	>([]);

	const [semester, setSemester] = useState<String>("String");
	const [year, setYear] = useState<number>(0);

	useEffect(() => {
		// list of students with at least 1 T.A.
		const fetchStudents = async () => {
			// Check students already assigned to courses

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
			fetchStudentCourseForSemester(currentYear, semester);
		};

		fetchStudents();

		// list of courses with at least one TA needed

		const fetchCourses = async () => {
			const response = await axios.get("http://localhost:5000/courses");

			setCourseListNeeded(response.data);
		};

		fetchCourses();
	}, []);

	const fetchStudentCourseForSemester = async (
		year: number,
		semester: String
	) => {
		let response = await axios.get("http://localhost:5000/students");

		let studentListTemp = response.data;
		const studentListAssignedTemp: Student[] = [];

		console.log(year, semester);

		response = await axios.get("http://localhost:5000/studentcourse");
		console.log("response.data", response.data);
		let studentCourseList = response.data;

		// filter elements of studentCourseList : only take those with year and semester
		studentCourseList = studentCourseList.filter((studentCourse: any) => {
			return studentCourse.year === year && studentCourse.semester === semester;
		});

		console.log("studentCourseList", studentCourseList);

		studentListTemp.forEach((student: Student) => {
			studentCourseList.forEach((studentCourse: any) => {
				if (student.id === studentCourse.student_id) {
					// remove record from studentListTemp

					// temporary student to not get same value twice
					var studentTemp = JSON.parse(JSON.stringify(student));

					studentTemp.dropZone = studentCourse.course_id;

					studentListAssignedTemp.push(studentTemp);
				}
			});
		});

		studentListTemp = studentListTemp.filter(
			(student: Student) => student.ta_available !== 0 && student.available
		);

		const idCount: number[] = [];

		// Count occurrences of each id
		for (const item of studentListAssignedTemp) {
			idCount[item.id] = (idCount[item.id] || 0) + 1;
		}

		// Update multiCourses property based on the count
		for (const item of studentListAssignedTemp) {
			item.multiCourses = idCount[item.id] > 1;
		}

		// list of qualifications per student
		response = await axios.get("http://localhost:5000/student_qualifications");

		setStudentQualification(response.data);

		setStudentListAvail(studentListTemp);
		setStudentListAssigned(studentListAssignedTemp);
	};

	const handleDragStart = (
		event: React.DragEvent<HTMLDivElement>,
		student: Student
	) => {
		event.dataTransfer.setData("student", JSON.stringify(student));
		setErrorMessage("");
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		setErrorMessage("");
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
					year: year,
					semester: semester,
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
		setErrorMessage("");
		setWarningMessage("");

		event.preventDefault();
		const student = event.dataTransfer.getData("student");

		var courseTemp: Course = {
			id: 0,
			hkust_identifier: "",
			name: "",
			description: "",
			field: "",
			keywords: "",
			semester: 0,
			year: 0,
			ta_needed: 0,
			ta_assigned: 0,
			deleted: false,
		};

		// if destination is Students Available, remove record from its drop area and add it back to Students available
		if (dropZone === 0) {
			var studentTemp = JSON.parse(student);

			// find the student in the list and remove it
			let index = studentListAssigned.findIndex(
				(s) => s.id === studentTemp.id && s.dropZone === studentTemp.dropZone
			);

			if (index > -1) {
				studentListAssigned.splice(index, 1);
			}

			// Then, find other students with same id in this list, and -1 qty
			// Also check if they have other courses

			let count = 0;
			let studentMultiCourses = false;

			for (const item of studentListAssigned) {
				if (item.id === studentTemp.id) {
					count++;
					if (count > 1) {
						studentMultiCourses = true;
					}
				}
			}

			for (const item of studentListAssigned) {
				if (item.id === studentTemp.id) {
					item.ta_available++;
					item.multiCourses = studentMultiCourses;
				}
			}

			// If back to student available, ta available again
			studentTemp.dropZone = 0;
			studentTemp.ta_available += 1;

			// check if student already in studentListAvail
			const studentExists = studentListAvail.some(
				(student) => student.id === studentTemp.id
			);

			if (!studentExists) {
				setStudentListAvail([...studentListAvail, studentTemp]);
			} else {
				//

				const studentIndex = studentListAvail.findIndex(
					(student) => student.id === studentTemp.id
				);
				if (studentIndex > -1) {
					studentListAvail[studentIndex].ta_available++;

					studentTemp = studentListAvail[studentIndex];
				}
				setStudentListAvail(studentListAvail);
				// Update the student in the list
				//const updatedStudentList = [...studentListAvail];
				//updatedStudentList[index] = studentTemp;

				//updatedStudentList);
			}

			// course T.A. needed  +1 when removing a student from it

			// find record of courseList with id = student.dropzone and make +1 to ta_needed
			const courseIndex = courseListNeeded.findIndex(
				(course) => course.id === JSON.parse(student).dropZone
			);

			if (courseIndex > -1) {
				courseTemp = courseListNeeded[courseIndex];
				courseTemp.ta_needed += 1;

				courseTemp.ta_assigned -= 1;

				// Update the course in the list
				const updatedCourseList = [...courseListNeeded];
				updatedCourseList[courseIndex] = courseTemp;

				setCourseListNeeded(updatedCourseList);

				deleteStudentCourse(studentTemp, courseTemp);
			}

			// Update student and course record
			if (courseTemp.id) {
				updateCourse(courseTemp);

				if (studentTemp.id) {
					deleteStudentCourse(studentTemp, courseTemp);
				}
			}

			// Update student and course record
			updateStudent(studentTemp);

			// Remove student from course
		} else {
			// If destination is a drop zone, then either move from other drop zone or from student available

			// check if course has at least T.A. needed. If not, cancel.

			var studentTemp = JSON.parse(student);

			let courseIndex = courseListNeeded.findIndex(
				(course) => course.id === dropZone
			);
			if (courseIndex > -1) {
				courseTemp = courseListNeeded[courseIndex];

				if (courseTemp.ta_needed < 1) {
					setErrorMessage("No T.A. is needed for this course");
					return;
				}
			}

			// check if course already has this student. If not, cancel.

			let studentIndex = studentListAssigned.findIndex(
				(student) =>
					student.id === studentTemp.id && student.dropZone === dropZone
			);
			if (studentIndex > -1) {
				setErrorMessage("This student is already in this course");
				return;
			}

			var courseTemp: Course = {
				id: 0,
				hkust_identifier: "",
				name: "",
				description: "",
				field: "",
				keywords: "",
				semester: 0,
				year: 0,
				ta_needed: 0,
				ta_assigned: 0,
				deleted: false,
			};

			if (
				!studentTemp.dropZone ||
				studentTemp.dropZone === "" ||
				studentTemp.dropZone === 0
			) {
				// If from student available, ta available -  1
				studentTemp.ta_available -= 1;
				// if student no more available, remove from available list
				if (studentTemp.ta_available < 1) {
					// find the student in the available list and remove it
					const index = studentListAvail.findIndex(
						(s) => s.id === studentTemp.id
					);

					if (index > -1) {
						studentListAvail.splice(index, 1);
					}

					// Check all records in studentListAssigned for this student, and ta_available - 1
					studentListAssigned.forEach((student) => {
						if (student.id === studentTemp.id) {
							student.ta_available -= 1;
						}
					});
				} else {
					// if still available, -1 from ta_available in the available list
					const index = studentListAvail.findIndex(
						(s) => s.id === studentTemp.id
					);

					if (index > -1) {
						studentListAvail[index].ta_available -= 1;

						setStudentListAvail([...studentListAvail]);

						// Check all records in studentListAssigned for this student, and ta_available - 1
						studentListAssigned.forEach((student) => {
							if (student.id === studentTemp.id) {
								student.ta_available -= 1;
							}
						});
					}
				}

				// check if student present multiple times in studentAssigned. If yes, display warning.
				let count = 0;
				let studentPresent = false;

				for (const item of studentListAssigned) {
					if (item.id === studentTemp.id) {
						count++;
						if (count > 0) {
							studentPresent = true; // Found a duplicate
							studentTemp.multiCourses = true;
							item.multiCourses = true;
							setWarningMessage(
								"Student is already assigned to another course."
							);
						}
					}
				}
			} else {
				// find the student in the list and remove it
				const index = studentListAssigned.findIndex(
					(s) => s.id === studentTemp.id && s.dropZone === studentTemp.dropZone
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

					courseTemp.ta_assigned -= 1;

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
				(student) =>
					student.id === studentTemp.id &&
					student.dropZone === studentTemp.dropZone
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

				courseTemp.ta_assigned += 1;

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

	// Module that create a student react object
	const handleChangeSemester = (
		event: React.ChangeEvent<HTMLSelectElement>
	) => {
		setSemester(event.target.value);

		fetchStudentCourseForSemester(year, event.target.value);
	};

	const handleChangeYear = (event: React.ChangeEvent<HTMLInputElement>) => {
		setYear(parseInt(event.target.value));

		fetchStudentCourseForSemester(parseInt(event.target.value), semester);
	};

	const handleAutoMatch = async () => {
		// Being requested by a teacher : 10 000 pts
		// Having the right qualifications 1000 pts per qualif
		// Already been TA for same course before 100 pts
		// Having matching area 10pts each
		// Student who graduates the soonest 1pt

		// find all students with ta_available > 0 and no dropZone
		let students = studentListAvail.filter(
			(student) => student.ta_available > 0
		);

		// Filter the students array to remove students already in studentListAssigned
		const filteredStudents = students.filter((student) => {
			return studentListAssigned.findIndex((s) => s.id === student.id) === -1;
		});

		// Update the `students` array to the filtered result
		students = filteredStudents;

		const studentCourseToAddList: {
			studentId: number;
			courseId: number;
			score: number;
		}[] = [];

		// for each student, find a course with ta_needed > 0 and no dropZone
		for (const student of students) {
			const courses = courseListNeeded.filter((course) => course.ta_needed > 0);

			// if a course is found, add the student to the course
			if (courses.length > 0) {
				// Check for requests
				// See if there is a request from a teacher to have this student in a course

				for (const course of courses) {
					const studentCourseToAdd = {
						studentId: student.id,
						courseId: course.id,
						score: 0,
					};

					let response = await axios.get(
						"http://localhost:5000/requests/Teacher/1/" +
							student.id +
							"/" +
							course.id
					);

					if (response.data) {
						// request for this student and course by a teacher found

						studentCourseToAdd.score += 10000;
					}

					// Check student and course qualifs
					let courseQualif = [];
					const responseCourseQualif = await axios.get(
						"http://localhost:5000/course_qualifications/" + course.id
					);

					if (responseCourseQualif.data) {
						// course qualifs found
						courseQualif = responseCourseQualif.data;
					}

					// get student's qualifs
					let studentQualif = [];
					const responseStudentQualif = await axios.get(
						"http://localhost:5000/student_qualifications/" + student.id
					);

					if (responseStudentQualif.data) {
						// course qualifs found
						studentQualif = responseStudentQualif.data;
					}

					// Check how many common qualifications in studentQualif and courseQualif

					for (const studentQualifElement of studentQualif) {
						for (const courseQualifElement of courseQualif) {


							if (
								studentQualifElement.qualification ===
								courseQualifElement.qualification
							) {
							

								// common qualif found
								studentCourseToAdd.score += 1000;
							}
						}
					}

					console.log(
						"common qualifs between student and course",
						student.l_name,
						course.name,
						studentCourseToAdd.score
					);

					// 1000pts per qualifs in common

					studentCourseToAddList.push(studentCourseToAdd);
				}
			} else {
				// if no course is found, display a message
				console.log("No course available for this student", student);
			}
		}

		// list of students / courses to match

		/*for (const studentCourseToAdd of studentCourseToAddList) {
			// find the student and course in the lists
			const student = studentListAvail.find(
				(s) => s.id === studentCourseToAdd.studentId
			);

			if (student) {
				// -1 to his T.A. available
				student.ta_available -= 1;

				// trick to not modify the one in studentListAvail
				const studentClone = JSON.parse(JSON.stringify(student));

				// add student to course
				studentClone.dropZone = studentCourseToAdd.courseId;

				studentListAssigned.push(studentClone);

				// if TA = 0, remove from list
				if (student.ta_available === 0) {
					const index = studentListAvail.findIndex((s) => s.id === student.id);
					if (index > -1) {
						studentListAvail.splice(index, 1);
					}
				}

				updateStudent(studentClone);

				// get course and update it

				const response = await axios.get(
					"http://localhost:5000/courses/" + studentCourseToAdd.courseId
				);
				if (response) {
					response.data.ta_needed = response.data.ta_needed - 1;
					response.data.ta_assigned = response.data.ta_assigned + 1;
					updateCourse(response.data);

					addStudentCourse(student, response.data);

					// also update same course in list courseListNeeded
					const courseIndex = courseListNeeded.findIndex(
						(course) => course.id === studentCourseToAdd.courseId
					);
					if (courseIndex > -1) {
						courseListNeeded[courseIndex].ta_needed -= 1;
						courseListNeeded[courseIndex].ta_assigned += 1;
					}
				}
			}
		}

		setStudentListAssigned([...studentListAssigned]);
		setStudentListAvail([...studentListAvail]);*/
	};

	return (
		<div className={styles.pageTitle}>
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
			<div className={styles.pageHoriz}>
				<div className={styles.columns}>
					{/* Column for available students */}
					<div
						className={styles.availableColumn}
						onDrop={(event) => dropHandler(event, 0)}
						onDragOver={handleDragOver}>
						<h2>Students Available</h2>
						<div className={styles.dropArea}>
							{studentListAvail.map((student) => (
								<StudentBlock
									key={student.id.toString()}
									student={student}
									studentQualification={studentQualification}
									onDragStart={handleDragStart}
									hoveredStudent={hoveredStudent}
									setHoveredStudent={setHoveredStudent}
								/>
							))}
						</div>
					</div>

					{/* Columns for drop areas */}

					<div className={styles.dropAreas}>
						{courseListNeeded.map((course) => (
							<div key={course.id}>
								<h2>{course.hkust_identifier}</h2>
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
												<StudentBlock
													key={student.id.toString()}
													student={student}
													studentQualification={studentQualification}
													onDragStart={handleDragStart}
													hoveredStudent={hoveredStudent}
													setHoveredStudent={setHoveredStudent}
												/>
											))}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className={styles.button} onClick={() => handleAutoMatch()}>
					Auto match
				</div>

				{errorMessage.length > 0 && (
					<div className={styles.error}>{errorMessage}</div>
				)}

				{warningMessage.length > 0 && (
					<div className={styles.warning}>{warningMessage}</div>
				)}
			</div>
		</div>
	);
}
