// StudentBlock.tsx
import React from "react";
import { CourseArea } from "../data/courseAreaData";
import { CourseQualification } from "../data/courseQualificationData";
import styles from "./styles/page.module.css";

import { Course } from "../data/courseListData";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface CourseBlockProps {
	course: Course;
	courseQualification: CourseQualification[];
	courseArea: CourseArea[];
}

const CourseBlock: React.FC<CourseBlockProps> = ({
	course,
	courseQualification,
	courseArea,
}) => {
	return (
		<OverlayTrigger
			placement='left'
			overlay={
				<Tooltip id='button-tooltip-2' className={styles.popup} bsPrefix="popup">
					<div >
						{courseQualification.filter(
							(qualification) => qualification.course_id === course.id
						).length > 0 && (
							<div>
								<h2>Qualifications: </h2>
								{courseQualification
									.filter(
										(qualification) => qualification.course_id === course.id
									)
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
				</Tooltip>
			}>
			<div className={styles.courseBlock} draggable='true'>
				<h2 className={styles.matchStudentName}>{course.hkust_identifier}</h2>

				<h2 className={styles.matchStudentName}>{course.name}</h2>

			
			</div>
		</OverlayTrigger>
	);
};

export default CourseBlock;
