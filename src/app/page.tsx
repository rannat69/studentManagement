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
} from "./constants";
import CourseList from "./screens/courseList";
import MatchStudentCourse from "./screens/matchStudentCourse";
import TeacherList from "./screens/teacherList";
import MakeRequest from "./screens/makeRequest";

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
	}, []);

	function handleLogin(): void {
		// check if login = admin and password = 123

		if (
			(document.getElementById("login") as HTMLInputElement).value ===
				"admin" &&
			(document.getElementById("password") as HTMLInputElement).value === "123"
		) {
			setUserLoggedIn("admin");

			// also store in local storage
			localStorage.setItem("userLoggedIn", "admin");
		} else {
			setErrorMessage("Wrong login or password");
		}
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
