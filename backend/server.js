const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database!");
});

// Endpoint to insert a new member
app.post("/api/add-member", (req, res) => {
    const {
      firstName,
      lastName,
      email,
      password,
      ssn,
      dob,
      familySize,
      currentAddress,
      houseTotalSpace,
      isHeadOfHousehold,
      dependents,
    } = req.body;
  
    const addHouseSQL = `
      INSERT INTO Houses (address, guardian_ssn, house_total_space, is_destroyed)
      VALUES (?, NULL, ?, FALSE)
      ON DUPLICATE KEY UPDATE house_total_space = house_total_space;
    `;
  
    const addMemberSQL = `
      INSERT INTO HHH_Members (
        first_name, last_name, email, password, ssn, dob,
        family_size, current_address, is_head_of_household, dependents
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
  
    const updateHouseSQL = `
      UPDATE Houses SET guardian_ssn = ? WHERE address = ?;
    `;
  
    // Insert the house first
    db.query(
      addHouseSQL,
      [currentAddress, houseTotalSpace],
      (err) => {
        if (err) {
          console.error("Error inserting house data:", err);
          return res.status(500).send(`Failed to add house. ${err.message}`);
        }
  
        // Insert the member
        db.query(
          addMemberSQL,
          [
            firstName,
            lastName,
            email,
            password,
            ssn,
            dob,
            familySize,
            currentAddress,
            isHeadOfHousehold ? 1 : 0,
            JSON.stringify(dependents),
          ],
          (err) => {
            if (err) {
              console.error("Error inserting member data:", err);
              return res.status(500).send(`Failed to add member. ${err.message}`);
            }
  
            // Update the house with the guardian_ssn
            db.query(
              updateHouseSQL,
              [ssn, currentAddress],
              (err) => {
                if (err) {
                  console.error("Error updating house data:", err);
                  return res
                    .status(500)
                    .send(`Failed to update house. ${err.message}`);
                }
  
                res.status(200).send("Member and house added successfully!");
              }
            );
          }
        );
      }
    );
  });
  
app.post("/api/toggle-displaced", (req, res) => {
  const { ssn, isDisplaced } = req.body;

  const sql = `
    UPDATE HHH_Members
    SET is_displaced = ?
    WHERE ssn = ?;
  `;

  db.query(sql, [isDisplaced, ssn], (err) => {
    if (err) {
      console.error("Error updating displaced status:", err);
      return res.status(500).send("Failed to update displaced status.");
    }

    res.status(200).send("Displaced status updated successfully!");
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
