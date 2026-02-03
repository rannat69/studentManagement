import { initdb } from "./pages/api/initdb";

export function register() {
  console.log("This should be run once on start");
  initdb();
}
