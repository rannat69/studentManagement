// StudentBlock.tsx
import React from "react";
import { Student } from "../data/studentListData";
import { Qualification } from "../data/qualificationData";
import styles from "./styles/page.module.css";

interface StudentBlockProps {
	student: Student;
	studentQualification: Qualification[];
	onDragStart: (
		event: React.DragEvent<HTMLDivElement>,
		student: Student
	) => void;
	hoveredStudent: number;
	setHoveredStudent: (id: number) => void;
}

const StudentBlock: React.FC<StudentBlockProps> = ({
	student,
	studentQualification,
	onDragStart,
	hoveredStudent,
	setHoveredStudent,
}) => {
	return (
		<div
			draggable='true'
			className={styles.element}
			onDragStart={(event) => onDragStart(event, student)}
			onMouseLeave={() => setHoveredStudent(0)}>
			<h2
				className={styles.matchStudentName}
				onMouseEnter={() => setHoveredStudent(student.id)}>
				{student.l_name} {student.f_names}
			</h2>

			<div className={styles.popup}>
				<div>Program: {student.program}</div>
				<div>
					Qualifications:{" "}
					{studentQualification
						.filter((qualification) => qualification.student_id === student.id)
						.map((qualification) => (
							<div key={qualification.qualification}>
								<h4>- {qualification.qualification}</h4>
							</div>
						))}
				</div>
			</div>

			<h4>{student.unoff_name}</h4>
			<p>
				{"Y. " +
					student.expected_grad_year +
					" S. " +
					student.expected_grad_semester}
			</p>
			<p>{"T.A. available: " + student.ta_available}</p>
		</div>
	);
};

export default StudentBlock;
