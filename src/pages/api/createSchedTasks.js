export function createSchedTasks(db, bcrypt) {
  const fs = require("fs"); // Importing fs module
  const path = require("path"); // Importing path module

  /*setInterval(() => {
    console.log("Toto");
  }, 2000);
*/

  /* setInterval(() => {
    db.serialize(() => {
      const stmt = db.prepare(`DELETE FROM session`);
      stmt.run();
      stmt.finalize();
    });

    console.log("delete from session");
  }, 7200000); // 2 hours in milliseconds*/

  setInterval(() => {
    db.serialize(() => {
      const stmt = db.prepare(`DELETE FROM session`);
      stmt.run();
      stmt.finalize();
    });

    console.log("Delete from session every two hours");
  }, 7200000);

  function dailyDatabaseCopy() {
    // Copy pages/api/sql.db adding day in yyyy.mm.dd
    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0].replace(/-/g, "."); // Change date format to yyyy.mm.dd

    const sourcePath = path.join(
      process.cwd(),
      "src",
      "pages",
      "api",
      "sql.db",
    );
    const destinationPath = path.join(
      process.cwd(),
      `src/pages/api/sql_${formattedDate}.db`,
    );

    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      console.error("Source file does not exist:", sourcePath);
      return;
    }

    console.log("Source Path:", sourcePath);
    console.log("Destination Path:", destinationPath);

    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error("Error copying file:", err);
      } else {
        console.log(`Database copied to: sql_${formattedDate}.db`);
      }
    });
  }

  // Schedule the task to run every day (24 hours in milliseconds)
  //setInterval(dailyDatabaseCopy, 24 * 3600000); // 1 day in milliseconds
  setInterval(dailyDatabaseCopy, 10000); // 1 day in milliseconds
}
