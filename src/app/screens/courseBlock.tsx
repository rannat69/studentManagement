// StudentBlock.tsx
import React from "react";
import { CourseArea } from "../data/courseAreaData";
import { CourseQualification } from "../data/courseQualificationData";
import styles from "./styles/page.module.css";

import { Course } from "../data/courseListData";

interface CourseBlockProps {
	course: Course;
	courseQualification: CourseQualification[];
	courseArea: CourseArea[];

	hoveredCourse: number;
	setHoveredCourse: (id: number) => void;
}

const CourseBlock: React.FC<CourseBlockProps> = ({
	course,
	courseQualification,
	courseArea,

	hoveredCourse,
	setHoveredCourse,
}) => {
	return (
		<div className={styles.courseBlock}
			draggable='true'
		
			onMouseLeave={() => setHoveredCourse(0)}>
			<h2
				className={styles.matchStudentName}
				onMouseEnter={() => setHoveredCourse(course.id)}>
				{course.hkust_identifier}
			</h2>

			<h2
				className={styles.matchStudentName}
				onMouseEnter={() => setHoveredCourse(course.id)}>
				{course.name}
			</h2>

			<div className={styles.popup}>
				{courseQualification.filter(
					(qualification) => qualification.course_id === course.id
				).length > 0 && (
					<div>
						<h2>Qualifications: </h2>
						{courseQualification
							.filter((qualification) => qualification.course_id === course.id)
							.map((qualification) => (
								<div key={qualification.qualification}>
									<h4>- {qualification.qualification}</h4>
								</div>
							))}
					</div>
				)}

				{courseArea.filter((area) => area.course_id === course.id).length >
					0 && (
					<div>
						<h2>Areas: </h2>
						{courseArea
							.filter((area) => area.course_id === course.id)
							.map((area) => (
								<div key={area.area}>
									<h4>- {area.area}</h4>
								</div>
							))}
					</div>
				)}
			</div>

			<p>{"T.A. needed: " + course.ta_needed}</p>
		</div>
	);
};

export default CourseBlock;
