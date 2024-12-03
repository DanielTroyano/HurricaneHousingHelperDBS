import React, { useState } from "react";
import axios from "axios";
import "../CSS/Hub.css"; // Assuming you have this CSS file for styling.

function Hub({ formData }) {
  const dependents = formData.dependents || [];

  localStorage.setItem("userEmail", formData.email);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isDisplaced, setIsDisplaced] = useState(formData.is_displaced || false);

  const handleToggleDisplaced = async () => {
    try {
      await axios.post("http://localhost:8000/api/toggle-displaced", {
        ssn: formData.ssn,
        isDisplaced: !isDisplaced,
      });
      setIsDisplaced(!isDisplaced);
    } catch (error) {
      console.error("Error toggling displaced status:", error);
      alert("Failed to update displaced status.");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown visibility
  };

  const navigateToUpdate = () => {
  window.location.href = "/Update"; // Navigate to the update page
  };

  const handleLogout = () => {
    // Remove the user's email from localStorage
    localStorage.removeItem("userEmail");
  
    // Navigate to the main page
    window.location.href = "/";
  };
  
  return (
    <div className="hub-container">
      {/* adding in profile pic*/}
      <div className="profile-button">
        <button onClick={toggleDropdown}>
          <img
          src={formData.profilePicture || "/profilepic.jpg"}
          alt="Profile"
          className="profile-pic"
          />
        </button>
        {showDropdown && (
  <div className="dropdown-menu">
    <ul>
      <li>
        <button className="update-button" onClick={navigateToUpdate}>
          Update Information
        </button>
      </li>
      <li>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </li>
    </ul>
  </div>
)}
      </div>
      {/*  */}
      
      <div className="hub-header">
        <h1>
          Hello {formData.firstName || formData.first_name} {formData.lastName || formData.last_name},
        </h1>
        <p>
          Our goal is to ensure that you
          {dependents.length > 0 &&
            ` and ${dependents
              .map((dep) => dep.firstName || dep.first_name)
              .join(", ")}`}{" "}
          are safe!
        </p>
        <p>
          As of right now there isn't an emergency, but click the button to the
          right to let us know if your family is displaced!
        </p>
      </div>

      <div className="hub-action">
        <button
          className={`displaced-button ${
            isDisplaced ? "displaced" : "safe"
          }`}
          onClick={handleToggleDisplaced}
        >
          {isDisplaced ? "Displaced" : "Safe"}
        </button>
      </div>
    </div>
  );
}

export default Hub;
