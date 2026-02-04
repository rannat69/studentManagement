// Modal.tsx
import { useEffect, useState } from "react";
import styles from "./styles/modal.module.css";
import { Teacher } from "../data/teacherListData";
import axios from "axios";
import { MODE_CREATION, MODE_DELETE, MODE_EDITION } from "../constants";

interface ModalProps {
  isOpen: boolean;
  teacher: Teacher | null;
  onClose: () => void;
  onSave: (updatedTeacher: Teacher) => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, teacher, onClose, onSave }) => {
  const [formData, setFormData] = useState<Teacher>({
    id: 0, // ou une autre valeur par défaut
    l_name: "",
    f_names: "",
    unoff_name: "",
    field: "",
    deleted: false,
  });
  const [mode, setMode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (teacher) {
      setMode(MODE_EDITION);
      setFormData(teacher);
    } else {
      // We are in creation mode

      setFormData({
        id: 0,
        l_name: "",
        f_names: "",
        unoff_name: "",
        field: "",
        deleted: false,
      });
      setMode(MODE_CREATION);
    }
  }, [teacher]); // Add teacher to the dependency array

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, type, value } = e.target;

    console.log("type", type);

    setFormData((prevFormData) => {
      const updatedData = {
        ...prevFormData,
        [name]: value,
      };

      // Assurez-vous que id est défini
      if (updatedData.id === undefined) {
        updatedData.id = 0; // ou une autre valeur par défaut
      }

      return updatedData;
    });
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

      return data; // Return the newly created teacher ID or object
    } catch (error) {
      console.error("Error adding teacher:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const updateTeacher = async (id: number, updatedData: Teacher) => {
    try {
      await axios.put(`/api/teacher/${id}`, updatedData);
    } catch (error) {
      console.error("Error updating teacher:", error);
    }
  };

  const deleteTeacher = async (id: number) => {
    try {
      const response = await fetch(`/api/teacher/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Teacher deleted:", data);
      return data; // Return the deleted teacher ID or any other info
    } catch (error) {
      console.error("Error deleting teacher:", error);
      throw error; // Rethrow the error for handling in the caller
    }
  };

  const handleCancel = () => {
    setErrorMessage("");

    setFormData({
      id: 0,
      l_name: "",
      f_names: "",
      unoff_name: "",
      field: "",
      deleted: false,
    });

    onClose();
  };

  const handleDelete = () => {
    if (teacher) {
      setMode(MODE_DELETE);

      setErrorMessage("");
      onClose();
      deleteTeacher(teacher.id);

      teacher.deleted = true;

      setFormData({
        id: 0,
        l_name: "",
        f_names: "",
        unoff_name: "",
        field: "",
        deleted: false,
      });

      onSave(teacher);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    setErrorMessage("");

    if (formData) {
      e.preventDefault();

      if (!formData.l_name || formData.l_name.length === 0) {
        setErrorMessage("Please enter a surname");
        return;
      }

      if (!formData.field || formData.field.length === 0) {
        setErrorMessage("Please enter a field");
        return;
      }

      if (mode === MODE_CREATION) {
        createTeacher(formData).then((newTeacher) => {
          // Update the state with the new teacher
          formData.id = newTeacher.id;

          onSave(formData);
        });
      } else {
        if (mode === MODE_DELETE) {
          formData.deleted = true;
        } else {
          updateTeacher(formData.id, formData);
        }
        onSave(formData);
      }

      setFormData({
        id: 0,
        l_name: "",
        f_names: "",
        unoff_name: "",
        field: "",
        deleted: false,
      });

      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <span className={styles.close} onClick={onClose}>
        &times;
      </span>

      <form onSubmit={handleSubmit} className={styles.modalContent}>
        <div className={styles.modalContentColumn}>
          {mode === MODE_EDITION ? <h2>Edit Teacher</h2> : <h2>Add Teacher</h2>}

          <h5>Personal</h5>
          <div className={styles.inputContainer}>
            <div className={styles.inputTitle}>Surname</div>
            <input
              name="l_name"
              value={formData ? formData.l_name : ""}
              onChange={handleChange}
              placeholder="Surname"
              className={styles.input}
            />
            <div className={styles.inputTitle}>Given name</div>
            <input
              name="f_names"
              value={formData ? formData.f_names : ""}
              onChange={handleChange}
              placeholder="Other names"
              className={styles.input}
            />
          </div>
          <div className={styles.inputContainer}>
            <div className={styles.inputTitle}>Nickname</div>
            <input
              name="unoff_name"
              value={formData ? formData.unoff_name : ""}
              onChange={handleChange}
              placeholder="Unofficial name"
              className={styles.input}
            />
          </div>
          <div className={styles.inputTitle}>Field</div>
          <input
            name="field"
            value={formData ? formData.field : ""}
            onChange={handleChange}
            placeholder="Field"
            className={styles.input}
          />
        </div>

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
