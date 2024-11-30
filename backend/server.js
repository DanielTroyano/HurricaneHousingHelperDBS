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
     ON DUPLICATE KEY UPDATE house_total_space = VALUES(house_total_space);
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
    // Ensure dependents are serialized as JSON
   const serializedDependents =
 Array.isArray(dependents) && dependents.length > 0
   ? JSON.stringify(dependents)
   : '[]';


    // Insert the house first
   db.query(addHouseSQL, [currentAddress, houseTotalSpace], (err) => {
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
         serializedDependents,
       ],
       (err) => {
         if (err) {
           console.error("Error inserting member data:", err);
           return res.status(500).send(`Failed to add member. ${err.message}`);
         }
          // Update the house with the guardian_ssn
         db.query(updateHouseSQL, [ssn, currentAddress], (err) => {
           if (err) {
             console.error("Error updating house data:", err);
             return res.status(500).send(`Failed to update house. ${err.message}`);
           }
            res.status(200).send("Member and house added successfully!");
         });
       }
     );
   });
 });
 
// Endpoint to toggle a member's displaced status
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

// Endpoint to login a member
app.post("/api/login", (req, res) => {
   const { email, password } = req.body;
    const sql = `
     SELECT * FROM HHH_Members
     WHERE email = ? AND password = ?
   `;
    db.query(sql, [email, password], (err, results) => {
     if (err) {
       console.error("Error during login:", err);
       return res.status(500).send("Login failed.");
     }
      if (results.length > 0) {
       const user = results[0];
        // Safely parse dependents if it exists
       try {
         console.log("Raw dependents data before parsing:", user.dependents);
         user.dependents = user.dependents ? JSON.parse(user.dependents) : [];
       } catch (parseError) {
         console.error("Error parsing dependents:", parseError);
         user.dependents = [];
       }
        res.status(200).send({ success: true, user });
     } else {
       res.status(401).send({ success: false });
     }
   });
});
 
// // Endpoint to fetch a user by email
// app.get("/api/user-by-email/:email", (req, res) => {
//   const { email } = req.params;

//   const sql = `
//   SELECT HHH_Members.*, Houses.house_total_space
//   FROM HHH_Members
//   LEFT JOIN Houses ON HHH_Members.current_address = Houses.address
//   WHERE HHH_Members.email = ?;
//   `;

//   db.query(sql, [email], (err, results) => {
//     if (err) {
//       console.error("Database query error:", err);
//       return res.status(500).send("Failed to fetch user data.");
//     }

//     if (results.length > 0) {
//       const user = results[0];

//       // Convert DOB to MM/DD/YYYY format for display
//       const dob = new Date(user.dob);
//       user.dob = `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`;

//       try {
//         user.dependents = user.dependents ? JSON.parse(user.dependents) : [];
//       } catch (parseError) {
//         console.error("Error parsing dependents:", parseError);
//         user.dependents = [];
//       }

//       res.status(200).send(user);
//     } else {
//       res.status(404).send("User not found.");
//     }
//   });
// });

app.get("/api/user-by-email/:email", (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT HHH_Members.*, Houses.house_total_space
    FROM HHH_Members
    LEFT JOIN Houses ON HHH_Members.current_address = Houses.address
    WHERE HHH_Members.email = ?;
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Failed to fetch user data.");
    }

    if (results.length > 0) {
      const user = results[0];

      // Convert DOB to MM/DD/YYYY format for display
      const dob = new Date(user.dob);
      user.dob = `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`;

      // Use the already-parsed dependents value
      user.dependents = user.dependents || [];

      res.status(200).send(user);
    } else {
      res.status(404).send("User not found.");
    }
  });
});



// Start the server
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});