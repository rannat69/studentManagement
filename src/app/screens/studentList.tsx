"use client";

import React, { useEffect, useState } from "react";

import Modal from "./studentListModal"; // Adjust the import path as necessary
import { Student } from "../data/studentListData";
import "bootstrap/dist/css/bootstrap.min.css";
import styles from "./styles/page.module.css";
import axios from "axios";

export default function StudentList() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentListStateUnfiltered, setStudentListStateUnfiltered] =
    useState<Student[]>();
  const [studentListState, setStudentListState] = useState<Student[]>();
  const [orderByField, setOrderByField] = useState<string | null>(null);
  const [orderByDirection, setOrderByDirection] = useState<"asc" | "desc">(
    "asc"
  );

  const [searchYear, setSearchYear] = useState<number>(0);
  const [searchSemester, setSearchSemester] = useState<string>("");
  const [searchName, setSearchName] = useState<string>("");

  useEffect(() => {
    const fetchStudents = async () => {
      const response = await axios.get("/api/student/all");

      for (let i = 0; i < response.data.length; i++) {
        response.data[i].available = response.data[i].available === 1;

        response.data[i].unoff_name =
          response.data[i].unoff_name != null &&
          response.data[i].unoff_name != undefined
            ? response.data[i].unoff_name
            : "";
      }

      setStudentListStateUnfiltered(response.data);
      setStudentListState(response.data);
    };

    fetchStudents();
  }, []);

  const handleClickStudent = (student: Student): void => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleClickStudentNew = (): void => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    // Update the student list with the new data
    if (!studentListState) {
      return;
    }

    console.log("updatedStudent", updatedStudent);

    let updatedList;

    // Check if the student is marked for deletion
    if (updatedStudent.deleted) {
      // Remove the student from the list
      updatedList = studentListState.filter(
        (student) => student.id !== updatedStudent.id
      );
    } else {
      // Check if the student exists in the list
      const studentExists = studentListState.some(
        (student) => student.id === updatedStudent.id
      );

      updatedList = studentExists
        ? studentListState.map((student) =>
            student.id === updatedStudent.id ? updatedStudent : student
          )
        : [...studentListState, updatedStudent];
    }

    // Update the state with the new student list
    setStudentListState(updatedList);
  };

  const handleOrderBy = (column: string) => {
    if (!studentListState) {
      return;
    }

    console.log("column", column);

    let orderByDirectionTemp = "asc";

    // Check if the current column is the same as the previous one
    if (column === orderByField) {
      // Toggle order direction
      setOrderByDirection(orderByDirection === "asc" ? "desc" : "asc");

      orderByDirectionTemp = orderByDirection === "asc" ? "desc" : "asc";
    } else {
      // Reset to ascending order for a new column
      setOrderByDirection("asc");
    }

    // Sort the student list
    const sortedList = [...studentListState].sort((a, b) => {
      const aValue = a[column as keyof Student];
      const bValue = b[column as keyof Student];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue > bValue ? 1 : -1;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
	  } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return aValue === bValue ? 0 : aValue ? -1 : 1;
      } else {
        return 0;
      }
    });

    console.log(orderByDirectionTemp);

    // Reverse the list if the order direction is 'desc'
    if (orderByDirectionTemp === "desc") {
      sortedList.reverse();
    }

    // Update the state
    setOrderByField(column);
    setStudentListState(sortedList);
  };

  const handleSearchStudent = (property: string, searchTerm: string) => {
    if (!studentListStateUnfiltered) {
      return;
    }

    // Variables locales pour les termes de recherche
    let currentSearchName = searchName;
    let currentSearchYear = searchYear;
    let currentSearchSemester = searchSemester;

    // Mettre à jour les valeurs de recherche en fonction de la propriété
    if (property === "name") {
      currentSearchName = searchTerm;
      setSearchName(searchTerm);
    }
    if (property === "year") {
      currentSearchYear = Number(searchTerm);
      setSearchYear(currentSearchYear);
    }
    if (property === "semester") {
      currentSearchSemester = searchTerm;
      setSearchSemester(searchTerm);
    }

    console.log("property", property);
    console.log("searchTerm", searchTerm);

    // Si tous les termes de recherche sont vides, réinitialiser la liste
    if (
      currentSearchName.length === 0 &&
      currentSearchSemester.length === 0 &&
      currentSearchYear === 0
    ) {
      setStudentListState(studentListStateUnfiltered);
      return; // Sortir de la fonction
    }

    // Filtrer la liste des étudiants
    const filteredList = studentListStateUnfiltered.filter((student) => {
      const matchesName =
        currentSearchName.length === 0 ||
        (student.l_name &&
          student.l_name
            .toLowerCase()
            .includes(currentSearchName.toLowerCase())) ||
        (student.f_names &&
          student.f_names
            .toLowerCase()
            .includes(currentSearchName.toLowerCase())) ||
        (student.unoff_name &&
          student.unoff_name
            .toLowerCase()
            .includes(currentSearchName.toLowerCase()));

      const matchesYear =
        currentSearchYear === 0 ||
        student.expected_grad_year === currentSearchYear;

      const matchesSemester =
        currentSearchSemester.length === 0 ||
        student.expected_grad_semester === currentSearchSemester;

      return matchesName && matchesYear && matchesSemester;
    });

    // Mettre à jour l'état avec la liste filtrée
    setStudentListState(filteredList);
  };

  return (
    <div className={styles.page}>
      <h1>Student</h1>
      <h4>Total {studentListState?.length} student(s)</h4>
      <br />

      <div className={styles.center}>
        <div className={styles.header}>
          Year
          <select
            name="expected_grad_year"
            onChange={(e) => handleSearchStudent("year", e.target.value)}
            className={styles.select}
          >
            <option value="">-</option>
            {Array.from({ length: 2100 - 1990 }, (_, index) => {
              const year = 1991 + index;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
          Semester
          <select
            name="expected_grad_semester"
            onChange={(e) => handleSearchStudent("semester", e.target.value)}
            className={styles.select}
          >
            <option value="">-</option>
            <option value="Spring">Spring</option>

            <option value="Summer">Summer</option>

            <option value="Fall">Fall</option>
            <option value="Winter">Winter</option>
          </select>
          <input
            type="text"
            className={styles.input}
            placeholder="&#128269;   Search students ..."
            onChange={(e) => handleSearchStudent("name", e.target.value)}
          ></input>
          <div className={styles.add} onClick={() => handleClickStudentNew()}>
            + Add student
          </div>
        </div>
        <div className={styles.main}>
          <table className={styles.tableStudent}>
            <thead>
              <tr>
                <th onClick={() => handleOrderBy("l_name")}>Surname</th>
                <th onClick={() => handleOrderBy("f_names")}>First name</th>
                <th onClick={() => handleOrderBy("unoff_name")}>
                  Unofficial name
                </th>
                <th onClick={() => handleOrderBy("expected_grad_year")}>
                  Expected graduation year
                </th>
                <th onClick={() => handleOrderBy("expected_grad_semester")}>
                  Graduation semester
                </th>
                <th onClick={() => handleOrderBy("ta_available")}>
                  T.A. available
                </th>
                <th onClick={() => handleOrderBy("available")}>Available</th>
              </tr>
            </thead>
            <tbody>
              {studentListState &&
                studentListState.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => handleClickStudent(student)}
                  >
                    <td>
                      {student.l_name && student.l_name.length > 0
                        ? student.l_name
                        : "-"}
                    </td>
                    <td>
                      {student.f_names && student.f_names.length > 0
                        ? student.f_names
                        : "-"}
                    </td>
                    <td>
                      {student.unoff_name && student.unoff_name.length > 0
                        ? student.unoff_name
                        : "-"}
                    </td>
                    <td>{student.expected_grad_year}</td>
                    <td>
                      {student.expected_grad_semester === "Spring" && (
                        <div className={styles.semesterSpring}>
                          {student.expected_grad_semester}
                        </div>
                      )}
                      {student.expected_grad_semester === "Summer" && (
                        <div className={styles.semesterSummer}>
                          {student.expected_grad_semester}
                        </div>
                      )}
                      {student.expected_grad_semester === "Fall" && (
                        <div className={styles.semesterFall}>
                          {student.expected_grad_semester}
                        </div>
                      )}
                      {student.expected_grad_semester === "Winter" && (
                        <div className={styles.semesterWinter}>
                          {student.expected_grad_semester}
                        </div>
                      )}
                    </td>
                    <td>{student.ta_available}</td>
                    <td>
                      {student.available && (
                        <div className={styles.semesterSpring}>Yes</div>
                      )}

                      {!student.available && (
                        <div className={styles.semesterFall}>No</div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <footer className={styles.footer}></footer>
        <Modal
          isOpen={isModalOpen}
          student={selectedStudent}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveStudent}
        />
      </div>
    </div>
  );
}
