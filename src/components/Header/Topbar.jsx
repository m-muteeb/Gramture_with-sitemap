import React, { useState } from 'react';
import '../../assets/css/topbar.css';
import { Modal, Input } from 'antd';
import img from '../../assets/images/logo.png.png'; // Your logo image
import { Link, useNavigate } from 'react-router-dom';

const Topbar = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate(); // Use react-router-dom's navigate function

  const searchKeywords = [
    { label: "About", link: "/about" },
    { label: "Services", link: "/services" },
    { label: "Contact", link: "/contact" },
    { label: "Class 9", link: "/class9" },
    { label: "Class 10", link: "/class10" },
    { label: "Class 11", link: "/class10" },
    { label: "Class 12", link: "/class10" },
    { label: "Bsc", link: "/class10" },
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
    navigate(link); // Use navigate to redirect to the desired page
    setIsModalVisible(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-content">
        {/* Left: Logo */}
        <div className="topbar-logo">
          <Link to="/Add Grammar">
            <img src={img} alt="Logo" />
          </Link>
        </div>

        {/* Center: Links */}
        <div className="topbar-links">
          <Link to="/" className="topbar-link">Home</Link>
          <Link to="/about" className="topbar-link">About Us</Link>
          <Link to="/discussion_forum" className="topbar-link">Discussion Fourm</Link>
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
