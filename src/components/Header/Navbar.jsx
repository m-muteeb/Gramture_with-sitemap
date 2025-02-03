import React, { useState, useEffect, useRef } from "react";
import { Collapse } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { fireStore } from "../../firebase/firebase";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { Link } from "react-router-dom"; // Import Link

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubDropdown, setOpenSubDropdown] = useState({});
  const [categories, setCategories] = useState([]);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 992);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(fireStore, "topics"), orderBy("timestamp", "asc"));
        const querySnapshot = await getDocs(q);
        const data = {};

        querySnapshot.forEach((doc) => {
          const { class: className, category, subCategory } = doc.data();
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

  const scrollNav = (direction) => {
    if (!isSmallScreen) {
      if (direction === "left" && visibleStartIndex > 0) {
        setVisibleStartIndex(visibleStartIndex - 1);
      } else if (direction === "right" && visibleStartIndex + 6 < categories.length) {
        setVisibleStartIndex(visibleStartIndex + 1);
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light custom-navbar">
      <div className="container-fluid">
        {/* Toggle button for small screens */}
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

        {/* Left arrow (hidden on small screens) */}
        <FaAngleLeft
          className={`nav-arrow left-arrow d-none d-lg-flex ${visibleStartIndex === 0 ? "disabled" : ""}`}
          onMouseEnter={() => scrollNav("left")}
        />

        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav d-flex justify-content-center w-100" ref={dropdownRef} style={{ whiteSpace: "nowrap" }}>
            {categories
              .slice(isSmallScreen ? 0 : visibleStartIndex, isSmallScreen ? categories.length : visibleStartIndex + 6)
              .map((classData, index) => (
                <li className="nav-item dropdown position-relative mx-2" key={index}>
                  <div
                    className="nav-link dropdown-toggle"
                    onClick={() => setOpenDropdown(openDropdown === index ? null : index)}
                    style={{ cursor: "pointer" }}
                  >
                    {classData.class}
                  </div>
                  <Collapse in={openDropdown === index}>
                    <div className="dropdown-menu mt-0 shadow p-3 bg-light border">
                      {classData.content.map((categoryData, catIndex) => (
                        <div key={catIndex} className="mb-3">
                          <div
                            className="fw-bold text-primary d-flex justify-content-between align-items-center"
                            onClick={() =>
                              setOpenSubDropdown((prev) => ({
                                ...prev,
                                [index]: prev[index] === catIndex ? null : catIndex,
                              }))
                            }
                            style={{ cursor: "pointer" }}
                          >
                            {categoryData.category}
                          </div>
                          <Collapse in={openSubDropdown[index] === catIndex}>
                            <ul className="list-unstyled ms-3 mt-2">
                              {categoryData.subCategories.map((subCategory, subIdx) => (
                                <li key={subIdx}>
                                  <Link to={`/description/${subCategory}`} className="text-dark text-decoration-none">
                                    {subCategory}
                                  </Link>
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

        {/* Right arrow (hidden on small screens) */}
        <FaAngleRight
          className={`nav-arrow right-arrow d-none d-lg-flex ${visibleStartIndex + 6 >= categories.length ? "disabled" : ""}`}
          onMouseEnter={() => scrollNav("right")}
        />
      </div>
    </nav>
  );
};

export default Navbar;
