"use client";

import React, { useEffect, useState } from "react";

import styles from "./page.module.css";

import StudentList from "./studentList";
import { STUDENT_LIST, COURSE_LIST } from "./constants";
import CourseList from "./courseList";

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
Course list				</div>
			</div>

			<div>{activeTab && activeTab === STUDENT_LIST && <StudentList />}</div>
			<div>{activeTab && activeTab === COURSE_LIST && <CourseList />}</div>
		</>
	);
}
