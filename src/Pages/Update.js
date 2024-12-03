import React, { useState, useEffect } from "react";
import "../CSS/Update.css"; // Ensure CSS is applied
import Hub from "./Hub";

function Update() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ssn: "",
    dob: "",
    familySize: 0,
    street: "",
    city: "",
    state: "",
    zipCode: "",
    houseTotalSpace: 0,
    isHeadOfHousehold: true,
    dependents: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedChanges, setSavedChanges] = useState(false);

  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) {
        setError("Email not found. Please log in.");
        setLoading(false);
        return;
      }
  
      try {
        const response = await fetch(
          `http://localhost:8000/api/user-by-email/${userEmail}`
        );
        if (!response.ok) throw new Error("Failed to fetch user data");
  
        const userData = await response.json();
  
        console.log("Fetched user data:", userData); // Debugging line
  
        // Convert DOB to YYYY-MM-DD format for the input field
        const dobParts = userData.dob.split("/");
        const formattedDob = `${dobParts[2]}-${dobParts[0].padStart(2, "0")}-${dobParts[1].padStart(2, "0")}`;
  
        // Set all formData fields, including the formatted DOB and address components
        setFormData({
          firstName: userData.first_name,
          lastName: userData.last_name,
          email: userData.email,
          password: userData.password,
          ssn: userData.ssn,
          dob: formattedDob,
          familySize: userData.family_size,
          street: userData.street,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zip_code,
          houseTotalSpace: userData.house_total_space,
          isHeadOfHousehold: Boolean(userData.is_head_of_household),
          dependents: userData.dependents || [],
        });
  
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [userEmail]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const addDependent = () => {
    setFormData({
      ...formData,
      dependents: [
        ...formData.dependents,
        { firstName: "", lastName: "", dob: "", ssn: "" },
      ],
    });
  };

  const updateDependent = (index, field, value) => {
    const updatedDependents = [...formData.dependents];
    updatedDependents[index][field] = value;
    setFormData({ ...formData, dependents: updatedDependents });
  };

  const removeDependent = (index) => {
    const updatedDependents = formData.dependents.filter((_, i) => i !== index);
    setFormData({ ...formData, dependents: updatedDependents });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert DOB to YYYY-MM-DD before sending
    const formattedDob = new Date(formData.dob).toISOString().split("T")[0];

    try {
      const response = await fetch("http://localhost:8000/api/update-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          dob: formattedDob,
        }),
      });

      if (!response.ok) throw new Error("Failed to update user information");
      alert("Information updated successfully!");
      setSavedChanges(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmation) return;

    try {
      const response = await fetch("http://localhost:8000/api/delete-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ssn: formData.ssn,
          house_id: formData.house_id,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to delete account");
      }

      alert("Account deleted successfully!");
      localStorage.removeItem("userEmail"); // Clear email from localStorage
      window.location.href = "/"; // Redirect to home or login page
    } catch (err) {
      console.error("Error during account deletion:", err);
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (savedChanges && formData) {
    return <Hub formData={formData} />;
  }

  return (
    <div className="update-container">
      {/* Banner */}
      <header className="update-header">
        <h1>Hurricane Housing Helper</h1>
      </header>

      {/* Update Form */}
      <section className="update-form">
        <h2>Update Account Information</h2>
        <form onSubmit={handleSubmit}>
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            SSN:
            <input
              type="text"
              name="ssn"
              value={formData.ssn}
              onChange={handleChange}
              maxLength="11"
              required
              className="form-input"
              disabled
            />
          </label>
          <label>
            Date of Birth:
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Size of Family:
            <input
              type="number"
              name="familySize"
              value={formData.familySize}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
      <label>
        Street:
        <input
          type="text"
          name="street"
          value={formData.street}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        City:
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        State:
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        ZIP Code:
        <input
          type="text"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          required
        />
      </label>
          <label>
            Total Space of the House:
            <input
              type="number"
              name="houseTotalSpace"
              value={formData.houseTotalSpace}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label>
            Are you the head of household?
            <select
              name="isHeadOfHousehold"
              value={formData.isHeadOfHousehold ? "Yes" : "No"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  isHeadOfHousehold: e.target.value === "Yes",
                })
              }
              className="form-select"
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label>

          {formData.isHeadOfHousehold && (
            <div className="update-dependents-section">
              <h3>Dependents</h3>
              {formData.dependents.map((dependent, index) => (
                <div key={index} className="dependent">
                  <label>
                    First Name:
                    <input
                      type="text"
                      placeholder="Dependent's first name"
                      value={dependent.firstName}
                      onChange={(e) =>
                        updateDependent(index, "firstName", e.target.value)
                      }
                      required
                      className="form-input"
                    />
                  </label>
                  <label>
                    Last Name:
                    <input
                      type="text"
                      placeholder="Dependent's last name"
                      value={dependent.lastName}
                      onChange={(e) =>
                        updateDependent(index, "lastName", e.target.value)
                      }
                      required
                      className="form-input"
                    />
                  </label>
                  <label>
                    Date of Birth:
                    <input
                      type="date"
                      value={dependent.dob}
                      onChange={(e) =>
                        updateDependent(index, "dob", e.target.value)
                      }
                      required
                      className="form-input"
                    />
                  </label>
                  <label>
                    SSN:
                    <input
                      type="text"
                      placeholder="Dependent's SSN"
                      maxLength="11"
                      value={dependent.ssn}
                      onChange={(e) =>
                        updateDependent(index, "ssn", e.target.value)
                      }
                      required
                      className="form-input"
                      disabled
                    />
                  </label>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeDependent(index)}
                  >
                    Remove Dependent
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn-add"
                onClick={addDependent}
              >
                Add Dependent
              </button>
            </div>
          )}

          <button type="submit" className="btn-save">
            Save Changes
          </button>
        </form>
        <button type="button" className="btn-delete" onClick={handleDelete}>
          Delete Account
        </button>
      </section>
    </div>
  );
}

export default Update;
