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

	useEffect(() => {
		let coursesTemp: Course[] = [];
		let studentsTemp: Student[] = [];
		let teachersTemp: Teacher[] = [];

		const fetchRequests = async () => {
			try {
				const response = await axios.get("http://localhost:5000/courses");
				coursesTemp = response.data;
				setCourses(response.data);
			} catch (error) {
				console.error("Error fetching courses:", error);
			}

			try {
				const response = await axios.get("http://localhost:5000/students");
				studentsTemp = response.data;
				setStudents(response.data);
			} catch (error) {
				console.error("Error fetching students:", error);
			}

			try {
				const response = await axios.get("http://localhost:5000/teachers");
				teachersTemp = response.data;
				setTeachers(response.data);
			} catch (error) {
				console.error("Error fetching teachers:", error);
			}

			// fetch requests

			const response = await axios.get("http://localhost:5000/requests");

			for (const request of response.data) {
				request.want = request.want === 1 ? true : false;
			}

			for (const request of response.data) {

				const student = studentsTemp.find(
					(student) => student.id === Number(request.student_id)
				);

				if (student) {
					request.student_name = student.l_name + " " + student.f_names;
				}

				const teacher = teachersTemp.find(
					(teacher) => teacher.id === Number(request.teacher_id)
				);

				if (teacher) {
					request.teacher_name = teacher.l_name + " " + teacher.f_names;
				}

				const course = coursesTemp.find(
					(course) => course.id === Number(request.course_id)
				);

				if (course) {
					request.course_name = course.name;
				}
			}

			setRequestListState(response.data);
		}

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

	useEffect(() => { }, []);

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

	return (
		<div className={styles.page}>
			Request list

			<div className={styles.add} onClick={() => handleClickRequestNew()}>
				Make request
			</div>

			<div className={styles.main}>

				<table className={styles.tableStudent}>

					<thead>
						<tr>
							<th>Teacher</th>
							<th>Student</th>
							<th>Request from</th>
							<th>Course</th>
							<th>Message</th>
							<th>Want ? </th>
						</tr>
					</thead>
					<tbody>
						{requestListState &&
							requestListState.map((request) => (
								<tr key={request.id}
									onClick={() => handleClickRequest(request)}>

									<td>{request.teacher_name}</td>
									<td>{request.student_name}</td>
									<td>{request.request_from}</td>
									<td>{request.course_name}</td>
									<td>{request.message}</td>
									<td>{request.want ? "Yes" : "No"} </td>
								</tr>
							))}
					</tbody>
				</table>




			</div>

			<footer className={styles.footer}></footer>
			<Modal
				isOpen={isModalOpen}
				request={selectedRequest}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveRequest}
			/>
		</div>
	);
}
