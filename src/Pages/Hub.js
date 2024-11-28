import React, { useState } from "react";
import axios from "axios";
import "../CSS/Hub.css"; // Create this CSS file for custom styling.

function Hub({ formData }) {
  const [isDisplaced, setIsDisplaced] = useState(false);

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

  return (
    <div className="hub-container">
      <div className="hub-header">
        <h1>
          Hello {formData.firstName} {formData.lastName},
        </h1>
        <p>
          Our goal is to ensure that you
          {formData.dependents.length > 0 &&
            ` and ${formData.dependents
              .map((dep) => dep.firstName)
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
