import React, { useState, useEffect, useRef } from "react";
import { Collapse } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { fireStore } from "../../firebase/firebase";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../../assets/css/navbar.css";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [classes, setClasses] = useState([]);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const dropdownRef = useRef();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Static classes to be treated as fixed
  const staticClasses = [
    "Moral Stories",
    "Applications",
    "Letters",
    "Applied Grammar",
    "Past Papers",
    "Translation",
  ];

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
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchClassesAndTopics = async () => {
      try {
        const q = query(
          collection(fireStore, "topics"),
          orderBy("timestamp", "asc")
        );
        const querySnapshot = await getDocs(q);
        const data = {};

        // Define the static classes you want to display
        const staticClasses = ["Moral Stories", "Applications", "Letters", "Applied Grammar"];

        // Fetch topics for static classes dynamically
        querySnapshot.forEach((doc) => {
          const { class: className, subCategory, topic } = doc.data();

          // Only store data for static classes
          if (staticClasses.includes(className)) {
            if (!data[className]) {
              data[className] = [];
            }

            data[className].push({ id: doc.id, subCategory, topic });
          }
        });

        // Remove duplicate topics in each class
        const formattedData = Object.keys(data).map((classKey) => ({
          class: classKey,
          topics: Array.from(
            new Map(data[classKey].map((item) => [item.topic, item])).values()
          ),
        }));

        setClasses(formattedData);
        console.log("Filtered Classes and topics fetched successfully:", formattedData);
      } catch (error) {
        console.error("Error fetching classes and topics:", error);
      }
    };

    fetchClassesAndTopics();
  }, []);

  const scrollNav = (direction) => {
    if (!isSmallScreen) {
      if (direction === "left" && visibleStartIndex > 0) {
        setVisibleStartIndex(visibleStartIndex - 1);
      } else if (direction === "right" && visibleStartIndex + 6 < classes.length) {
        setVisibleStartIndex(visibleStartIndex + 1);
      }
    }
  };

  const handleSubCategoryClick = () => {
    if (isSmallScreen) {
      setIsNavbarOpen(false);
    }
    setOpenDropdown(null);
  };
  const handleMouseEnter = (index) => {
    setOpenDropdown(index);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  return (
    <>
      <nav
        className={`navbar navbar-expand-lg custom-navbar ${
          isScrolled ? "scrolled" : ""
        }`}
      >
        <div className="container-fluid">
          <button
            className="navbar-toggler order-1"
            type="button"
            onClick={() => setIsNavbarOpen(!isNavbarOpen)}
            aria-controls="navbarNav"
            aria-expanded={isNavbarOpen}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <Link to="/" className="navbar-brand order-2 ms-2">
            {/* Your Logo or Brand Name */}
          </Link>

          {!isSmallScreen && (
            <FaAngleLeft
              className={`nav-arrow left-arrow order-3 ${
                visibleStartIndex === 0 ? "disabled" : ""
              }`}
              onClick={() => scrollNav("left")}
            />
          )}

          <div
            className={`collapse navbar-collapse justify-content-center order-4 ${
              isNavbarOpen ? "show" : ""
            }`}
            id="navbarNav"
          >
            <ul
              className="navbar-nav d-flex justify-content-center w-100"
              ref={dropdownRef}
            >
              {/* Static Classes with Dynamic Content */}
              {staticClasses.map((className, index) => (
                <li
                  key={index}
                  className="nav-item dropdown position-relative mx-2"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div
                    className="nav-link dropdown-toggle"
                    style={{
                      cursor: "pointer",
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {className}
                  </div>
                  <Collapse in={openDropdown === index}>
                    <div
                      className="dropdown-menu mt-0 shadow p-3 bg-light border custom-dropdown-width"
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      <div className="mb-3">
                        <ul className="list-unstyled ms-3 mt-2">
                          {classes
                            .filter((classData) => classData.class === className)
                            .map((classData, classIndex) =>
                              classData.topics.map((topic, topicIndex) => (
                                <li key={topicIndex} className="py-0.5">
                                  <Link
                                    to={`/description/${topic.subCategory}/${topic.id}`}
                                    className="sub-category-link"
                                    onClick={handleSubCategoryClick}
                                    style={{
                                      textDecoration: "none",
                                      color: "#dc3545",
                                      fontSize: "0.9rem",
                                      fontWeight: "400",
                                      transition: "color 0.2s ease",
                                    }}
                                  >
                                    {`${topicIndex + 1}. ${topic.topic}`}
                                  </Link>
                                </li>
                              ))
                            )}
                        </ul>
                      </div>
                    </div>
                  </Collapse>
                </li>
              ))}

              {/* Dynamic Classes */}
              {classes
                .filter((classData) => !staticClasses.includes(classData.class))
                .map((classData, index) => (
                  <li
                    className="nav-item dropdown position-relative mx-2"
                    key={index}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div
                      className="nav-link dropdown-toggle"
                      style={{
                        cursor: "pointer",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      {classData.class}
                    </div>
                    <Collapse in={openDropdown === index}>
                      <div
                        className="dropdown-menu mt-0 shadow p-3 bg-light border custom-dropdown-width"
                        style={{
                          maxHeight: "300px",
                          overflowY: "auto",
                        }}
                      >
                        <div className="mb-3">
                          <ul className="list-unstyled ms-3 mt-2">
                            {classData.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className="py-0.5">
                                <Link
                                  to={`/description/${topic.subCategory}/${topic.id}`}
                                  className="sub-category-link"
                                  onClick={handleSubCategoryClick}
                                  style={{
                                    textDecoration: "none",
                                    color: "#007bff",
                                    fontSize: "0.8rem",
                                    fontWeight: "400",
                                    transition: "color 0.2s ease",
                                  }}
                                >
                                  {`${topicIndex + 1}. ${topic.topic}`}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </Collapse>
                  </li>
                ))}
            </ul>
          </div>

          {!isSmallScreen && (
            <FaAngleRight
              className={`nav-arrow right-arrow order-5 ${
                visibleStartIndex + 6 >= classes.length ? "disabled" : ""
              }`}
              onClick={() => scrollNav("right")}
            />
          )}
        </div>
      </nav>

      {/* News Bar below navbar */}
      <div className="news-bar">
        <div className="scrolling-news">
          <span>🎉 New Syllabus 2025 Released – Be the First to Explore! "The future of learning is here! Get access to the updated Syllabus for 2025 and stay ahead of the curve with fresh topics and resources." </span>
          <span>✨ Explore New Features! </span>
          <span>🏆 Solve Tests & Get a FREE Certificate! "Take our online tests and get a FREE certificate upon successful completion. Show off your achievements and boost your learning journey!" </span>
          <span>🛠️ UI Improvements for Mobile Devices!</span>
        </div>
      </div>
    </>
  );
};

export default Navbar;
