//npm start

import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import Hub from "./Pages/Hub";

function App() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    ssn: "",
    dob: "",
    familySize: 0,
    currentAddress: "",
    houseTotalSpace: 0, // New field
    isHeadOfHousehold: true,
    dependents: [],
  });

  const [submitted, setSubmitted] = useState(false);
  
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

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.ssn ||
      !formData.dob ||
      !formData.familySize ||
      !formData.currentAddress
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8000/api/add-member",
        formData
      );
      alert(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form.");
    }
  };

  if (submitted) {
    return <Hub formData={formData} />;
  }

  return (
    <div className="app-container">
      {/* Banner */}
      <header className="app-header">
        <h1>Hurricane Housing Helper</h1>
      </header>

      {/* Welcome Message */}
      <section className="app-welcome">
        <p>
          Welcome to the Hurricane Housing Helper program. In times of natural
          disasters, we connect people who can offer help with those in need.
          If your house is safe, you can volunteer to help others. If you're in
          need, we’re here to ensure help reaches you.
        </p>
      </section>

      {/* Enrollment Form */}
      <section className="app-form">
        <h2>Join the Program</h2>
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
            <div className="dependents-section">
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
                onClick={addDependent}
              >
                Add Dependent
              </button>
            </div>
          )}

          <button type="submit" className="btn-continue">
            Continue
          </button>
        </form>
        <button className="btn-member">Already a Member?</button>
      </section>
    </div>
  );
}

export default App;
