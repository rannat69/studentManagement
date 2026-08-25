import { useEffect, useState } from "react";

import * as XLSX from "xlsx";
import ExcelJS, { Workbook } from "exceljs";

import styles from "./styles.module.css";

type PromptAI = string;

export default function CVAdmin({
  promptAI,
  setPromptAI,
}: {
  promptAI: PromptAI;
  setPromptAI: React.Dispatch<React.SetStateAction<PromptAI>>;
}) {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/cv/readStudents")
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      });
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIsImporting(true);
    setSuccessMessage("");
    setErrorMessage("");

    const file = e.target.files?.[0];

    if (!file) {
      setErrorMessage("No file detected.");
      setIsImporting(false);
      return;
    }

    try {
      // Convert file to ArrayBuffer using Promise
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetDataStudent: any[] = XLSX.utils.sheet_to_json(sheet);

      const dataStudents: { name: string; email: string }[] = [];
      const errors: string[] = [];

      const validateStudent = (item: any): boolean => {
        const validKeys = ["name", "email"];

        // 1. Check required fields
        if (!item.name || !item.email) {
          errors.push("Error: Missing 'name' or 'email' field.");
          return false;
        }

        // 2. Check for unexpected columns/keys
        const studentKeys = Object.keys(item);
        for (const key of studentKeys) {
          if (!validKeys.includes(key)) {
            errors.push(`Error: Invalid property "${key}" found.`);
            return false;
          }
        }

        return true;
      };

      // Filter and collect valid entries
      for (const item of sheetDataStudent) {
        if (validateStudent(item)) {
          dataStudents.push({
            name: String(item.name).trim(),
            email: String(item.email).trim(),
          });
        }
      }

      if (dataStudents.length === 0) {
        setErrorMessage(
          errors.length > 0
            ? errors[0]
            : "No valid students found in the file.",
        );
        return;
      }

      // Send POST request with JSON Content-Type
      const response = await fetch("/api/cv/uploadStudents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataStudents),
      });

      console.log("Response status:", response.status);
      console.log("Response :", response);
      if (!response.ok) {
        throw new Error("Failed to upload data to the server.");
      }

      setSuccessMessage(
        `Successfully imported ${dataStudents.length} students.`,
      );
    } catch (err: any) {
      console.error("Import error:", err);
      setErrorMessage(err.message || "An error occurred while importing.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className={styles.adminCard}>
      <h1 className={styles.adminTitle}>
        <span className={styles.titleIcon}>⚙️</span>
        CV Admin Page
      </h1>

      {/* Upload Student List */}
      <div className={styles.uploadRow}>
        <label htmlFor="file-input" className={styles.uploadLabel}>
          Upload student list
        </label>
        <input
          type="file"
          id="file-input"
          className={styles.uploadInput}
          onChange={handleFileChange}
        />
      </div>

      {/* Status Messages */}
      {errorMessage && (
        <div className={`${styles.messageBox} ${styles.errorBox}`}>
          ⚠️ {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className={`${styles.messageBox} ${styles.successBox}`}>
          ✅ {successMessage}
        </div>
      )}
      {isImporting && (
        <div className={styles.importingRow}>
          <span className={styles.dot}></span>
          <span>Importing…</span>
        </div>
      )}

      {/* Students List Table */}
      {students.length > 0 && (
        <div className={styles.tableContainer}>
          <table className={styles.studentsTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>CV uploaded</th>
                <th>Areas</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index}>
                  <td>{student.name}</td>
                  <td>{student.email}</td>{" "}
                  <td>{student.uploaded ? "Yes" : "No"}</td>
                  <td>{student.areas?.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {students.length === 0 && !isImporting && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p>No students found. Upload a file to get started.</p>
        </div>
      )}

      {/* AI Prompt Configuration */}
      <div className={styles.promptSection}>
        <label className={styles.promptLabel}>AI Prompt</label>
        <textarea
          className={styles.promptInput}
          value={promptAI}
          onChange={(e) => setPromptAI(e.target.value)}
          placeholder="Enter the AI prompt for CV processing..."
        />
        <div style={{ marginTop: "0.75rem" }}>
          <button
            className={`${styles.actionButton} ${styles.primaryButton}`}
            onClick={() =>
              fetch("/api/cv/config", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: promptAI }),
              })
            }
          >
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}
