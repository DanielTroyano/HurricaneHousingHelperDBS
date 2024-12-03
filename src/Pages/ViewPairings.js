import React, { useState, useEffect } from "react";
import axios from "axios";
import "../CSS/ViewPairings.css"; // Optional CSS for styling

function ViewPairings() {
  const [pairings, setPairings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    withoutShelter: true,
    safeInOriginalHouse: true,
    refugeeInAnotherHouse: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPairings = async () => {
    setLoading(true);
    setError("");
    try {
      const selectedStatuses = [];
      if (filters.withoutShelter) selectedStatuses.push("without shelter");
      if (filters.safeInOriginalHouse) selectedStatuses.push("Safe in original house");
      if (filters.refugeeInAnotherHouse) selectedStatuses.push("Refugee in another house");

      const response = await axios.get("http://localhost:8000/api/shelter-pairings", {
        params: {
          search: searchTerm.trim(),
          status: selectedStatuses.join(","),
        },
      });

      setPairings(response.data);
    } catch (error) {
      console.error("Error fetching pairings:", error);
      setError("Failed to fetch shelter pairings.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pairings on load and whenever searchTerm or filters change
  useEffect(() => {
    fetchPairings();
  }, [searchTerm, filters]);

  const handleFilterChange = (filterKey) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterKey]: !prevFilters[filterKey],
    }));
  };

  return (
    <div className="pairings-container">
      <h1>Shelter Pairings</h1>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <label>
          <input
            type="checkbox"
            checked={filters.withoutShelter}
            onChange={() => handleFilterChange("withoutShelter")}
          />
          Without Shelter
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.safeInOriginalHouse}
            onChange={() => handleFilterChange("safeInOriginalHouse")}
          />
          Safe in Original House
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.refugeeInAnotherHouse}
            onChange={() => handleFilterChange("refugeeInAnotherHouse")}
          />
          Refugee in Another House
        </label>
      </div>

      {/* Loader or Error Message */}
      {loading && <p>Loading shelter pairings...</p>}
      {error && <p className="error-message">{error}</p>}

      {/* Shelter Pairings Table */}
      {!loading && !error && (
        <table className="pairings-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Address (Currently Staying)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pairings.length > 0 ? (
              pairings.map((pairing) => (
                <tr
                  key={pairing.ssn}
                  className={pairing.status === "without shelter" ? "no-shelter" : ""}
                >
                  <td>
                    {pairing.first_name} {pairing.last_name}
                  </td>
                  <td>{pairing.current_address}</td>
                  <td>{pairing.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No results found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewPairings;
