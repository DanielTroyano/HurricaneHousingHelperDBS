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
      isHeadOfHousehold,
      dependents,
    } = req.body;
  
    const sql = `
      INSERT INTO HHH_Members (
        first_name, last_name, email, password, ssn, dob,
        family_size, current_address, is_head_of_household, dependents
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.query(
      sql,
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
          console.error("Error inserting data:", err);
          return res.status(500).send(`Failed to add member. ${err.message}`);
        } else {
          return res.status(200).send("Member added successfully!");
        }
      }
    );
  });
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
