// This component is used to import and export dtatabase elements to/from excel files
"use client";

import React, { useState } from "react";

import styles from "./styles/page.module.css";
import { Student } from "../data/studentListData";
import * as XLSX from "xlsx";
import ExcelJS, { Workbook } from "exceljs";
import axios from "axios";
import { Course } from "../data/courseListData";
import { Teacher } from "../data/teacherListData";
import { Spinner } from "react-bootstrap";
import { StudentQualification } from "../data/studentQualificationData";
import { StudentArea } from "../data/studentAreaData";
import { StudentTeacher } from "../data/studentTeacherData";
import { StudentCourse } from "../data/studentCourseData";

export default function ImportExport() {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isImportStudents, setIsImportStudents] = useState<boolean>(true);
  const [isImportCourses, setIsImportCourses] = useState<boolean>(true);
  const [isImportTeachers, setIsImportTeachers] = useState<boolean>(true);
  const [isImportStudentCourse, setIsImportStudentCourse] =
    useState<boolean>(true);
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsImporting(true);
    setSuccessMessage("");
    setErrorMessage("");
    // Open file from local drive.

    const file = e.target.files?.[0];

    if (!file) {
      throw new Error("No file detected.");
    }

    const reader = new FileReader();

    const errors: string[] = [];

    const validateCourse = (item: Course): boolean => {
      const validKeys = [
        "id",
        "hkust_identifier",
        "name",
        "description",
        "semester",
        "year",
        "field",
        "keywords",
        "ta_needed",
        "ta_assigned",
      ];

      // Check for missing required fields
      if (!item.hkust_identifier || !item.name) {
        errors.push("Error: Missing required fields for a course");
        return false;
      }

      // Check for invalid properties
      const courseKeys = Object.keys(item);
      for (const key of courseKeys) {
        if (!validKeys.includes(key)) {
          errors.push(
            `Error: Invalid property "${key}" found in course object.`
          );
          return false;
        }
      }
      return true;
    };

    const validateStudent = (item: Student): boolean => {
      const validKeys = [
        "id",
        "student_number",
        "l_name",
        "f_names",
        "unoff_name",
        "program",
        "email",
        "date_joined",
        "expected_grad_year",
        "expected_grad_semester",
        "ta_available",
        "available",
        "areas",
        "qualifs",
      ];

      // Check for missing required fields
      if (
        !item.l_name ||
        item.ta_available === undefined ||
        !item.expected_grad_year
      ) {
        errors.push("Error: Missing required fields for a student");
        return false;
      }

      // Check for invalid properties
      const studentKeys = Object.keys(item);
      for (const key of studentKeys) {
        if (!validKeys.includes(key)) {
          errors.push(
            `Error: Invalid property "${key}" found in student object.`
          );
          return false;
        }
      }
      return true;
    };

    const validateTeacher = (item: Teacher): boolean => {
      const validKeys = ["id", "l_name", "f_names", "unoff_name", "field"];

      // Check for missing required fields
      if (!item.l_name || !item.field) {
        errors.push("Error: Missing required fields for a teacher");
        return false;
      }

      // Check for invalid properties
      const courseKeys = Object.keys(item);
      for (const key of courseKeys) {
        if (!validKeys.includes(key)) {
          errors.push(
            `Error: Invalid property "${key}" found in teacher object.`
          );
          return false;
        }
      }
      return true;
    };

    const validateStudentCourse = (item: StudentCourse): boolean => {
      const validKeys = [
        "student_id",
        "l_name",
        "f_names",
        "course_id",
        "course_hkust_identifier",
        "course_name",
        "year",
        "semester",
      ];

      // Check for missing required fields
      if (!item.student_id) {
        errors.push("Error: Missing required student id for a student/course");
        return false;
      }
      if (!item.course_id) {
        errors.push("Error: Missing required course id for a student/course");
        return false;
      }
      if (!item.year) {
        errors.push("Error: Missing required year for a student/course");
        return false;
      }
      if (!item.semester) {
        errors.push("Error: Missing required semester for a student/course");
        return false;
      }

      // Check for invalid properties
      const courseKeys = Object.keys(item);
      for (const key of courseKeys) {
        if (!validKeys.includes(key)) {
          errors.push(
            `Error: Invalid property "${key}" found in teacher object.`
          );
          return false;
        }
      }
      return true;
    };

    reader.onload = async (event) => {
      if (event && event.target) {
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Course import

        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];
        const sheetDataCourse: Course[] = XLSX.utils.sheet_to_json(sheet);

        if (isImportCourses) {
          for (const item of sheetDataCourse) {
            console.log(item);

            // if id is present, update
            if (validateCourse(item)) {
              if (item.id && item.id > 0) {
                // check item properties, at least l_name, ta_available, and expected_grad_year have to be present

                // read record
                // if not found, error
                const fetchCourse = async (id: number) => {
                  try {
                    const response = await axios.get(`/api/course/${id}`);

                    return response.data;
                  } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                      // Gérer les erreurs d'axios
                      console.error("Axios Error:", error.message);
                    } else {
                      // Gérer les autres erreurs
                      console.error("Error:", error);
                    }

                    return false;
                  }
                };

                const fetchCourseResponse = await fetchCourse(item.id);
                if (fetchCourseResponse) {
                  updateCourse(item.id, item);
                } else {
                  errors.push(`Error: Course with id ${item.id} not found`);
                }
              } else {
                // if id not present, create
                createCourse(item);
              }
            } else {
              break;
            }
          }
        }
        // Student import
        sheetName = workbook.SheetNames[1];
        sheet = workbook.Sheets[sheetName];
        const sheetDataStudent: Student[] = XLSX.utils.sheet_to_json(sheet);

        if (isImportStudents) {
          for (const item of sheetDataStudent) {
            // if id is present, update
            if (validateStudent(item)) {
              if (item.id && item.id > 0) {
                // check item properties, at least l_name, ta_available, and expected_grad_year have to be present

                // read record
                // if not found, error
                const fetchStudent = async (id: number) => {
                  try {
                    const response = await axios.get(`/api/student/${id}`);

                    return response.data;
                  } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                      // Gérer les erreurs d'axios
                      console.error("Axios Error:", error.message);
                    } else {
                      // Gérer les autres erreurs
                      console.error("Error:", error);
                    }

                    return false;
                  }
                };

                const fetchStudentResponse = await fetchStudent(item.id);
                if (fetchStudentResponse) {
                  updateStudent(item.id, item);
                } else {
                  errors.push(`Error: Student with id ${item.id} not found`);
                }
              } else {
                console.log("student create");

                // if id not present, create
                createStudent(item);
              }
            } else {
              break;
            }
          }
        }

        // Teacher import
        sheetName = workbook.SheetNames[2];
        sheet = workbook.Sheets[sheetName];
        const sheetDataTeacher: Teacher[] = XLSX.utils.sheet_to_json(sheet);

        if (isImportTeachers) {
          for (const item of sheetDataTeacher) {
            console.log(item);

            // if id is present, update
            if (validateTeacher(item)) {
              if (item.id && item.id > 0) {
                // check item properties, at least l_name, ta_available, and expected_grad_year have to be present

                // read record
                // if not found, error
                const fetchTeacher = async (id: number) => {
                  try {
                    const response = await axios.get(`/api/teacher/${id}`);

                    return response.data;
                  } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                      // Gérer les erreurs d'axios
                      console.error("Axios Error:", error.message);
                    } else {
                      // Gérer les autres erreurs
                      console.error("Error:", error);
                    }

                    return false;
                  }
                };

                const fetchCourseResponse = await fetchTeacher(item.id);
                if (fetchCourseResponse) {
                  updateTeacher(item.id, item);
                } else {
                  errors.push(`Error: Course with id ${item.id} not found`);
                }
              } else {
                // if id not present, create
                createTeacher(item);
              }
            } else {
              break;
            }
          }
        }

        // StudentCourse import
        sheetName = workbook.SheetNames[3];
        sheet = workbook.Sheets[sheetName];
        const sheetDataStudentCourse: StudentCourse[] =
          XLSX.utils.sheet_to_json(sheet);

        if (isImportStudentCourse) {
          for (const item of sheetDataStudentCourse) {
            // if id is present, update
            if (validateStudentCourse(item)) {
              if (
                item.student_id &&
                item.student_id > 0 &&
                item.course_id &&
                item.course_id > 0
              ) {
                // check item properties, at least l_name, ta_available, and expected_grad_year have to be present

                // read record
                // if not found, error
                const fetchStudentCourse = async () => {
                  try {
                    const responseStudentCourse = await axios.get(
                      "/api/student_course/" +
                        item.student_id +
                        "/" +
                        item.course_id
                    );

                    return responseStudentCourse.data;
                  } catch (error: unknown) {
                    if (axios.isAxiosError(error)) {
                      // Gérer les erreurs d'axios
                      console.error("Axios Error:", error.message);
                    } else {
                      // Gérer les autres erreurs
                      console.error("Error:", error);
                    }
                  }
                };
                // Check if student exists

                const responseStudent = await axios.get(
                  `/api/student/${item.student_id}`
                );
                if (responseStudent.data) {
                  console.log("responseStudent.data", responseStudent.data);
                } else {
                  errors.push(`Error: student id not found`);
                  break;
                }

                // Check if course exists
                const responseCourse = await axios.get(
                  `/api/course/${item.course_id}`
                );
                if (responseCourse.data) {
                  //check if course exists for year/semester
                  if (
                    responseCourse.data.year != item.year ||
                    responseCourse.data.semester != item.semester
                  ) {
                    errors.push(`Error: course is not for this year/semester`);
                    break;
                  }
                } else {
                  errors.push(`Error: course id not found`);
                  break;
                }

                const fetchStudentCourseResponse = await fetchStudentCourse();
                if (fetchStudentCourseResponse) {
                  console.log(
                    "fetchStudentCourseResponse",
                    fetchStudentCourseResponse
                  );

                  // Check if student/course exists for year/semester

                  if (
                    fetchStudentCourseResponse.find(
                      (s: StudentCourse) =>
                        s.year === item.year && s.semester === item.semester
                    )
                  ) {
                    // record already exists, no need to create
                  } else {
                    // update record
                    createStudentCourse(item);
                  }
                } else {
                  // create new record in  studentCourse
                  createStudentCourse(item);
                }
              } else {
                errors.push(`Error: course id or student id not found`);
              }
            } else {
              break;
            }
          }
        }

        if (errors.length > 0) {
          setErrorMessage(errors.join("\n")); // Display all errors
        } else {
          setSuccessMessage("Imported successfully");
        }

        setIsImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const createStudent = async (studentData: Student) => {
    try {
      const response = await fetch("/api/student/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.error) {
        setErrorMessage(data.error);
      }

      return data; // Return the newly created student ID or object
    } catch (error) {
      console.error("Error adding student:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const createCourse = async (courseData: Course) => {
    try {
      console.log("create course, ", courseData);

      const response = await fetch("/api/course/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.error) {
        setErrorMessage(data.error);
      }

      return data; // Return the newly created course ID or object
    } catch (error) {
      console.error("Error adding course:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const createTeacher = async (teacherData: Teacher) => {
    try {
      const response = await fetch("/api/teacher/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.error) {
        setErrorMessage(data.error);
      }

      return data; // Return the newly created course ID or object
    } catch (error) {
      console.error("Error adding course:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const createStudentCourse = async (studentCourseData: StudentCourse) => {
    console.log("studentCourseData", studentCourseData);

    try {
      const response = await fetch("/api/student_course/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentCourseData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.error) {
        setErrorMessage(data.error);
      }

      return data; // Return the newly created course ID or object
    } catch (error) {
      console.error("Error adding course:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const updateStudent = async (id: number, updatedData: Student) => {
    try {
      const response = await axios.put(`/api/student/${id}`, updatedData);

      if (response.statusText != "OK") {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const updateCourse = async (id: number, updatedData: Course) => {
    try {
      const response = await axios.put(`/api/course/${id}`, updatedData);

      if (response.statusText != "OK") {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const updateTeacher = async (id: number, updatedData: Teacher) => {
    try {
      const response = await axios.put(`/api/teacher/${id}`, updatedData);
      if (response.statusText != "OK") {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
    }
  };

  async function handleExport(): Promise<void> {
    // Read DB, then export in Excel file

    const fetchStudents = async () => {
      const response = await axios.get("/api/student/all");

      return response.data;
    };

    const fetchCourses = async () => {
      const response = await axios.get("/api/course/all");

      return response.data;
    };

    const fetchTeachers = async () => {
      const response = await axios.get("/api/teacher/all");

      return response.data;
    };

    const fetchStudentAreas = async () => {
      const response = await axios.get("/api/student_area/all");

      return response.data;
    };

    const fetchStudentQualif = async () => {
      const response = await axios.get("/api/student_qualif/all");

      return response.data;
    };

    const fetchStudentTeacher = async () => {
      const response = await axios.get("/api/student_teacher/all");

      return response.data;
    };

    const fetchStudentCourses = async () => {
      const response = await axios.get("/api/student_course/allForImport");

      return response.data;
    };

    /*const fetchStudentCourses = async () => {
			const response = await axios.get("http://localhost:5000/student_course");

			return response.data;
		};

		// fetch student areas
		const fetchStudentAreas = async () => {
			const response = await axios.get("http://localhost:5000/student_areas");

			return response.data;
		};

		// fetch student qualification
		const fetchStudentQualifications = async () => {
			const response = await axios.get(
				"http://localhost:5000/student_qualifications"
			);

			return response.data;
		};

		// fetch course qualification
		const fetchCourseQualifications = async () => {
			const response = await axios.get(
				"http://localhost:5000/course_qualifications"
			);

			return response.data;
		};

		// fetch course areas
		const fetchCourseAreas = async () => {
			const response = await axios.get("http://localhost:5000/course_areas");

			return response.data;
		};*/

    const courses: Course[] = await fetchCourses();

    const students: Student[] = await fetchStudents();

    const teachers: Teacher[] = await fetchTeachers();

    const studentCourses = await fetchStudentCourses();

    const studentAreas = await fetchStudentAreas();

    const studentQualifications = await fetchStudentQualif();

    const studentTeachers = await fetchStudentTeacher();
    /*
				const studentAreas = await fetchStudentAreas();
		
				
		
				const courseQualifications = await fetchCourseQualifications();
		
				const courseAreas = await fetchCourseAreas();*/

    // put students in an Excel file in a tab, and courses in another tab
    const workbook = new ExcelJS.Workbook();

    createSheetCourse(workbook, courses);

    createSheetStudent(
      workbook,
      students,
      teachers,
      studentAreas,
      studentQualifications,
      studentTeachers
    );

    createSheetTeacher(workbook, teachers);

    createSheetStudentCourse(workbook, studentCourses);
    // Create a buffer and trigger download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Export.Student.Management.xlsx";
    link.click();
  }

  function createSheetCourse(workbook: Workbook, courses: Course[]) {
    const worksheet = workbook.addWorksheet("Courses");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 15 },
      { header: "hkust_identifier", key: "hkust_identifier", width: 30 },
      { header: "name", key: "name", width: 50 },
      { header: "description", key: "description", width: 50 },
      { header: "semester", key: "semester", width: 15 },
      { header: "year", key: "year", width: 10 },
      { header: "ta_needed", key: "ta_needed", width: 10 },
      { header: "field", key: "field", width: 10 },
      { header: "keywords", key: "keywords", width: 10 },
      // Add more columns as needed
    ];

    // Add content of courses into worksheet
    for (const item of courses) {
      worksheet.addRow({
        id: item.id,
        hkust_identifier: item.hkust_identifier,
        name: item.name,
        description: item.description,
        semester: item.semester != "0" ? item.semester : "Spring",
        year: item.year,
        ta_needed: item.ta_needed,
        field: item.field,
      });
    }

    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" }, // Light gray color
      };
      cell.font = { bold: true };
    });

    // add 100 empty rows to have control fields
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    const rows = worksheet.getRows(
      0,
      worksheet.lastRow?.number ? worksheet.lastRow?.number + 1 : 0
    );

    if (rows) {
      for (const row of rows) {
        if (row.number && row.number > 1) {
          row.getCell("A").dataValidation = {
            type: "whole",
            operator: "equal",
            allowBlank: true,
            showInputMessage: true,
            formulae: [999999999999999999999999],
            promptTitle: "ID",
            prompt:
              "Do not modify this. If empty, creation of a new record. If not, modification of an existing record. ",
            errorStyle: "error",
            errorTitle: "Year",
            error: "Do not modify this.",
            showErrorMessage: true,
          };

          row.getCell("E").dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Spring,Summer,Fall,Winter"'],
            errorStyle: "error",
            errorTitle: "Semester",
            error: "The value must be a semester",
            showErrorMessage: true,
          };

          row.getCell("F").dataValidation = {
            type: "decimal",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [2000, 3000],
            promptTitle: "Year",
            prompt: "The value must a number between 2000 and 3000",
            errorStyle: "error",
            errorTitle: "Year",
            error: "The value must be a year",
            showErrorMessage: true,
          };

          row.getCell("G").dataValidation = {
            type: "decimal",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [0, 10],
            promptTitle: "T.A. needed",
            prompt: "The value must a number between 0 and 10",
            errorStyle: "error",
            errorTitle: "T.A. needed",
            error: "TThe value must a number between 0 and 10",
            showErrorMessage: true,
          };
        }
      }
    }
  }

  function createSheetStudent(
    workbook: Workbook,
    students: Student[],
    teachers: Teacher[],
    studentAreas: StudentArea[],
    studentQualifications: StudentQualification[],
    studentTeachers: StudentTeacher[]
  ) {
    const worksheet = workbook.addWorksheet("Students");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 15 },
      { header: "student_number", key: "student_number", width: 30 },
      { header: "l_name", key: "l_name", width: 50 },
      { header: "f_names", key: "f_names", width: 50 },
      { header: "unoff_name", key: "unoff_name", width: 50 },
      { header: "program", key: "program", width: 30 },
      { header: "email", key: "email", width: 30 },
      { header: "date_joined", key: "date_joined", width: 50 },
      { header: "expected_grad_year", key: "expected_grad_year", width: 20 },
      {
        header: "expected_grad_semester",
        key: "expected_grad_semester",
        width: 20,
      },
      { header: "ta_available", key: "ta_available", width: 10 },
      { header: "available", key: "available", width: 10 },
      { header: "areas", key: "areas", width: 60 },
      { header: "qualifs", key: "qualifs", width: 60 },
      { header: "teachers", key: "teachers", width: 60 },
      // Add more columns as needed
    ];

    // Add content of courses into worksheet
    for (const item of students) {
      // get areas from student
      const areasForStudent = studentAreas
        .filter((area) => area.student_id === item.id)
        .map((area) => area.area);

      let areas = "";

      for (const area of areasForStudent) {
        areas += area + ",";
      }

      // get qualifs from student
      const qualifsForStudent = studentQualifications
        .filter((qualif) => qualif.student_id === item.id)
        .map((qualif) => qualif.qualification);

      let qualifs = "";

      for (const qualif of qualifsForStudent) {
        qualifs += qualif + ",";
      }

      // get teachers from student

      const teachersList: Teacher[] = [];

      for (const studentTeacher of studentTeachers) {
        if (studentTeacher.student_id === item.id) {
          const teacher = teachers.find(
            (teacher) => teacher.id === studentTeacher.teacher_id
          );

          if (teacher) {
            teachersList.push(
              teachers.find(
                (teacher) => teacher.id === studentTeacher.teacher_id
              ) as Teacher
            );
          }
        }
      }

      let teachersListString = "";

      for (const teacher of teachersList) {
        teachersListString += teacher.l_name + " " + teacher.f_names + ",";
      }

      worksheet.addRow({
        id: item.id,
        student_number: item.student_number,
        l_name: item.l_name,
        f_names: item.f_names,

        unoff_name: item.unoff_name,

        program: item.program,
        email: item.email,

        date_joined: item.date_joined,
        expected_grad_semester:
          item.expected_grad_semester != "0"
            ? item.expected_grad_semester
            : "Spring",
        expected_grad_year: item.expected_grad_year,
        ta_available: item.ta_available,
        available: item.available,
        areas: areas,
        qualifs: qualifs,
        teachers: teachersListString,
      });
    }

    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" }, // Light gray color
      };
      cell.font = { bold: true };
    });

    // add 100 empty rows to have control fields
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    const rows = worksheet.getRows(
      0,
      worksheet.lastRow?.number ? worksheet.lastRow?.number + 1 : 0
    );

    if (rows) {
      for (const row of rows) {
        if (row.number && row.number > 1) {
          row.getCell("A").dataValidation = {
            type: "whole",
            operator: "equal",
            allowBlank: true,
            showInputMessage: true,
            formulae: [999999999999999999999999],
            promptTitle: "ID",
            prompt:
              "Do not modify this. If empty, creation of a new record. If not, modification of an existing record. ",
            errorStyle: "error",
            errorTitle: "Year",
            error: "Do not modify this.",
            showErrorMessage: true,
          };

          row.getCell("F").dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"ISD PHD, ISD MPhil"'],
            errorStyle: "error",
            errorTitle: "Program",
            error: "The value must be a program",
            showErrorMessage: true,
          };

          row.getCell("I").dataValidation = {
            type: "decimal",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [2000, 3000],
            promptTitle: "Year",
            prompt: "The value must a number between 2000 and 3000",
            errorStyle: "error",
            errorTitle: "Year",
            error: "The value must be a year",
            showErrorMessage: true,
          };

          row.getCell("J").dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Spring,Summer,Fall,Winter"'],
            errorStyle: "error",
            errorTitle: "Semester",
            error: "The value must be a semester",
            showErrorMessage: true,
          };

          row.getCell("K").dataValidation = {
            type: "whole",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [0, 10],
            promptTitle: "T.A. available",
            prompt: "The value must a number between 0 and 10",
            errorStyle: "error",
            errorTitle: "T.A. available",
            error: "The value must a number between 0 and 10",
            showErrorMessage: true,
          };

          row.getCell("L").dataValidation = {
            type: "whole",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [0, 1],
            promptTitle: "Available",
            prompt: "The value must a 0 or 1",
            errorStyle: "error",
            errorTitle: "Available",
            error: "The value must a 0 or 1",
            showErrorMessage: true,
          };

          row.getCell("M").dataValidation = {
            type: "whole",
            operator: "equal",
            allowBlank: true,
            showInputMessage: true,
            formulae: [999999999999999999999999],
            promptTitle: "ID",
            prompt: "Can not be modified. Please modify in app.",
            errorStyle: "error",
            errorTitle: "Year",
            error: "Can not be modified.",
            showErrorMessage: true,
          };

          row.getCell("N").dataValidation = {
            type: "whole",
            operator: "equal",
            allowBlank: true,
            showInputMessage: true,
            formulae: [999999999999999999999999],
            promptTitle: "ID",
            prompt: "Can not be modified. Please modify in app.",
            errorStyle: "error",
            errorTitle: "Year",
            error: "Can not be modified.",
            showErrorMessage: true,
          };

          row.getCell("O").dataValidation = {
            type: "whole",
            operator: "equal",
            allowBlank: true,
            showInputMessage: true,
            formulae: [999999999999999999999999],
            promptTitle: "ID",
            prompt: "Can not be modified. Please modify in app.",
            errorStyle: "error",
            errorTitle: "Year",
            error: "Can not be modified.",
            showErrorMessage: true,
          };
        }
      }
    }
  }

  function createSheetTeacher(workbook: Workbook, teachers: Teacher[]) {
    const worksheet = workbook.addWorksheet("Teachers");

    // Define columns
    worksheet.columns = [
      { header: "id", key: "id", width: 15 },

      { header: "l_name", key: "l_name", width: 50 },
      { header: "f_names", key: "f_names", width: 50 },
      { header: "unoff_name", key: "unoff_name", width: 50 },
      { header: "field", key: "field", width: 30 },

      // Add more columns as needed
    ];

    // Add content of courses into worksheet
    for (const item of teachers) {
      worksheet.addRow({
        id: item.id,
        l_name: item.l_name,
        f_names: item.f_names,

        unoff_name: item.unoff_name,

        field: item.field,
      });
    }

    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" }, // Light gray color
      };
      cell.font = { bold: true };
    });

    // add 100 empty rows to have control fields
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    const rows = worksheet.getRows(
      0,
      worksheet.lastRow?.number ? worksheet.lastRow?.number + 1 : 0
    );

    if (rows) {
      for (const row of rows) {
        if (row.number && row.number > 1) {
          row.getCell("A").dataValidation = {
            type: "whole",
            operator: "equal",
            allowBlank: true,
            showInputMessage: true,
            formulae: [999999999999999999999999],
            promptTitle: "ID",
            prompt:
              "Do not modify this. If empty, creation of a new record. If not, modification of an existing record. ",
            errorStyle: "error",
            errorTitle: "Year",
            error: "Do not modify this.",
            showErrorMessage: true,
          };
        }
      }
    }
  }

  function createSheetStudentCourse(
    workbook: Workbook,
    studentCourses: {
      student_id: number;
      l_name: string;
      f_names: string;
      course_id: number;
      hkust_identifier: string;
      name: string;
      year: number;
      semester: string;
    }[]
  ) {
    const worksheet = workbook.addWorksheet("StudentCourses");

    // Define columns
    worksheet.columns = [
      { header: "student_id", key: "student_id", width: 20 },
      { header: "l_name", key: "l_name", width: 50 },
      { header: "f_names", key: "f_names", width: 50 },
      { header: "course_id", key: "course_id", width: 20 },
      { header: "course_hkust_identifier", key: "hkust_identifier", width: 30 },
      { header: "course_name", key: "name", width: 30 },
      { header: "year", key: "year", width: 20 },
      { header: "semester", key: "semester", width: 50 },

      // Add more columns as needed
    ];

    // get student and courses

    // Add content of courses into worksheet
    for (const item of studentCourses) {
      worksheet.addRow({
        student_id: item.student_id,
        l_name: item.l_name,
        f_names: item.f_names,
        course_id: item.course_id,
        hkust_identifier: item.hkust_identifier,
        name: item.name,
        year: item.year,
        semester: item.semester,
      });
    }

    const headerRow = worksheet.getRow(1);

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" }, // Light gray color
      };
      cell.font = { bold: true };
    });

    // add 100 empty rows to have control fields
    for (let i = 0; i < 100; i++) {
      worksheet.addRow({});
    }

    const rows = worksheet.getRows(
      0,
      worksheet.lastRow?.number ? worksheet.lastRow?.number + 1 : 0
    );

    if (rows) {
      for (const row of rows) {
        if (row.number && row.number > 1) {
          row.getCell("A").dataValidation = {
            type: "whole",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [0, 999999],
            promptTitle: "ID",
            prompt: "Student ID, use same as the one in Students tab. ",
            errorStyle: "error",
            errorTitle: "Student ID",
            error: "Enter a number.",
            showErrorMessage: true,
          };

          row.getCell("B").dataValidation = {
            type: "textLength",
            operator: "notEqual",
            allowBlank: true,
            showInputMessage: true,
            formulae: ["xxxxxxxxxxxxxxxxx"],
            promptTitle: "Name",
            prompt: "Names not needed, will be entered automatically.",
            errorStyle: "error",
            errorTitle: "Name",
            error: "Not needed.",
            showErrorMessage: true,
          };

          row.getCell("C").dataValidation = {
            type: "textLength",
            operator: "notEqual",
            allowBlank: true,
            showInputMessage: true,
            formulae: ["xxxxxxxxxxxxxxxxx"],
            promptTitle: "Name",
            prompt: "Names not needed, will be entered automatically.",
            errorStyle: "error",
            errorTitle: "Name",
            error: "Not needed.",
            showErrorMessage: true,
          };

          row.getCell("D").dataValidation = {
            type: "whole",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [0, 999999],
            promptTitle: "ID",
            prompt: "Course ID, use same as the one in Courses tab. ",
            errorStyle: "error",
            errorTitle: "Student ID",
            error: "Enter a number.",
            showErrorMessage: true,
          };

          row.getCell("E").dataValidation = {
            type: "textLength",
            operator: "notEqual",
            allowBlank: true,
            showInputMessage: true,
            formulae: ["xxxxxxxxxxxxxxxxx"],
            promptTitle: "Name",
            prompt: "Names not needed, will be entered automatically.",
            errorStyle: "error",
            errorTitle: "Name",
            error: "Not needed.",
            showErrorMessage: true,
          };

          row.getCell("F").dataValidation = {
            type: "textLength",
            operator: "notEqual",
            allowBlank: true,
            showInputMessage: true,
            formulae: ["xxxxxxxxxxxxxxxxx"],
            promptTitle: "Name",
            prompt: "Names not needed, will be entered automatically.",
            errorStyle: "error",
            errorTitle: "Name",
            error: "Not needed.",
            showErrorMessage: true,
          };

          row.getCell("G").dataValidation = {
            type: "decimal",
            operator: "between",
            allowBlank: true,
            showInputMessage: true,
            formulae: [2000, 3000],
            promptTitle: "Year",
            prompt: "The value must a number between 2000 and 3000",
            errorStyle: "error",
            errorTitle: "Year",
            error: "The value must be a year",
            showErrorMessage: true,
          };

          row.getCell("H").dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: ['"Spring,Summer,Fall,Winter"'],
            errorStyle: "error",
            errorTitle: "Semester",
            error: "The value must be a semester",
            showErrorMessage: true,
          };
        }
      }
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <div className={styles.importExport}>
          <div className={styles.text}>
            Import
            <input type="file" onChange={handleImport} />
          </div>
          {isImporting && <Spinner />}
        </div>
        <div className={styles.importExport} onClick={() => handleExport()}>
          <div className={styles.text}>Export</div>
        </div>
      </div>
      <div>
        {!isImportStudents ? (
          <div
            className={styles.buttonUnclicked}
            onClick={() => setIsImportStudents(!isImportStudents)}
          >
            Students
          </div>
        ) : (
          <div
            className={styles.buttonClicked}
            onClick={() => setIsImportStudents(!isImportStudents)}
          >
            Students
          </div>
        )}
        {!isImportCourses ? (
          <div
            className={styles.buttonUnclicked}
            onClick={() => setIsImportCourses(!isImportCourses)}
          >
            Courses
          </div>
        ) : (
          <div
            className={styles.buttonClicked}
            onClick={() => setIsImportCourses(!isImportCourses)}
          >
            Courses
          </div>
        )}
        {!isImportTeachers ? (
          <div
            className={styles.buttonUnclicked}
            onClick={() => setIsImportTeachers(!isImportTeachers)}
          >
            Teachers
          </div>
        ) : (
          <div
            className={styles.buttonClicked}
            onClick={() => setIsImportTeachers(!isImportTeachers)}
          >
            Teachers
          </div>
        )}

        {!isImportStudentCourse ? (
          <div
            className={styles.buttonUnclicked}
            onClick={() => setIsImportStudentCourse(!isImportStudentCourse)}
          >
            Match Students/courses
          </div>
        ) : (
          <div
            className={styles.buttonClicked}
            onClick={() => setIsImportStudentCourse(!isImportStudentCourse)}
          >
            Match Students/courses
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        {errorMessage && errorMessage.length > 0 && (
          <div className={styles.error}>{errorMessage} </div>
        )}
        {successMessage && successMessage.length > 0 && (
          <div className={styles.success}>{successMessage} </div>
        )}
      </footer>
      v1.6
    </div>
  );
}
