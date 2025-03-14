import React, { useState, useEffect } from 'react';
import '../../assets/css/topbar.css';
import { Modal, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import img from '../../assets/images/new-logo.webp'; // Your logo image
import { FaHome, FaInfoCircle, FaComments } from 'react-icons/fa'; // Import FontAwesome icons

const Topbar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar open/close state
  const [overlayVisible, setOverlayVisible] = useState(false); // Dark overlay visibility

  const navigate = useNavigate();

  const searchKeywords = [
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Contact", link: "/contact" },
    { label: "Class 9", link: "/class9" },
    { label: "Class 10", link: "/class10" },
    { label: "Class 11", link: "/class11" },
    { label: "Class 12", link: "/class12" },
    { label: "Bsc", link: "/bsc" },
  ];

  const handleSearch = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearchQuery = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = searchKeywords.filter(keyword =>
      keyword.label.toLowerCase().includes(query)
    );

    setSearchResults(results);
  };

  const handleNavigate = (link) => {
    navigate(link);
    setIsModalVisible(false);
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > prevScrollY) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    setPrevScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [prevScrollY]);

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    setOverlayVisible(!isSidebarOpen);
  };

  // Close sidebar when overlay is clicked
  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setOverlayVisible(false);
  };

  return (
    <div
      className={`topbar ${isVisible ? "visible" : "hidden"}`}
      style={{ zIndex: 15000, transition: "top 0.3s ease" }}
    >
      <div className="topbar-content">
        {/* Left: Hamburger Menu Button */}
        <div className="topbar-hamburger" onClick={toggleSidebar}>
        <i 

  
  className="fas fa-bars" 
  style={{ 
    color: 'black', 
    fontSize: '25px', 
    border: '2px solid lightgray',  // Light grey outline
    borderRadius: '5px',            // Rounded corners for a softer look
    padding: '5px',                 // Space between the icon and the border
    cursor: 'pointer',              // Pointer cursor to indicate clickability
  }}
></i>



        </div>

        {/* Left: Logo */}
        <div className="topbar-logo">
          <Link to="/">
            <img src={img} alt="Logo" />
          </Link>
        </div>

        {/* Center: Links */}
        <div className="topbar-links">
          <Link to="/" className="topbar-link">
            <FaHome style={{ marginRight: '8px' }} />
            Home
          </Link>
          <Link to="/about" className="topbar-link about-link">
            <FaInfoCircle style={{ marginRight: '8px' }} />
            About Us
          </Link>
          <Link to="/discussion_forum" className="topbar-link">
            <FaComments style={{ marginRight: '8px' }} />
            Discussion Forum
          </Link>
        </div>

        {/* Right: Search Icon */}
        <div className="topbar-right">
          <button className="search-icon" onClick={handleSearch}>
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* Search Modal */}
      <Modal
        title="Search"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        footer={null}
        centered
        className="search-modal"
      >
        <Input
          placeholder="Search for a topic"
          value={searchQuery}
          onChange={handleSearchQuery}
        />
        <div className="search-results">
          <ul>
            {searchResults.map((result, index) => (
              <li key={index} onClick={() => handleNavigate(result.link)}>
                {result.label}
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${overlayVisible ? 'active' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button
          className="sidebar-close-btn"
          onClick={closeSidebar}
        >
          &times;
        </button>
        <ul>
          <li>
            <Link to="/" className="sidebar-link">Home</Link>
          </li>
          <li>
            <Link to="/about" className="sidebar-link">About Us</Link>
          </li>
          <li>
            <Link to="/discussion_forum" className="sidebar-link">Discussion Forum</Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Topbar;
