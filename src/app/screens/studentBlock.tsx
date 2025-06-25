// StudentBlock.tsx
import React from "react";
import { Student } from "../data/studentListData";

import styles from "./styles/page.module.css";

import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface StudentBlockProps {
	student: Student;

	onDragStart: (
		event: React.DragEvent<HTMLDivElement>,
		student: Student
	) => void;
	hoveredStudent: number;
	setHoveredStudent: (id: number) => void;
}

const StudentBlock: React.FC<StudentBlockProps> = ({
	student,

	onDragStart,
}) => {
	return (
		<OverlayTrigger
			placement='bottom'
			overlay={
				<Tooltip id='button-tooltip-2'>
					<div className={styles.popup}>
						{student.unoff_name?.length > 0 && <h4>AKA {student.unoff_name}</h4>}
						<p>
							{"Expected to graduate :  " +
								student.expected_grad_year +
								" " +
								student.expected_grad_semester}
						</p>
						<p>{"T.A. available: " + student.ta_available}</p>

						{student.program && (
							<div>
								<h2>Program: {student.program}</h2>
							</div>
						)}

						{student.qualification && student.qualification.length > 0 && (
							<div>
								<h2>Qualifications: </h2>
								{student.qualification
									.map((qualification) => (
										<div key={qualification}>
											<h4>- {qualification}</h4>
										</div>
									))}
							</div>
						)}

						{student.area && student.area.length > 0 && (
							<div>
								<h2>Areas: </h2>
								{student.area
									.map((area) => (
										<div key={area}>
											<h4>- {area}</h4>
										</div>
									))}
							</div>
						)}
					</div>
				</Tooltip>
			}>
			<div
				draggable='true'
				className={styles.element}
				onDragStart={(event) => onDragStart(event, student)}>
				<h2 className={styles.matchStudentName}>
					{student.l_name} {student.f_names}
				</h2>
			</div>
		</OverlayTrigger>
	);
};

export default StudentBlock;
