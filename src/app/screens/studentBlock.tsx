// StudentBlock.tsx
import React from "react";
import { Student } from "../data/studentListData";
import { StudentQualification } from "../data/studentQualificationData";
import styles from "./styles/page.module.css";
import { StudentArea } from "../data/studentAreaData";

interface StudentBlockProps {
	student: Student;
	studentQualification: StudentQualification[];
	studentArea: StudentArea[];
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
	studentArea,
	onDragStart,
}) => {
	return (
		<div
			draggable='true'
			className={styles.element}
			onDragStart={(event) => onDragStart(event, student)}>
			<h2 className={styles.matchStudentName}>
				{student.l_name} {student.f_names}
			</h2>

			<div className={styles.popup}>
				{student.program && (
					<div>
						<h2>Program: {student.program}</h2>
					</div>
				)}

				{studentQualification.filter(
					(qualification) => qualification.student_id === student.id
				).length > 0 && (
					<div>
						<h2>Qualifications: </h2>
						{studentQualification
							.filter(
								(qualification) => qualification.student_id === student.id
							)
							.map((qualification) => (
								<div key={qualification.qualification}>
									<h4>- {qualification.qualification}</h4>
								</div>
							))}
					</div>
				)}

				{studentArea.filter((area) => area.student_id === student.id).length >
					0 && (
					<div>
						<h2>Areas: </h2>
						{studentArea
							.filter((area) => area.student_id === student.id)
							.map((area) => (
								<div key={area.area}>
									<h4>- {area.area}</h4>
								</div>
							))}
					</div>
				)}
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
