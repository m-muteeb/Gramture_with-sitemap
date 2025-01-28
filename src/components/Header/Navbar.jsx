import React, { useState, useEffect, useRef } from "react";
import { Collapse } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { fireStore } from "../../firebase/firebase"; // Adjust path as needed

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null); // Main dropdown state
  const [openSubDropdown, setOpenSubDropdown] = useState({}); // Subcategory dropdown state
  const [categories, setCategories] = useState([]); // State for categories
  const dropdownRef = useRef(); // Ref for detecting outside clicks

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setOpenSubDropdown({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch dropdown data from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Create a query to order the data by timestamp in ascending order
        const q = query(collection(fireStore, "topics"), orderBy("timestamp", "asc"));

        const querySnapshot = await getDocs(q);
        const data = {};

        querySnapshot.forEach((doc) => {
          const { class: className, category, subCategory, timestamp } = doc.data();

          // Skip classes that should not be included
          if (["Class 9", "Class 10", "Class 11", "Class 12"].includes(className)) {
            return;
          }

          if (!data[className]) {
            data[className] = {};
          }
          if (!data[className][category]) {
            data[className][category] = new Set();
          }
          data[className][category].add(subCategory);
        });

        const formattedData = Object.keys(data).map((classKey) => ({
          class: classKey,
          content: Object.keys(data[classKey]).map((categoryKey) => ({
            category: categoryKey,
            subCategories: Array.from(data[classKey][categoryKey]),
          })),
        }));

        setCategories(formattedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
    setOpenSubDropdown({}); // Close sub-dropdowns when toggling main dropdown
  };

  const toggleSubDropdown = (mainIndex, subIndex) => {
    setOpenSubDropdown((prevState) => ({
      ...prevState,
      [mainIndex]: prevState[mainIndex] === subIndex ? null : subIndex,
    }));
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
      <div className="container">
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav" ref={dropdownRef}>
            {/* Loop over fetched class categories */}
            {categories.map((classData, index) => (
              <li className="nav-item dropdown position-relative" key={index}>
                <div
                  className="nav-link dropdown-toggle d-flex align-items-center justify-content-between"
                  onClick={() => toggleDropdown(index)}
                  aria-expanded={openDropdown === index}
                  style={{ cursor: "pointer" }}
                >
                  {classData.class} {/* Display class name */}
                </div>
                <Collapse in={openDropdown === index} className="dropdown-menu-custom">
                  <div className="dropdown-menu mt-0 shadow p-3 bg-light border">
                    {classData.content.map((categoryData, catIndex) => (
                      <div key={catIndex} className="mb-3">
                        <div
                          className="fw-bold text-primary d-flex justify-content-between align-items-center"
                          onClick={() => toggleSubDropdown(index, catIndex)}
                          style={{ cursor: "pointer" }}
                        >
                          {categoryData.category}
                          <i
                            className={`bi bi-chevron-${
                              openSubDropdown[index] === catIndex ? "up" : "down"
                            }`}></i>
                        </div>
                        <Collapse in={openSubDropdown[index] === catIndex}>
                          <ul className="list-unstyled ms-3 mt-2">
                            {categoryData.subCategories.map((subCategory, subIdx) => (
                              <li key={subIdx}>
                                <a
                                  href={`/construction/${subCategory}`}
                                  className="text-dark text-decoration-none"
                                >
                                  {subCategory}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </Collapse>
                      </div>
                    ))}
                  </div>
                </Collapse>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
