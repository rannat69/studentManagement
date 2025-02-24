"use client";

import React, { useEffect, useState } from "react";

import styles from "./screens/styles/page.module.css";

import StudentList from "./screens/studentList";
import {
	STUDENT_LIST,
	COURSE_LIST,
	MATCH_STUDENT_COURSE,
	TEACHER_LIST,
	MAKE_REQUEST,
	IMPORT_EXPORT,
} from "./constants";
import CourseList from "./screens/courseList";
import MatchStudentCourse from "./screens/matchStudentCourse";
import TeacherList from "./screens/teacherList";
import MakeRequest from "./screens/makeRequest";
import ImportExport from "./screens/importExport";

import axios from "axios";

export default function Home() {
	const [activeTab, setActiveTab] = useState<string | null>(STUDENT_LIST);

	const [userLoggedIn, setUserLoggedIn] = useState<string>("");

	const [errorMessage, setErrorMessage] = useState<string>("");

	const changeTab = (tab: string) => {
		setActiveTab(tab);
	};

	useEffect(() => {
		// Check if the user is already logged in
		const storedUserLoggedIn = localStorage.getItem("userLoggedIn");
		if (storedUserLoggedIn) {
			setUserLoggedIn(storedUserLoggedIn);
		}

		function getCookie(name) {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop().split(';').shift();
		}
		
		const token = getCookie("token");
		const isLoggedIn = !!token; // Check if the token exists

	}, []);

	async function handleLogin(): Promise<void> {
		// check if login = admin and password = 123

		const login = (document.getElementById("login") as HTMLInputElement).value;

		const password = (document.getElementById("password") as HTMLInputElement)
			.value;

		const loginData = {
			login: login, // User ID
			password: password, // Password
		};

		const response = await fetch("http://localhost:5000/user/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(loginData),
		});

		if (!response.ok) {
			throw new Error("Network response was not ok");
		}

		const data = await response.json();

		console.log(data);

		if (data.error) {
			setErrorMessage(data.error);
			return;
		}

		console.log("Login successful:", data);
		setUserLoggedIn(login);
		localStorage.setItem("userLoggedIn", login);

		const jwtToken = data.token;

		

		document.cookie = "token=" + jwtToken + "; path=/; secure; HttpOnly; expires=" + expirationDate.toUTCString();

	}

	return (
		<>
			{userLoggedIn ? (
				<>
					<div className={styles.tab}>
						<div
							className={activeTab === STUDENT_LIST ? styles.active : ""}
							onClick={() => changeTab(STUDENT_LIST)}>
							Student list
						</div>
						<div
							className={activeTab === COURSE_LIST ? styles.active : ""}
							onClick={() => changeTab(COURSE_LIST)}>
							Course list{" "}
						</div>

						<div
							className={activeTab === TEACHER_LIST ? styles.active : ""}
							onClick={() => changeTab(TEACHER_LIST)}>
							Teacher list{" "}
						</div>
						<div
							className={
								activeTab === MATCH_STUDENT_COURSE ? styles.active : ""
							}
							onClick={() => changeTab(MATCH_STUDENT_COURSE)}>
							Match Student and Course{" "}
						</div>

						<div
							className={activeTab === MAKE_REQUEST ? styles.active : ""}
							onClick={() => changeTab(MAKE_REQUEST)}>
							Requests{" "}
						</div>

						<div
							className={activeTab === IMPORT_EXPORT ? styles.active : ""}
							onClick={() => changeTab(IMPORT_EXPORT)}>
							Import / Export{" "}
						</div>
					</div>

					<div>
						{activeTab && activeTab === STUDENT_LIST && <StudentList />}
					</div>
					<div>{activeTab && activeTab === COURSE_LIST && <CourseList />}</div>

					<div>
						{activeTab && activeTab === TEACHER_LIST && <TeacherList />}
					</div>
					<div>
						{activeTab && activeTab === MATCH_STUDENT_COURSE && (
							<MatchStudentCourse />
						)}
					</div>

					<div>
						{activeTab && activeTab === MAKE_REQUEST && <MakeRequest />}
					</div>

					<div>
						{activeTab && activeTab === IMPORT_EXPORT && <ImportExport />}
					</div>
				</>
			) : (
				<>
					<div className={styles.login}>
						Login
						<br />
						<input type='text' id='login' placeholder='login' />
						<br />
						Password
						<br />
						<input type='password' id='password' placeholder='password' />
						<div className={styles.add} onClick={() => handleLogin()}>
							Login
						</div>
						{errorMessage.length > 0 && (
							<div className={styles.error}>{errorMessage}</div>
						)}
					</div>
				</>
			)}
		</>
	);
}
