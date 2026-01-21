// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Course } from "../data/courseListData";
import axios from "axios";
import {
  AREAS,
  MODE_CREATION,
  MODE_DELETE,
  MODE_EDITION,
  QUALIFICATIONS,
} from "../constants";
import { Teacher } from "../data/teacherListData";

interface ModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSave: (updatedCourse: Course) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, course, onClose, onSave }) => {
  const [formData, setFormData] = useState<Course | null>(course);
  const [mode, setMode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [areas, setAreas] = useState<string[]>();
  const [qualifications, setQualifications] = useState<string[]>();
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedQualification, setSelectedQualification] =
    useState<string>("");

  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher>();

  useEffect(() => {
    const fetchTeachersList = async () => {
      const response = await axios.get("/api/teacher/all/");

      setTeachersList(response.data);
    };

    fetchTeachersList();

    if (course) {
      setMode(MODE_EDITION);
      setFormData(course);

      const fetchAreas = async () => {
        try {
          if (course) {
            const response = await axios.get(`/api/course_area/${course.id}`);

            console.log(response.data);

            for (let i = 0; i < response.data.length; i++) {
              response.data[i] = response.data[i].area;
            }

            setAreas(response.data);
            return response.data;
          }
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

      fetchAreas();

      const fetchQualifications = async () => {
        try {
          if (course) {
            const response = await axios.get(`/api/course_qualif/${course.id}`);

            console.log(response.data);

            for (let i = 0; i < response.data.length; i++) {
              response.data[i] = response.data[i].qualification;
            }

            setQualifications(response.data);
            return response.data;
          }
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

      fetchQualifications();

      const fetchTeachers = async () => {
        try {
          if (course != null) {
            const response = await axios.get(
              `/api/course_teacher/${course.id}`,
            );

            const teachers: Teacher[] = [];

            for (const courseTeacher of response.data) {
              // get record from teachersList where courseTeacher.teacher_id matches id
              teachers.push(
                teachersList.find(
                  (teacher) => teacher.id === courseTeacher.teacher_id,
                ) as Teacher,
              );
            }

            setTeachers(teachers);
            return response.data;
          } else {
            return null;
          }
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
      fetchTeachers();
    } else {
      // We are in creation mode

      // get current year
      let currentYear = new Date().getFullYear();

      // get current semester + 1
      // if between february and august, it is spring
      let semester = "Spring";
      if (new Date().getMonth() >= 1 && new Date().getMonth() <= 7) {
        // current semester is spring, assign students for fall
        semester = "Fall";
      } else if (new Date().getMonth() >= 8 && new Date().getMonth() <= 10) {
        // current semester is fall, assign students for winter
        semester = "Winter";
      } else {
        // current semester is winter, assign students for spring of next year
        semester = "Spring";

        currentYear++;
      }

      setFormData({
        id: 0,
        hkust_identifier: "",
        name: "",
        description: "",

        semester: semester,
        year: currentYear,
        ta_needed: 0,
        ta_assigned: 0,
        areas: [],
        qualifications: [],
        deleted: false,
        field: "",
      });
      setAreas([]);
      setQualifications([]);
      setTeachers([]);
      setMode(MODE_CREATION);
    }
  }, [course]); // Add course to the dependency array

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;

    if (formData) {
      setFormData({ ...formData, [name]: value });
    }
  };

  const createCourse = async (courseData: Course) => {
    console.log("courseData", courseData);

    try {
      let response = await fetch("/api/course/create", {
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
      console.log("Course added:", data);

      courseData.id = data.id;

      // Delete all areas for course first
      response = await fetch(`/api/course_area/${data.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Add areas
      if (areas && areas.length > 0) {
        areas.forEach(async (area) => {
          const courseArea = {
            course_id: data.id,
            area: area,
          };
          response = await fetch("/api/course_area/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseArea),
          });
        });
      }

      // Add qualifs
      if (qualifications && qualifications.length > 0) {
        qualifications.forEach(async (qualification) => {
          const courseQualification = {
            courseId: data.id,
            qualification: qualification,
          };
          response = await fetch("/api/course_qualif/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseQualification),
          });
        });
      }

      // Add teachers
      if (teachers && teachers.length > 0) {
        teachers.forEach(async (teacher) => {
          const courseTeacher = {
            courseId: data.id,
            teacherId: teacher.id,
          };
          response = await fetch("/api/course_teacher/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseTeacher),
          });
        });
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return courseData; // Return the newly created course ID or object
    } catch (error) {
      console.error("Error adding course:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const updateCourse = async (id: number, updatedData: Course) => {
    console.log("id", id);
    console.log("updatedData", updatedData);

    try {
      await axios.put(`api/course/${id}`, updatedData);

      // Delete all areas for course first
      let responseCourse = await fetch(`/api/course_area/${id}`, {
        method: "DELETE",
      });

      if (!responseCourse.ok) {
        throw new Error("Network response was not ok");
      }

      // Delete all qualifs for course first
      responseCourse = await fetch(`/api/course_qualif/${id}`, {
        method: "DELETE",
      });

      if (!responseCourse.ok) {
        throw new Error("Network response was not ok");
      }

      // Delete all teachers for course first
      responseCourse = await fetch(`/api/course_teacher/${id}`, {
        method: "DELETE",
      });

      if (!responseCourse.ok) {
        throw new Error("Network response was not ok");
      }

      // Add areas
      if (areas && areas.length > 0) {
        areas.forEach(async (area) => {
          const courseArea = {
            course_id: id,
            area: area,
          };
          responseCourse = await fetch("/api/course_area/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseArea),
          });
        });
      }

      // Add qualifs
      if (qualifications && qualifications.length > 0) {
        qualifications.forEach(async (qualification) => {
          const courseArea = {
            course_id: id,
            qualification: qualification,
          };
          responseCourse = await fetch("/api/course_qualif/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseArea),
          });
        });
      }

      // Add teachers
      if (teachers && teachers.length > 0) {
        teachers.forEach(async (teacher) => {
          const courseTeacher = {
            course_id: id,
            teacher_id: teacher.id,
          };
          responseCourse = await fetch("/api/course_teacher/create", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(courseTeacher),
          });
        });
      }
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      let response = await fetch(`/api/course/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Delete all areas for course first
      response = await fetch(`/api/course_area/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Delete all qualifs for course first
      response = await fetch(`/api/course_qualif/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      // Delete all teachers for course first
      response = await fetch(`/api/course_teacher/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Course deleted:", data);
      return data; // Return the deleted course ID or any other info
    } catch (error) {
      console.error("Error deleting course:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const handleCancel = () => {
    setErrorMessage("");
    onClose();
  };

  const handleDelete = () => {
    setMode(MODE_DELETE);

    setErrorMessage("");
    onClose();
    if (course) {
      deleteCourse(course.id);

      course.deleted = true;

      onSave(course);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    setErrorMessage("");

    e.preventDefault();
    if (formData) {
      if (
        !formData.hkust_identifier ||
        formData.hkust_identifier.length === 0 ||
        !formData.name ||
        formData.name.length === 0
      ) {
        setErrorMessage("Please enter an identifier and a name");
        return;
      }

      // check if ta_available is number
      if (isNaN(Number(formData.ta_needed))) {
        setErrorMessage("T.A. available must be a number");
        return;
      }

      if (formData.ta_needed < 0) {
        setErrorMessage("T.A. available must be a positive number");
        return;
      }

      if (formData.year <= 0) {
        console.log(formData.year);

        setErrorMessage("Year must be a positive number");
        return;
      }

      if (mode === MODE_CREATION) {
        createCourse(formData).then((newCourse) => {
          // Update the state with the new course
          formData.id = newCourse.id;

          onSave(formData);
        });
      } else {
        if (mode === MODE_DELETE) {
          formData.deleted = true;
        } else {
          console.log("formData", formData);
          updateCourse(formData.id, formData);
        }
        onSave(formData);
      }
    } else {
      setErrorMessage("Error");
      return;
    }

    setFormData({
      id: 0,
      hkust_identifier: "",
      name: "",
      description: "",
      field: "",

      semester: "Spring",
      year: 0,
      ta_needed: 0,
      ta_assigned: 0,
      deleted: false,
      areas: [],
      qualifications: [],
    });
    course = {
      id: 0,
      hkust_identifier: "",
      name: "",
      description: "",
      field: "",

      semester: "Spring",
      year: 0,
      ta_needed: 0,
      ta_assigned: 0,
      deleted: false,
      areas: [],
      qualifications: [],
    };
    onClose();
  };

  if (!isOpen) return null;

  function addArea(): void {
    // get the currently selected area and add it to the areas array
    //in the formData

    setErrorMessage("");

    // the currently selected area is in the select whose idea is "area"

    console.log(selectedArea);
    if (selectedArea === "") {
      setErrorMessage("Please select an area");
      return;
    }
    if (areas && areas.includes(selectedArea)) {
      setErrorMessage("Area already added");
      return;
    }

    if (areas) {
      setAreas([...areas, selectedArea]);
    } else {
      setAreas([selectedArea]);
    }
  }

  function addTeacher(): void {
    // get the currently selected area and add it to the areas array
    //in the formData

    setErrorMessage("");

    // the currently selected area is in the select whose idea is "area"

    if (!selectedTeacher || selectedTeacher?.id === 0) {
      setErrorMessage("Please select a qualification");
      return;
    }

    // check if teachers contains an object where id = teacher.id
    teachers.forEach((teacher) => {
      if (teacher.id === selectedTeacher.id) {
        setErrorMessage("Teacher already added");
        return;
      }
    });

    if (areas) {
      setTeachers([...teachers, selectedTeacher]);
    } else {
      setTeachers([selectedTeacher]);
    }
  }

  function addQualification(): void {
    // get the currently selected area and add it to the areas array
    //in the formData

    setErrorMessage("");

    // the currently selected area is in the select whose idea is "area"

    console.log(selectedQualification);
    if (selectedQualification === "") {
      setErrorMessage("Please select a qualification");
      return;
    }
    if (qualifications && qualifications.includes(selectedQualification)) {
      setErrorMessage("Qualification already added");
      return;
    }

    if (qualifications) {
      setQualifications([...qualifications, selectedQualification]);
    } else {
      setQualifications([selectedQualification]);
    }
  }

  const handleChangeTeacher = async (teacherId: number) => {
    const response = await axios.get(`/api/teacher/${teacherId}`);

    setSelectedTeacher(response.data);
  };

  return (
    <div className={styles.modal}>
      <span className={styles.close} onClick={onClose}>
        &times;
      </span>

      <form onSubmit={handleSubmit} className={styles.modalContent}>
        {mode === MODE_EDITION ? <h2>Edit Course</h2> : <h2>Add Course</h2>}

        <h5>Basic information</h5>
        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>Course code</div>
          <input
            name="hkust_identifier"
            value={formData ? formData.hkust_identifier : ""}
            onChange={handleChange}
            placeholder="Identifier"
            className={styles.input}
          />
          <div className={styles.inputTitle}>Course name</div>
          <input
            name="name"
            value={formData ? formData.name : ""}
            onChange={handleChange}
            placeholder="Name"
            className={styles.input}
          />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>Description</div>
          <input
            name="description"
            value={formData ? formData.description : ""}
            onChange={handleChange}
            placeholder="Description"
            className={styles.input}
          />
        </div>

        <h5>Course details</h5>
        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>Year</div>
          {mode === MODE_EDITION ? (
            <input
              name="year"
              value={formData?.year ? formData.year : new Date().getFullYear()}
              onChange={handleChange}
              placeholder="Year"
              type="number"
              disabled
              className={styles.input}
            />
          ) : (
            <input
              name="year"
              value={formData?.year ? formData.year : new Date().getFullYear()}
              onChange={handleChange}
              placeholder="Year"
              type="number"
            />
          )}
          <div className={styles.inputTitle}>Semester</div>
          {mode === MODE_EDITION ? (
            <select
              name="semester"
              onChange={handleChange}
              value={formData?.semester ? formData.semester : "Spring"}
              disabled
              className={styles.smallSelect}
            >
              <option value="Spring">Spring</option>

              <option value="Summer">Summer</option>

              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          ) : (
            <select
              name="semester"
              onChange={handleChange}
              value={formData?.semester ? formData.semester : "Spring"}
              className={styles.smallSelect}
            >
              <option value="Spring">Spring</option>

              <option value="Summer">Summer</option>

              <option value="Fall">Fall</option>
              <option value="Winter">Winter</option>
            </select>
          )}
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>T.A. needed</div>

          <input
            name="ta_needed"
            value={formData ? formData.ta_needed : ""}
            onChange={handleChange}
            placeholder="Number of T.A. needed"
            type="number"
            className={styles.input}
          />
        </div>

        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>Areas</div>

          <div className={styles.selectContainer}>
            <select
              id="areas"
              onChange={(e) => setSelectedArea(e.target.value)}
              className={styles.select}
            >
              <option key="" value="">
                -- Choose an area --
              </option>

              {AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.add} onClick={() => addArea()}>
            +{" "}
          </div>
        </div>
        {areas && areas.length > 0 && (
          <div>
            {areas.map((area) => (
              <div key={area} className={styles.areaQualifContainer}>
                <div className={styles.smalltext}>{area}</div>
                <div
                  className={styles.remove}
                  onClick={() => {
                    setAreas(areas.filter((a) => a !== area));
                    areas.filter((a) => a !== area);
                  }}
                >
                  x
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>Qualifications</div>

          <div className={styles.selectContainer}>
            <select
              id="qualifications"
              onChange={(e) => setSelectedQualification(e.target.value)}
              className={styles.select}
            >
              <option key="" value="">
                -- Choose a qualification --
              </option>

              {QUALIFICATIONS.map((qualification) => (
                <option key={qualification} value={qualification}>
                  {qualification}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.add} onClick={() => addQualification()}>
            +{" "}
          </div>
        </div>
        {qualifications && qualifications.length > 0 && (
          <div>
            {qualifications.map((qualification) => (
              <div
                className={styles.areaQualifContainer}
                key={qualification}
                onClick={() => {
                  setQualifications(
                    qualifications.filter((a) => a !== qualification),
                  );
                  qualifications.filter((a) => a !== qualification);
                }}
              >
                <div className={styles.smalltext}>{qualification}</div>
                <div
                  className={styles.remove}
                  onClick={() => {
                    setQualifications(
                      qualifications.filter((a) => a !== qualification),
                    );
                    qualifications.filter((a) => a !== qualification);
                  }}
                >
                  x
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.inputContainer}>
          <div className={styles.inputTitle}>Teachers</div>

          <div className={styles.selectContainer}>
            <select
              id="teachers"
              onChange={(e) => handleChangeTeacher(Number(e.target.value))}
              className={styles.select}
            >
              <option key="" value="">
                -- Choose a teacher --
              </option>

              {teachersList.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.l_name + " " + teacher.f_names}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.add} onClick={() => addTeacher()}>
            +{" "}
          </div>
        </div>
        {teachers && teachers.length > 0 && (
          <div>
            {teachers.map((teacher) => (
              <div
                className={styles.areaQualifContainer}
                key={teacher.id}
                onClick={() => {
                  setTeachers(teachers.filter((a) => a !== teacher));
                  teachers.filter((a) => a !== teacher);
                }}
              >
                <div className={styles.smalltext}>
                  {teacher && teacher.l_name + " " + teacher.f_names}
                </div>
                <div
                  className={styles.remove}
                  onClick={() => {
                    setTeachers(teachers.filter((a) => a !== teacher));
                    teachers.filter((a) => a !== teacher);
                  }}
                >
                  x
                </div>
              </div>
            ))}
          </div>
        )}

        {errorMessage.length > 0 && (
          <div className={styles.error}>{errorMessage}</div>
        )}
        <div className={styles.buttonContainer}>
          <button
            className={styles.buttonCancel}
            onClick={() => handleCancel()}
          >
            Cancel
          </button>
          {mode === MODE_EDITION && (
            <button
              className={styles.buttonDelete}
              onClick={() => handleDelete()}
            >
              Delete
            </button>
          )}
          <button className={styles.buttonSave} type="submit">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default Modal;
