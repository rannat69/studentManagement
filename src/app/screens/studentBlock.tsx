// StudentBlock.tsx
import React, { useState } from "react";
import { Student } from "../data/studentListData";
import { StudentQualification } from "../data/studentQualificationData";

import { StudentArea } from "../data/studentAreaData";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import styles from "./styles/page.module.css";
import { StudentTeacher } from "../data/studentTeacherData";
import { Teacher } from "../data/teacherListData";

interface StudentBlockProps {
  student: Student;
  studentQualification: StudentQualification[];
  studentArea: StudentArea[];
  studentTeacher: StudentTeacher[];
  studentListAssigned: Student[];
  teachers: Teacher[];
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    student: Student,
  ) => void;
  hoveredStudent: number;
  setHoveredStudent: (id: number) => void;
  big: boolean;
  assigned: boolean;
}

const StudentBlock: React.FC<StudentBlockProps> = ({
  student,
  studentQualification,
  studentArea,
  studentTeacher,
  studentListAssigned,
  teachers,
  onDragStart,
  big,
  assigned,
}) => {
  return (
    <OverlayTrigger
      placement="left"
      overlay={
        <Tooltip id="button-tooltip-2" className={styles.popup} bsPrefix="popup">
          <div>
            {student.unoff_name?.length > 0 && (
              <h4>AKA {student.unoff_name}</h4>
            )}

            <p>{student.email}</p>

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

            {studentQualification.filter(
              (qualification) => qualification.student_id === student.id,
            ).length > 0 && (
              <div>
                <h2>Qualifications: </h2>
                {studentQualification
                  .filter(
                    (qualification) => qualification.student_id === student.id,
                  )
                  .map((qualification) => (
                    <div key={qualification.qualification}>
                      <h4>- {qualification.qualification}</h4>
                    </div>
                  ))}
              </div>
            )}

            {studentArea.filter((area) => area.student_id === student.id)
              .length > 0 && (
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

            {studentTeacher.some((st) => st.student_id === student.id) && (
              <>
                <h2>Advisors</h2>
                <div>
                  {teachers.map(
                    (teacher) =>
                      studentTeacher.find(
                        (studentTeacher) =>
                          studentTeacher.teacher_id === teacher.id &&
                          studentTeacher.student_id === student.id,
                      ) && (
                        <div key={teacher.id} className={styles.smallText}>
                          {teacher.l_name} {teacher.f_names}
                        </div>
                      ),
                  )}
                </div>
              </>
            )}
          </div>
        </Tooltip>
      }
    >
      {big ? (
        <div
          draggable="true"
          className={styles.elementBig}
          onDragStart={(event) => onDragStart(event, student)}
        >
          <>
            <h1
              className={
                student.ta_available > 0 &&
                student.available &&
                studentListAssigned.filter((sa) => sa.id === student.id)
                  .length < 2
                  ? styles.green
                  : studentListAssigned.filter((sa) => sa.id === student.id)
                        .length > 1 ||
                      (studentListAssigned.some((sa) => sa.id === student.id) &&
                        !student.available) ||
                      student.ta_available < 0
                    ? styles.orange
                    : styles.grey
              }
            >
              {student.l_name.slice(0, 2)}
            </h1>
            <div className={styles.studentInfoContainer}>
              <div className={styles.studentInfo}>
                <h2 className={styles.matchStudentName}>
                  {student.l_name} {student.f_names} <br />
                  {assigned ? (
                    <div className={styles.assigned}>Assigned</div>
                  ) : (
                    <></>
                  )}
                </h2>

                <div className={styles.advisors}>
                  <h4>Advisors</h4>
                  <div>
                    {teachers.map(
                      (teacher) =>
                        studentTeacher.find(
                          (studentTeacher) =>
                            studentTeacher.teacher_id === teacher.id &&
                            studentTeacher.student_id === student.id,
                        ) && (
                          <div key={teacher.id} className={styles.smallText}>
                            {teacher.l_name} {teacher.f_names}
                          </div>
                        ),
                    )}
                  </div>
                </div>

                <div className={styles.areas}>
                  <h4>Areas</h4>
                  {studentArea
                    .filter((area) => area.student_id === student.id)
                    .map((area) => (
                      <div className={styles.smallText} key={area.area}>
                        {area.area}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
          <div></div>
        </div>
      ) : (
        <div
          draggable="true"
          className={styles.element}
          onDragStart={(event) => onDragStart(event, student)}
        >
          <h2 className={styles.matchStudentName}>
            {student.l_name} {student.f_names}
          </h2>
        </div>
      )}
    </OverlayTrigger>
  );
};

export default StudentBlock;
