import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/Hub.css";

function Hub({ formData }) {
  const dependents = formData.dependents || [];
  localStorage.setItem("userEmail", formData.email);

  const [showDropdown, setShowDropdown] = useState(false);
  const [isDisplaced, setIsDisplaced] = useState(formData.is_displaced || false);
  const [availableHouses, setAvailableHouses] = useState([]);
  const [currentAddress, setCurrentAddress] = useState(null);

  const handleToggleDisplaced = async () => {
    try {
      await axios.post("http://localhost:8000/api/toggle-displaced", {
        ssn: formData.ssn,
        isDisplaced: !isDisplaced,
      });

      setIsDisplaced(!isDisplaced);

      if (!isDisplaced) {
        fetchAvailableHouses(); // Fetch houses if toggled to displaced
      } else {
        setAvailableHouses([]); // Clear houses if toggled back to safe
      }
    } catch (error) {
      console.error("Error toggling displaced status:", error);
      alert("Failed to update displaced status.");
    }
  };

  const fetchAvailableHouses = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/available-houses");
      setAvailableHouses(response.data);
    } catch (error) {
      console.error("Error fetching available houses:", error);
      alert("Failed to fetch available houses.");
    }
  };

  useEffect(() => {
    fetchCurrentAddress();
  }, [formData.house_id, formData.refuge_at]);

  const fetchCurrentAddress = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/current-address", {
        houseId: formData.house_id,
        refugeAt: formData.refuge_at,
      });

      if (response.data) {
        setCurrentAddress(response.data);
      } else {
        setCurrentAddress("You may be without shelter! Click the button to get help!");
      }
    } catch (error) {
      console.error("Error fetching current address:", error);
      setCurrentAddress("You may be without shelter! Click the button to get help!");
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const navigateToUpdate = () => {
    window.location.href = "/Update";
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    window.location.href = "/";
  };

  const handleSelectHouse = async (houseId, availableSpace) => {
    if (availableSpace < (formData.familySize || formData.family_size)) {
      alert("This house does not have enough space for your family.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/select-house", {
        ssn: formData.ssn,
        houseId,
        familySize: formData.familySize || formData.family_size,
      });

      if (response.status === 200) {
        alert("House selected successfully!");
        setIsDisplaced(false); // Update local displaced state
        setAvailableHouses([]); // Clear the available houses table
        formData.refuge_at = houseId;
      }
    } catch (error) {
      console.error("Error selecting house:", error);
      alert("Failed to select house. Please try again.");
    }
  };

  return (
    <div className="hub-container">
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

      <div className="hub-header">
        <h1>
          Hello {formData.firstName || formData.first_name} {formData.lastName || formData.last_name},
        </h1>
        <p>
          Our goal is to ensure that you
          {(formData.familySize || formData.family_size) > 1 &&
            ` and your family of ${(formData.familySize || formData.family_size)}`}{" "}
          are safe!
        </p>
        <p>
          As of right now there isn't an emergency, but click the button to the
          right to let us know if your family is displaced!
        </p>
      </div>

      <div className="current-address">
        <h2>Your Current Home:</h2>
        <p>{currentAddress || "Loading..."}</p>
      </div>

      <div className="hub-action">
        <button
          className={`displaced-button ${isDisplaced ? "displaced" : "safe"}`}
          onClick={handleToggleDisplaced}
        >
          {isDisplaced ? "Displaced" : "Safe"}
        </button>
      </div>

      {isDisplaced && availableHouses.length > 0 && (
        <div className="houses-container">
          <h2>Available Houses</h2>
          <table className="houses-table">
            <thead>
              <tr>
                <th>Street</th>
                <th>City</th>
                <th>State</th>
                <th>Zip Code</th>
                <th>Available Space</th>
                <th>Select</th>
              </tr>
            </thead>
            <tbody>
              {availableHouses.map((house) => (
                <tr key={house.house_id}>
                  <td>{house.street}</td>
                  <td>{house.city}</td>
                  <td>{house.state}</td>
                  <td>{house.zip_code}</td>
                  <td>{house.house_space_available}</td>
                  <td>
                    <button
                      className={`select-button ${
                        house.house_space_available >= (formData.familySize || formData.family_size)
                          ? "enabled"
                          : "disabled"
                      }`}
                      disabled={house.house_space_available < (formData.familySize || formData.family_size)}
                      onClick={() => handleSelectHouse(house.house_id, house.house_space_available)}
                    >
                      {house.house_space_available >= (formData.familySize || formData.family_size)
                        ? "Select"
                        : "Not Enough Space"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Hub;
