import { init } from "next/dist/compiled/webpack/webpack";
import allowedOrigin from "./allowedOrigin";
import { initdb } from "./initdb";

let hasRun = false;

export default async function handler(req, res) {
  console.log("hasrun ?", hasRun);

  if (!hasRun) {
    allowedOrigin(req, res);

    console.log("init");

    initdb();

    hasRun = true; // Ensure it only runs once
  }
  res.status(200).json("init");
}
