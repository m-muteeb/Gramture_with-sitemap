import React, { useState, useEffect } from 'react';
import '../../assets/css/topbar.css';
import { Modal, Input } from 'antd';
import { Link, useNavigate } from 'react-router-dom';

import img from '../../assets/images/new-logo.webp'; // Your logo image
import {  FaHome, FaInfoCircle, FaComments } from 'react-icons/fa'; // Import FontAwesome icons

const Topbar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
 
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

  // Handle search icon click
  const handleSearch = () => {
    setIsModalVisible(true);
  };

  // Handle search modal close
  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  // Handle search modal cancel
  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  // Handle input change for search
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

  // Handle navigation from search results
  const handleNavigate = (link) => {
    navigate(link);
    setIsModalVisible(false);
  };

  // Fetch notifications from Firestore
  useEffect(() => {
    // Notification dropdown menu
  }, []);
 

  // Handle dropdown open
 

  return (
    <div className="topbar" style={{ zIndex: 15000 }}>
      <div className="topbar-content">
        {/* Left: Logo */}
        <div className="topbar-logo">
          <Link to="/Add Grammar">
            <img src={img} alt="Logo" width={"200px"} />
          </Link>
        </div>

        {/* Center: Links */}
        <div className="topbar-links">
          <Link to="/" className="topbar-link">
            <FaHome style={{ marginRight: '8px' }} />
            Home
          </Link>
          <Link to="/about" className="topbar-link">
            <FaInfoCircle style={{ marginRight: '8px' }} />
            About Us
          </Link>
          <Link to="/discussion_forum" className="topbar-link">
            <FaComments style={{ marginRight: '8px' }} />
            Discussion Forum
          </Link>
        </div>

        {/* Right: Search Icon and Notification Bell */}
        <div className="topbar-right">
        

          {/* Search Icon */}
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
          placeholder="Search..."
          size="large"
          value={searchQuery}
          onChange={handleSearchQuery}
        />
        <div className="search-results mt-3">
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map((result, index) => (
                <li
                  key={index}
                  onClick={() => handleNavigate(result.link)}
                  style={{ cursor: "pointer" }}
                >
                  {result.label}
                </li>
              ))}
            </ul>
          ) : (
            <p>No results found.</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Topbar;
