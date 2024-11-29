import React, { useState } from "react";
import "../CSS/Update.css"; // Add specific styles if needed

function Update() {
  // State for managing form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ssn: "",
    dob: "",
    familySize: 0,
    currentAddress: "",
    houseTotalSpace: 0,
    isHeadOfHousehold: true,
    dependents: [],
  });

  // Event handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add a dependent
  const addDependent = () => {
    setFormData({
      ...formData,
      dependents: [
        ...formData.dependents,
        { firstName: "", lastName: "", dob: "", ssn: "" },
      ],
    });
  };

  // Update a dependent’s information
  const updateDependent = (index, field, value) => {
    const updatedDependents = [...formData.dependents];
    updatedDependents[index][field] = value;
    setFormData({ ...formData, dependents: updatedDependents });
  };

  // Remove a dependent
  const removeDependent = (index) => {
    const updatedDependents = formData.dependents.filter((_, i) => i !== index);
    setFormData({ ...formData, dependents: updatedDependents });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  };

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
          {/* User Details */}
          <label>
            First Name:
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
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
            />
          </label>
          <label>
            Current Address:
            <textarea
              name="currentAddress"
              value={formData.currentAddress}
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
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </label>

          {/* Dependents Section */}
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
               onClick={addDependent}>
                Add Dependent
              </button>
            </div>
          )}

          <button type="submit">Save Changes</button>
        </form>
      </section>
    </div>
  );
}

export default Update;

