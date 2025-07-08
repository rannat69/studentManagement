"use client";

import React, { useEffect, useState } from "react";

import styles from "./styles/page.module.css";
import Modal from "./makeRequestModal"; // Adjust the import path as necessary
import { Request } from "../data/requestData";

import axios from "axios";
import { Course } from "../data/courseListData";
import { Student } from "../data/studentListData";
import { Teacher } from "../data/teacherListData";


export default function MakeRequest() {
	const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [requestListState, setRequestListState] = useState<Request[]>();
	const [courses, setCourses] = useState<Course[]>([]);
	const [students, setStudents] = useState<Student[]>([]);
	const [teachers, setTeachers] = useState<Teacher[]>([]);

	const [orderByField, setOrderByField] = useState<string | null>(null);
	const [orderByDirection, setOrderByDirection] = useState<"asc" | "desc">(
		"asc"
	);


	useEffect(() => {
		let coursesTemp: Course[] = [];
		let studentsTemp: Student[] = [];
		let teachersTemp: Teacher[] = [];

		const fetchCourses = async () => {
			try {
				const response = await axios.get("/api/course/all");
				coursesTemp = response.data;
				setCourses(response.data);
			} catch (error) {
				console.error("Error fetching courses:", error);
			}
		};

		fetchCourses();

		const fetchStudents = async () => {
			try {
				const response = await axios.get("/api/student/all");
				studentsTemp = response.data;
				setStudents(response.data);
			} catch (error) {
				console.error("Error fetching students:", error);
			}
		};

		fetchStudents();

		const fetchTeachers = async () => {
			try {
				const response = await axios.get("/api/teacher/all");
				teachersTemp = response.data;
				setTeachers(response.data);
			} catch (error) {
				console.error("Error fetching teachers:", error);
			}
		};

		fetchTeachers();

		// fetch requests
		const fetchRequests = async () => {

			try {
				const response = await axios.get("/api/course/all");
				coursesTemp = response.data;

			} catch (error) {
				console.error("Error fetching courses:", error);
			}

			try {
				const response = await axios.get("/api/student/all");
				studentsTemp = response.data;

			} catch (error) {
				console.error("Error fetching students:", error);
			}

			try {
				const response = await axios.get("/api/teacher/all");
				teachersTemp = response.data;

			} catch (error) {
				console.error("Error fetching teachers:", error);
			}

			const response = await axios.get("/api/request/all");

			for (const request of response.data) {
				request.want = request.want === 1 ? true : false;
			}

			for (const request of response.data) {
				const student = studentsTemp.find(
					(student) => student.id === request.student_id
				);

				if (student) {
					request.student_name = student.l_name + " " + student.f_names;
				}

				let teacher: Teacher | undefined = undefined;

				teacher = teachersTemp.find(
					(teacher) => teacher.id === request.teacher_id
				);


				if (teacher) {
					request.teacher_name = teacher.l_name + " " + teacher.f_names;
				}

				const course = coursesTemp.find(
					(course) => course.id === request.course_id
				);

				if (course) {
					request.course_name = course.name;
				}
			}

			setRequestListState(response.data);
		};

		fetchRequests();
	}, []);

	// Function to get course name by ID
	const getCourseNameById = (id: number) => {
		const course = courses.find((course) => course.id === id);
		return course ? course.name : "<Unknown Course>"; // Fallback if not found
	};

	// Function to get student name by ID
	const getStudentNameById = (id: number) => {

		const student = students.find((student) => student.id === id);
		return student
			? student.l_name + " " + student.f_names
			: "<Unknown Student>"; // Fallback if not found
	};

	// Function to get teacher name by ID
	const getTeacherNameById = (id: number) => {
		const teacher = teachers.find((teacher) => teacher.id === id);

		return teacher
			? teacher.l_name + " " + teacher.f_names
			: "<Unknown Teacher>"; // Fallback if not found
	};

	const handleClickRequest = (request: Request): void => {
		setSelectedRequest(request);
		setIsModalOpen(true);
	};

	const handleClickRequestNew = (): void => {
		setSelectedRequest(null);
		setIsModalOpen(true);
	};

	const handleSaveRequest = (updatedRequest: Request) => {

		// Update the request list with the new data
		if (!requestListState) {
			return;
		}

		let updatedList;

		// Check if the request is marked for deletion
		if (updatedRequest.deleted) {
			// Remove the request from the list
			updatedList = requestListState.filter(
				(request) => request.id !== updatedRequest.id
			);
		} else {
			// Check if the request exists in the list
			const requestExists = requestListState.some(
				(request) => request.id === updatedRequest.id
			);

			updatedList = requestExists
				? requestListState.map((request) =>
					request.id === updatedRequest.id ? updatedRequest : request
				)
				: [...requestListState, updatedRequest];
		}

		// add in the updatedList the name of the student and the teacher
		for (const request of updatedList) {
			request.student_name = getStudentNameById(Number(request.student_id));
			request.teacher_name = getTeacherNameById(Number(request.teacher_id));
			request.course_name = getCourseNameById(Number(request.course_id));
		}

		// Update the state with the new request list
		setRequestListState(updatedList);
	};

	const handleOrderBy = (column: string) => {
		if (!requestListState) {
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
		const sortedList = [...requestListState].sort((a, b) => {
			const aValue = a[column as keyof Request];
			const bValue = b[column as keyof Request];

			if (typeof aValue === "string" && typeof bValue === "string") {
				return aValue > bValue ? 1 : -1;
			} else if (typeof aValue === "number" && typeof bValue === "number") {
				return aValue - bValue;
			} else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
				// Sort booleans: true first, then false
				return aValue === bValue ? 0 : (aValue ? -1 : 1);
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
		setRequestListState(sortedList);
	};

	return (
		<div className={ styles.page }>
			Request list

			<div className={ styles.add } onClick={ () => handleClickRequestNew() }>
				Make request
			</div>

			<div className={ styles.main }>

				<table className={ styles.tableStudent }>

					<thead>
						<tr>

							<th onClick={ () => handleOrderBy("teacher_name") }>Teacher</th>
							<th onClick={ () => handleOrderBy("student_name") }>Student</th>
							<th onClick={ () => handleOrderBy("request_from") }>Request from</th>
							<th onClick={ () => handleOrderBy("course_name") }>Course</th>
							<th onClick={ () => handleOrderBy("message") }>Message</th>
							<th onClick={ () => handleOrderBy("want") }>Want ?</th>

						</tr>
					</thead>
					<tbody>
						{ requestListState &&
							requestListState.map((request) => (
								<tr key={ request.id }
									onClick={ () => handleClickRequest(request) }>

									<td>{ request.teacher_name }</td>
									<td>{ request.student_name }</td>
									<td>{ request.request_from }</td>
									<td>{ request.course_name }</td>
									<td>{ request.message }</td>
									<td>{ request.want ? "Yes" : "No" } </td>
								</tr>
							)) }
					</tbody>
				</table>




			</div>

			<footer className={ styles.footer }></footer>
			<Modal
				isOpen={ isModalOpen }
				request={ selectedRequest }
				onClose={ () => setIsModalOpen(false) }
				onSave={ handleSaveRequest }
			/>
		</div>
	);
}
