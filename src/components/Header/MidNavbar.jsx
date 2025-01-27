import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../assets/css/navbar.css"; // Include your own styles here
import logo from "../../assets/images/navbarlogo.png"; // Replace with the actual logo
import styled from "styled-components";

// Styled component for the animated and elegant text
const ElegantText = styled.h1`
  font-size: 2.5rem;
  color:rgb(255, 47, 0);
  text-align: right;
  font-family: "Georgia", serif;
  background-image: linear-gradient(45deg,rgb(255, 0, 0),rgb(0, 0, 0));
  -webkit-background-clip: text; /* Gradient text */
  color: transparent;
  font-weight: bold;
  letter-spacing: 2px;
  animation: animateText 5s infinite ease-in-out;

  @keyframes animateText {
    0% {
      transform: translateY(0);
      opacity: 0.7;
    }
    50% {
      transform: translateY(-15px);
      opacity: 1;
    }
    100% {
      transform: translateY(0);
      opacity: 0.7;
    }
  }

  @media (max-width: 1200px) {
    font-size: 2rem;
    text-align: center;
  }

  @media (max-width: 992px) {
    font-size: 1.8rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    font-size: 1.5rem;
    text-align: center;
  }

  @media (max-width: 576px) {
    font-size: 1.3rem;
    text-align: center;
  }
`;

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [data] = useState([
    "Introduction to English",
    "Grammar Basics",
    "Letters and Applications",
    "Moral Stories",
    "Poem Book III",
    "Short Stories",
    "Plays Book III",
    "Goodbye Mr. Chips",
    "Book Prose II",
    "Heroes",
  ]);

  return (
    <header className="header container-fluid">
      {/* Large Screen Header */}
      <div className="row align-items-center d-none d-md-flex">
        <div className="col-4">
          <img src={logo} alt="Logo" className="logo m-1" />
        </div>
        <div className="col-8 text-right">
          <ElegantText>English Grammar & Structure</ElegantText>
        </div>
      </div>

      {/* Small Screen Header (Vertical Centered) */}
      <div className="row align-items-center justify-content-center d-flex d-md-none">
        <div className="col-12 text-center">
          <img src={logo} alt="Logo" className="logo" />
        </div>
        <div className="col-12 text-center">
          <ElegantText>English Grammar & Structure</ElegantText>
        </div>
      </div>
    </header>
  );
};

export default Header;
