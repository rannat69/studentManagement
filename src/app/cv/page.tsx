"use client";

import { useEffect, useState } from "react";
import CVMenu from "./CVMenu";
import CVAdmin from "./CVAdmin";
import styles from "./styles.module.css";

export default function Home() {
  const [user, setUser] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [page, setPage] = useState<string>("");

  const [promptAI, setPromptAI] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    console.log("useEffect started");

    // test call to AI

    const sendToAI = {
      prompt: "This is my prompt. What is 1 + 1 ? ",
    };

    const testAI = async () => {
      try {
        const validateRes = await fetch("/api/cv/callAI", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: "Tell me a funny joke",
          }),
        });

        console.log("validateRes", validateRes);

        const AIData = await validateRes.json();
        console.log("AIData", AIData);

        console.log("AIData", AIData.choices[0].message.content);
      } catch (error) {
        console.error("API Call Error:", error);
      }
    };

    testAI();

    const initAuthAndConfig = async () => {
      try {
        // 1. Fetch config and authorised students concurrently to save load time
        const [configRes, studentsRes] = await Promise.all([
          fetch("/api/cv/config", {
            headers: { "Content-Type": "application/json" },
          }),
          fetch("/api/cv/readStudents"),
        ]);

        const configData = await configRes.json();
        setPromptAI(configData.prompt || "No promptAI found");

        const authorisedUsers: any[] = await studentsRes.json();

        // 2. Check for the CAS ticket in URL
        const urlParams = new URLSearchParams(window.location.search);
        const ticket = urlParams.get("ticket");

        if (!ticket) {
          // No ticket -> Redirect to CAS Login
          window.location.href = `https://cas.ust.hk/cas/login?service=${process.env.NEXT_PUBLIC_BASE_URL}/cv`;
          return;
        }

        console.log("Ticket found:", ticket);

        // 3. Validate CAS ticket
        const validateRes = await fetch("/api/cas/serviceValidate", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket }),
        });

        const validateData = await validateRes.json();

        // 4. Parse CAS XML
        const userInfo = extractUserInfo(validateData.message);

        // 5. Authorisation Check: Ensure user email or ID is in the student list

        const authorisedUsersEmail = authorisedUsers.map(
          (user) => user.email || "",
        );

        const isAuthorised =
          userInfo.email && authorisedUsersEmail.includes(userInfo.email);
        // Tip: Use userInfo.userTemp if student list contains user IDs instead of emails

        if (isAuthorised) {
          setUser(userInfo.userTemp || "Unknown user");
          if (userInfo.email) setEmail(userInfo.email);

          // Remove ticket from URL without reloading
          history.replaceState(
            { key: "value" },
            "Title",
            `${process.env.NEXT_PUBLIC_BASE_URL}/cv`,
          );
        } else {
          console.warn("User is not authorised to access this system.");
          window.location.href = process.env.NEXT_PUBLIC_BASE_URL || "/";
        }
      } catch (error) {
        console.error("Authentication error:", error);
        window.location.href = process.env.NEXT_PUBLIC_BASE_URL || "/";
      } finally {
        setLoading(false);
      }
    };

    // Helper function to parse CAS XML response
    const extractUserInfo = (xml: string) => {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xml, "application/xml");

      const getTagValue = (tagName: string): string => {
        const elem = xmlDoc.getElementsByTagName(tagName)[0];
        return elem?.textContent || "";
      };

      const userTemp = getTagValue("cas:user");
      const name = getTagValue("cas:name");
      const email = getTagValue("cas:mail");
      const departmentNumber = getTagValue("cas:departmentNumber");

      const eduPersonAffiliations = Array.from(
        xmlDoc.getElementsByTagName("cas:eduPersonAffiliation"),
      )
        .map((elem) => elem.textContent || "")
        .filter(Boolean);

      return {
        userTemp,
        name,
        email,
        departmentNumber,
        eduPersonAffiliations,
      };
    };

    initAuthAndConfig();
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSuccessMessage("");

    console.log("toto");

    try {
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const fileBase64 = btoa(binary);
      console.log("toto1");
      const response = await fetch("/api/cv/uploadCV", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fileName: file.name,
          fileBase64,
        }),
      });
      console.log("toto1.5");
      const result = await response.json();

      console.log("toto2");
      console.log("result", result);
      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      setSuccessMessage("CV uploaded successfully!");
    } catch (err) {
      const error = err as Error;
      setErrorMessage(error.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.mainCard}>
        {/* Welcome Header */}
        <div className={styles.welcomeHeader}>
          <span className={styles.welcomeTitle}>Welcome</span>
          <span className={styles.welcomeEmail}>
            {email || user || "Guest"}
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.authMessage}>
            <div className={styles.spinner}></div>
            <p>Authenticating…</p>
          </div>
        )}

        {/* Authenticated Content */}
        {email && !loading && (
          <>
            <CVMenu user={user} setPage={setPage} activePage={page} />

            {page === "config" && (
              <CVAdmin promptAI={promptAI} setPromptAI={setPromptAI}></CVAdmin>
            )}

            {page === "" && (
              <div className={styles.uploadSection}>
                <h2 className={styles.uploadTitle}>Upload CV</h2>
                <div
                  className={styles.fileUploadWrapper}
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <span className={styles.fileUploadLabel}>
                    <span className={styles.uploadIcon}>📎</span>
                    <span>Click to select a file</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--gray-500)",
                      }}
                    >
                      PDF, DOC, DOCX supported
                    </span>
                  </span>
                  <input
                    type="file"
                    id="file-input"
                    className={styles.fileInput}
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
                {isUploading && (
                  <div className={styles.importingRow}>
                    <span className={styles.dot}></span>
                    <span>Uploading CV…</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
