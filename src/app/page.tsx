"use client";

import React, { useEffect, useState } from "react";

import styles from "./screens/styles/page.module.css";

import StudentList from "./screens/studentList";
import { STUDENT_LIST, COURSE_LIST, MATCH_STUDENT_COURSE } from "./constants";
import CourseList from "./screens/courseList";
import MatchStudentCourse from "./screens/matchStudentCourse";

export default function Home() {
	const [activeTab, setActiveTab] = useState<string | null>(STUDENT_LIST);

	const changeTab = (tab: string) => {
		setActiveTab(tab);
	};

	return (
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
					className={activeTab === MATCH_STUDENT_COURSE ? styles.active : ""}
					onClick={() => changeTab(MATCH_STUDENT_COURSE)}>
					Match Student and Course{" "}
				</div>
			</div>

			<div>{activeTab && activeTab === STUDENT_LIST && <StudentList />}</div>
			<div>{activeTab && activeTab === COURSE_LIST && <CourseList />}</div>
			<div>{activeTab && activeTab === MATCH_STUDENT_COURSE && <MatchStudentCourse />}</div>
		</>
	);
}
