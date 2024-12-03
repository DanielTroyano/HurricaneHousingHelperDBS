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
    street,
    city,
    state,
    zipCode,
    houseTotalSpace,
    isHeadOfHousehold,
    dependents,
  } = req.body;

  const serializedDependents =
    Array.isArray(dependents) && dependents.length > 0
      ? JSON.stringify(dependents)
      : "[]";

  // Insert into Houses table
  const addHouseSQL = `
    INSERT INTO Houses (street, city, state, zip_code, house_total_space, house_space_available, is_destroyed)
    VALUES (?, ?, ?, ?, ?, ?, FALSE)
  `;

  // Insert into HHH_Members table
  const addMemberSQL = `
    INSERT INTO HHH_Members (
      first_name, last_name, email, password, ssn, dob, family_size, house_id,
      is_head_of_household, dependents
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Update guardian_ssn in the Houses table
  const updateGuardianSQL = `
    UPDATE Houses
    SET guardian_ssn = ?
    WHERE house_id = ?
  `;

  // Calculate `house_space_available` dynamically
  const houseSpaceAvailable = houseTotalSpace - familySize;

  // Insert data into Houses table
  db.query(
    addHouseSQL,
    [street, city, state, zipCode, houseTotalSpace, houseSpaceAvailable],
    (err, houseResult) => {
      if (err) {
        console.error("Error inserting house data:", err);
        return res.status(500).send(`Failed to add house. ${err.message}`);
      }

      const houseId = houseResult.insertId; // Get the generated house_id

      // Insert data into HHH_Members table
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
          houseId, // Link the house_id
          isHeadOfHousehold ? 1 : 0,
          serializedDependents,
        ],
        (err) => {
          if (err) {
            console.error("Error inserting member data:", err);
            return res.status(500).send(`Failed to add member. ${err.message}`);
          }

          // Update guardian_ssn in Houses table
          db.query(updateGuardianSQL, [ssn, houseId], (err) => {
            if (err) {
              console.error("Error updating guardian_ssn in house:", err);
              return res
                .status(500)
                .send(`Failed to update guardian_ssn. ${err.message}`);
            }

            res
              .status(200)
              .send("Member and house added successfully with guardian_ssn!");
          });
        }
      );
    }
  );
});


 
// Endpoint to toggle a member's displaced status
app.post("/api/toggle-displaced", (req, res) => {
  const { ssn, isDisplaced } = req.body;

  // Update is_displaced in HHH_Members and is_destroyed in Houses
  const updateMemberSQL = `
    UPDATE HHH_Members
    SET is_displaced = ?
    WHERE ssn = ?;
  `;

  const updateHouseSQL = `
    UPDATE Houses
    SET is_destroyed = ?
    WHERE house_id = (
      SELECT house_id
      FROM HHH_Members
      WHERE ssn = ?
    );
  `;

  // Update the member's displaced status
  db.query(updateMemberSQL, [isDisplaced, ssn], (err) => {
    if (err) {
      console.error("Error updating displaced status:", err);
      return res.status(500).send("Failed to update displaced status.");
    }

    // Update the house's destroyed status
    const isDestroyed = isDisplaced; // Synchronize house status with displaced status
    db.query(updateHouseSQL, [isDestroyed, ssn], (err) => {
      if (err) {
        console.error("Error updating house destroyed status:", err);
        return res
          .status(500)
          .send("Failed to update house destroyed status.");
      }

      res.status(200).send("Displaced and house statuses updated successfully!");
    });
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
 
// Endpoint to fetch member data through email
app.get("/api/user-by-email/:email", (req, res) => {
  const { email } = req.params;

  const sql = `
    SELECT HHH_Members.*, 
           Houses.house_total_space, 
           Houses.street, 
           Houses.city, 
           Houses.state, 
           Houses.zip_code
    FROM HHH_Members
    LEFT JOIN Houses ON HHH_Members.house_id = Houses.house_id
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

      // Parse dependents if available
      try {
        user.dependents = user.dependents ? JSON.parse(user.dependents) : [];
      } catch (parseError) {
        console.error("Error parsing dependents:", parseError);
        user.dependents = [];
      }

      res.status(200).send(user);
    } else {
      res.status(404).send("User not found.");
    }
  });
});


// Endpoint to update a member's data
app.post("/api/update-member", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    ssn,
    dob,
    familySize,
    street,
    city,
    state,
    zipCode,
    houseTotalSpace,
    isHeadOfHousehold,
    dependents,
  } = req.body;

  const updateMemberSQL = `
    UPDATE HHH_Members
    SET first_name = ?, last_name = ?, email = ?, password = ?, dob = ?,
        family_size = ?, is_head_of_household = ?, dependents = ?
    WHERE ssn = ?
  `;

  const updateHouseSQL = `
    UPDATE Houses
    SET street = ?, city = ?, state = ?, zip_code = ?, house_total_space = ?, house_space_available = ?
    WHERE guardian_ssn = ?
  `;

  const houseSpaceAvailable = houseTotalSpace - familySize;

  const serializedDependents =
    Array.isArray(dependents) && dependents.length > 0
      ? JSON.stringify(dependents)
      : "[]";

  db.query(
    updateMemberSQL,
    [
      firstName,
      lastName,
      email,
      password,
      dob,
      familySize,
      isHeadOfHousehold ? 1 : 0,
      serializedDependents,
      ssn,
    ],
    (err) => {
      if (err) {
        console.error("Error updating member data:", err);
        return res.status(500).send("Failed to update member data.");
      }

      db.query(
        updateHouseSQL,
        [street, city, state, zipCode, houseTotalSpace, houseSpaceAvailable, ssn],
        (err) => {
          if (err) {
            console.error("Error updating house data:", err);
            return res.status(500).send("Failed to update house data.");
          }

          res.status(200).send("Member and house data updated successfully!");
        }
      );
    }
  );
});


// Endpoint to delete a member
app.post("/api/delete-member", (req, res) => {
  const { ssn, currentAddress } = req.body;

  const clearAddressSQL = `UPDATE HHH_Members SET current_address = NULL WHERE ssn = ?;`;
  const deleteHouseSQL = `DELETE FROM Houses WHERE address = ? AND guardian_ssn = ?;`;
  const deleteMemberSQL = `DELETE FROM HHH_Members WHERE ssn = ?;`;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Transaction start error:", err);
      return res.status(500).send("Failed to start transaction.");
    }

    // Step 1: Clear the `current_address` field in `HHH_Members`
    db.query(clearAddressSQL, [ssn], (err) => {
      if (err) {
        console.error("Error clearing address:", err);
        return db.rollback(() =>
          res.status(500).send("Failed to clear address in HHH_Members.")
        );
      }

      console.log("Address cleared for member.");

      // Step 2: Delete the house entry
      db.query(deleteHouseSQL, [currentAddress, ssn], (err) => {
        if (err) {
          console.error("Error deleting house:", err);
          return db.rollback(() =>
            res.status(500).send("Failed to delete house.")
          );
        }

        console.log("House deleted.");

        // Step 3: Delete the member entry
        db.query(deleteMemberSQL, [ssn], (err) => {
          if (err) {
            console.error("Error deleting member:", err);
            return db.rollback(() =>
              res.status(500).send("Failed to delete member.")
            );
          }

          console.log("Member deleted.");

          // Commit the transaction
          db.commit((err) => {
            if (err) {
              console.error("Transaction commit error:", err);
              return db.rollback(() =>
                res.status(500).send("Failed to commit transaction.")
              );
            }

            res.status(200).send(
              "Member and associated house deleted successfully!"
            );
          });
        });
      });
    });
  });
});

app.post("/api/current-address", (req, res) => {
  const { houseId, refugeAt } = req.body;

  const sql = `
    SELECT street, city, state, zip_code, is_destroyed
    FROM Houses
    WHERE house_id = ?;
  `;

  const getAddress = (id, callback) => {
    db.query(sql, [id], (err, results) => {
      if (err) {
        console.error("Error fetching house address:", err);
        return callback(err);
      }
      callback(null, results.length > 0 ? results[0] : null);
    });
  };

  // First, check the `house_id` of the user
  if (houseId) {
    getAddress(houseId, (err, house) => {
      if (err) return res.status(500).send("Failed to fetch address.");

      // If the house exists and is not destroyed, return its address
      if (house && !house.is_destroyed) {
        return res
          .status(200)
          .send(`${house.street}, ${house.city}, ${house.state}, ${house.zip_code}`);
      }

      // If the house is destroyed or does not exist, check `refuge_at`
      if (refugeAt) {
        getAddress(refugeAt, (err, refugeHouse) => {
          if (err) return res.status(500).send("Failed to fetch refuge house address.");

          // If the refuge house exists and is not destroyed, return its address
          if (refugeHouse && !refugeHouse.is_destroyed) {
            return res
              .status(200)
              .send(
                `${refugeHouse.street}, ${refugeHouse.city}, ${refugeHouse.state}, ${refugeHouse.zip_code}`
              );
          }

          // If both houses are destroyed or unavailable, return no shelter message
          return res
            .status(200)
            .send("You may be without shelter! Click the button to get help!");
        });
      } else {
        // No `refuge_at` provided, fallback to no shelter message
        return res
          .status(200)
          .send("You may be without shelter! Click the button to get help!");
      }
    });
  } else if (refugeAt) {
    // If no `house_id` but `refuge_at` exists, check `refuge_at` address
    getAddress(refugeAt, (err, refugeHouse) => {
      if (err) return res.status(500).send("Failed to fetch refuge house address.");

      // If the refuge house exists and is not destroyed, return its address
      if (refugeHouse && !refugeHouse.is_destroyed) {
        return res
          .status(200)
          .send(
            `${refugeHouse.street}, ${refugeHouse.city}, ${refugeHouse.state}, ${refugeHouse.zip_code}`
          );
      }

      // If the refuge house is destroyed, return no shelter message
      return res
        .status(200)
        .send("You may be without shelter! Click the button to get help!");
    });
  } else {
    // Neither `house_id` nor `refuge_at` exists
    res
      .status(200)
      .send("You may be without shelter! Click the button to get help!");
  }
});


app.get("/api/available-houses", (req, res) => {
  const sql = `
    SELECT house_id, street, city, state, zip_code, house_space_available
    FROM Houses
    WHERE is_destroyed = FALSE;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching available houses:", err);
      return res.status(500).send("Failed to fetch available houses.");
    }

    res.status(200).send(results);
  });
});

app.post("/api/select-house", (req, res) => {
  const { ssn, houseId, familySize } = req.body;

  console.log("Request Data:", { ssn, houseId, familySize }); // Debug log

  // Query to fetch the guardian of the selected house
  const getHostSQL = `
    SELECT guardian_ssn
    FROM Houses
    WHERE house_id = ?;
  `;

  // Update the user's displaced status and refuge_at column
  const updateUserSQL = `
    UPDATE HHH_Members
    SET is_displaced = FALSE, refuge_at = ?
    WHERE ssn = ?;
  `;

  // Decrement the selected house's available space
  const updateHouseSQL = `
    UPDATE Houses
    SET house_space_available = house_space_available - ?
    WHERE house_id = ?;
  `;

  // Insert into `shelter_pairings` table
  const addPairingSQL = `
    INSERT INTO shelter_pairings (host, leadRefugeeSSN, shelterID)
    VALUES (?, ?, ?);
  `;

  // Step 1: Fetch the host's SSN
  db.query(getHostSQL, [houseId], (err, results) => {
    if (err) {
      console.error("Error fetching host data:", err);
      return res.status(500).send("Failed to fetch host data.");
    }

    console.log("Host Query Results:", results); // Debug log

    if (results.length === 0 || !results[0].guardian_ssn) {
      console.error("Host not found or guardian_ssn is NULL");
      return res.status(404).send("Host not found or invalid for the selected house.");
    }

    const hostSSN = results[0].guardian_ssn;

    // Step 2: Update the user's displaced status and refuge_at
    db.query(updateUserSQL, [houseId, ssn], (err) => {
      if (err) {
        console.error("Error updating user data:", err);
        return res.status(500).send("Failed to update user data.");
      }

      // Step 3: Update the house's space
      db.query(updateHouseSQL, [familySize, houseId], (err) => {
        if (err) {
          console.error("Error updating house data:", err);
          return res.status(500).send("Failed to update house data.");
        }

        // Step 4: Insert into `shelter_pairings`
        db.query(addPairingSQL, [hostSSN, ssn, houseId], (err) => {
          if (err) {
            console.error("Error inserting shelter pairing:", err);
            return res.status(500).send("Failed to insert shelter pairing.");
          }

          res.status(200).send("House selected successfully, and pairing created!");
        });
      });
    });
  });
});




// Start the server
app.listen(port, () => {
 console.log(`Server is running on port ${port}`);
});