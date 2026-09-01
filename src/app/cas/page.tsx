"use client";

import React, { useEffect, useState } from "react";

import styles from "../screens/styles/page.module.css";

import StudentList from "../screens/studentList";
import {
  STUDENT_LIST,
  COURSE_LIST,
  MATCH_STUDENT_COURSE,
  TEACHER_LIST,
  MAKE_REQUEST,
  IMPORT_EXPORT,
} from "../constants";
import CourseList from "../screens/courseList";
import MatchStudentCourse from "../screens/matchStudentCourse";
import TeacherList from "../screens/teacherList";
import MakeRequest from "../screens/makeRequest";
import ImportExport from "../screens/importExport";

export default function CAS() {
  const [activeTab, setActiveTab] = useState<string | null>(STUDENT_LIST);

  const [userLoggedIn, setUserLoggedIn] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const changeTab = (tab: string) => {
    setActiveTab(tab);
  };

  const validateTicket = async () => {
    try {
      // 2. Check for the CAS ticket in URL
      const urlParams = new URLSearchParams(window.location.search);
      const ticket = urlParams.get("ticket");

      if (ticket) {
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
        const authorisedUsersEmail = ["remia@ust.hk", "braudt@ust.hk"];

        const isAuthorised =
          userInfo.email && authorisedUsersEmail.includes(userInfo.email);
        // Tip: Use userInfo.userTemp if student list contains user IDs instead of emails

        console.log("isAuthorised: ", isAuthorised);
        if (isAuthorised) {
          setUserLoggedIn(true);

          // Remove ticket from URL without reloading
          history.replaceState(
            { key: "value" },
            "Title",
            `${process.env.NEXT_PUBLIC_BASE_URL}/`,
          );

          const init = async () => {
            console.log("init");

            const res = await fetch("/api/init", {
              method: "POST", // Usually checkout sessions require a POST request
              headers: { "Content-Type": "application/json" },
            });
          };

          init();
        } else {
          console.warn("User is not authorised to access this system.");
          // window.location.href = process.env.NEXT_PUBLIC_BASE_URL || "/";
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // window.location.href = process.env.NEXT_PUBLIC_BASE_URL || "/";
    } finally {
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

  validateTicket();

  return (
    <div>
      {userLoggedIn ? (
        <div>
          <div className={styles.tab}>
            <img src="/logo.hkust.png" alt="Logo" className={styles.logo} />

            <div
              className={activeTab === STUDENT_LIST ? styles.active : ""}
              onClick={() => changeTab(STUDENT_LIST)}
            >
              Student list
            </div>
            <div
              className={activeTab === COURSE_LIST ? styles.active : ""}
              onClick={() => changeTab(COURSE_LIST)}
            >
              Course list{" "}
            </div>

            <div
              className={activeTab === TEACHER_LIST ? styles.active : ""}
              onClick={() => changeTab(TEACHER_LIST)}
            >
              Teacher list{" "}
            </div>
            <div
              className={
                activeTab === MATCH_STUDENT_COURSE ? styles.active : ""
              }
              onClick={() => changeTab(MATCH_STUDENT_COURSE)}
            >
              Match Student and Course{" "}
            </div>

            <div
              className={activeTab === MAKE_REQUEST ? styles.active : ""}
              onClick={() => changeTab(MAKE_REQUEST)}
            >
              Requests{" "}
            </div>

            <div
              className={activeTab === IMPORT_EXPORT ? styles.active : ""}
              onClick={() => changeTab(IMPORT_EXPORT)}
            >
              Import / Export{" "}
            </div>
          </div>

          <div>
            {activeTab && activeTab === STUDENT_LIST && <StudentList />}
          </div>
          <div>{activeTab && activeTab === COURSE_LIST && <CourseList />}</div>

          <div>
            {activeTab && activeTab === TEACHER_LIST && <TeacherList />}
          </div>
          <div>
            {activeTab && activeTab === MATCH_STUDENT_COURSE && (
              <MatchStudentCourse />
            )}
          </div>

          <div>
            {activeTab && activeTab === MAKE_REQUEST && <MakeRequest />}
          </div>

          <div>
            {activeTab && activeTab === IMPORT_EXPORT && <ImportExport />}
          </div>
        </div>
      ) : (
        <div className={styles.login}>Not logged in</div>
      )}
    </div>
  );
}
