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
		const fetchCourses = async () => {
			try {
				const response = await axios.get("http://localhost:5000/courses");
				setCourses(response.data);
			} catch (error) {
				console.error("Error fetching courses:", error);
			}
		};

		fetchCourses();

		const fetchStudents = async () => {
			try {
				const response = await axios.get("http://localhost:5000/students");
				setStudents(response.data);
			} catch (error) {
				console.error("Error fetching students:", error);
			}
		};

		fetchStudents();

		const fetchTeachers = async () => {
			try {
				const response = await axios.get("http://localhost:5000/teachers");
				setTeachers(response.data);
			} catch (error) {
				console.error("Error fetching teachers:", error);
			}
		};

		fetchTeachers();
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

	useEffect(() => {
		const fetchRequests = async () => {
			const response = await axios.get("http://localhost:5000/requests");

			setRequestListState(response.data);
		};

		fetchRequests();
	}, []);

	const handleClickRequest = (request: Request): void => {
		setSelectedRequest(request);
		setIsModalOpen(true);
	};

	const handleClickRequestNew = (): void => {
		setSelectedRequest(null);
		setIsModalOpen(true);
	};

	function getCourse(id: number) {
		const fetchCourseId = async () => {
			const response = await axios.get(
				`http://localhost:5000/courses/?id=${id}`
			);
			return response.data;
		};
		const test = fetchCourseId();
		console.log("test", test);
		return fetchCourseId();
	}

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

		// Update the state with the new request list
		setRequestListState(updatedList);
	};

	return (
		<div className={styles.page}>
			Request list
			<div className={styles.main}>
				{requestListState &&
					requestListState.map((request) => (
						<div
							key={request.id}
							className={styles.element}
							onClick={() => handleClickRequest(request)}>
							<h2>{request.message}</h2>

							<p>
								{request.request_from === "Teacher"
									? getTeacherNameById(request.teacher_id)
									: getStudentNameById(request.student_id)}
								{request.want === true ? " wants" : " does not want"}{" "}
								{request.request_from === "Teacher"
									? "this student " +
									  getStudentNameById(request.student_id) +
									  " in this course : " +
									  getCourseNameById(request.course_id)
									: " to be in this course : " + getCourseNameById(request.course_id)}
							</p>
						</div>
					))}
			</div>
			<div className={styles.add} onClick={() => handleClickRequestNew()}>
				Make request
			</div>
			<footer className={styles.footer}>Le Footer</footer>
			<Modal
				isOpen={isModalOpen}
				request={selectedRequest}
				onClose={() => setIsModalOpen(false)}
				onSave={handleSaveRequest}
			/>
		</div>
	);
}
