"use client";

import React, { useEffect, useState } from "react";

import styles from "./screens/styles/page.module.css";

import StudentList from "./screens/studentList";
import {
  STUDENT_LIST,
  COURSE_LIST,
  MATCH_STUDENT_COURSE,
  TEACHER_LIST,
  MAKE_REQUEST,
  IMPORT_EXPORT,
} from "./constants";
import CourseList from "./screens/courseList";
import MatchStudentCourse from "./screens/matchStudentCourse";
import TeacherList from "./screens/teacherList";
import MakeRequest from "./screens/makeRequest";
import ImportExport from "./screens/importExport";

export default function Home() {
  const [activeTab, setActiveTab] = useState<string | null>(STUDENT_LIST);

  const [userLoggedIn, setUserLoggedIn] = useState<string>("");

  const [errorMessage, setErrorMessage] = useState<string>("");

  const changeTab = (tab: string) => {
    setActiveTab(tab);
  };

  useEffect(() => {


    setUserLoggedIn("");

    // Check if the user is already logged in
    /*const storedUserLogin = localStorage.getItem("login");
    const storedUserSession = localStorage.getItem("session");
    if (storedUserLogin && storedUserSession) {
      // check if user already logged in

      // read session
      fetch("/api/user/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: storedUserSession,
          login: storedUserLogin,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setErrorMessage(data.error);
            return;
          }

          setUserLoggedIn("OK");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }**/

    const initAuthAndConfig = async () => {
      try {
        const authorisedUsers: any[] = [];

        // 2. Check for the CAS ticket in URL
        const urlParams = new URLSearchParams(window.location.search);
        const ticket = urlParams.get("ticket");

        const emailTemp = urlParams.get("email");
        const userTemp = urlParams.get("user");

        setUserLoggedIn("OK");

        if (!ticket) {
          // No ticket -> Redirect to CAS Login
          window.location.href = `https://cas.ust.hk/cas/login?service=${process.env.NEXT_PUBLIC_BASE_URL}/cas`;
          //return;
        } else {
          location.href =
            "https://cas.ust.hk/cas/login?service=" +
            process.env.NEXT_PUBLIC_BASE_URL +
            "/cas";
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // window.location.href = process.env.NEXT_PUBLIC_BASE_URL || "/";
      } finally {
      }
    };

    initAuthAndConfig();
  }, []);

  async function handleLogin(): Promise<void> {
    // check if login = admin and password = 123456

    const login = (document.getElementById("login") as HTMLInputElement).value;

    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    const loginData = {
      login: login, // User ID
      password: password, // Password
      firstLogin: true,
    };

    const response = await fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.error) {
      setErrorMessage(data.error);
      return;
    }

    console.log("Login successful:", data);
    setUserLoggedIn(data);
    localStorage.setItem("login", login);
    localStorage.setItem("session", data.sessionCode);
  }

  return <div>Not logged in</div>;
}
