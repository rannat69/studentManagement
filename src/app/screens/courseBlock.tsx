// StudentBlock.tsx
import React from "react";

import styles from "./styles/page.module.css";

import { Course } from "../data/courseListData";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface CourseBlockProps {
	course: Course;

}

const CourseBlock: React.FC<CourseBlockProps> = ({
	course,
}) => {
	return (
		<OverlayTrigger
			placement='left'
			overlay={
				<Tooltip id='button-tooltip-2'>
					<div className={styles.popup}>
						{course.qualification && course.qualification.length > 0 && (
							<div>
								<h2>Qualifications: </h2>
								{course.qualification.map((qualification) => (
										<div key={qualification}>
											<h4>- {qualification}</h4>
										</div>
									))}
							</div>
						)}

						{course.area && course.area.length >
							0 && (
							<div>
								<h2>Areas: </h2>
								{course.area.map((area) => (
										<div key={area}>
											<h4>- {area}</h4>
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

				<p>{"T.A. needed: " + course.ta_needed}</p>
			</div>
		</OverlayTrigger>
	);
};

export default CourseBlock;
