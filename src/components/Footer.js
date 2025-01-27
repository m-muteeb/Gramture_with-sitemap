import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaGithub, FaPinterest } from "react-icons/fa"; // Added new icons
import "../assets/css/footer.css"; // Custom CSS for additional styling
import logo from "../assets/images/logo.png.png"; // Replace with your logo path

const Footer = () => {
  return (
    <footer className="footer text-light py-4">
      <Container>
        <Row>
          {/* Logo and Developed By */}
          <Col xs={12} md={4} className="text-center text-md-start mb-3 mb-md-0">
            <img src={logo} alt="Gramture Logo" className="footer-logo mb-2" />
            <p className="mb-0">
              <small href= "https://muteeb-portfolio1.firebaseapp.com/" >Developed by <strong>Code Nexus</strong></small>
            </p>
          </Col>

          {/* Navigation Links */}
          <Col xs={12} md={4} className="text-center mb-3 mb-md-0">
            <nav>
              <ul className="footer-nav list-unstyled d-flex justify-content-center gap-3">
                <li><a href="/" className="text-light text-decoration-none">Home</a></li>
                <li><a href="/about" className="text-light text-decoration-none">About us</a></li>
                <li><a href="/results" className="text-light text-decoration-none">Results</a></li>
                
                
              </ul>
            </nav>
          </Col>

          {/* Privacy Policy and Rights */}
          <Col xs={12} md={4} className="text-center text-md-center">
            <p className="mb-1">
              <a href="/privacy-policy" className="text-light text-decoration-none">Privacy Policy</a>
            </p>
            <p className="mb-0"><small>© 2025 Gramture. All Rights Reserved.</small></p>
            {/* Social Icons */}
            <div className="social-icons mt-3">
  <a
    href="https://www.facebook.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon facebook"
  >
    <FaFacebook size={24} />
  </a>
  <a
    href="https://www.twitter.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon twitter"
  >
    <FaTwitter size={24} />
  </a>
  <a
    href="https://www.instagram.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon instagram"
  >
    <FaInstagram size={24} />
  </a>
  <a
    href="https://www.linkedin.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon linkedin"
  >
    <FaLinkedin size={24} />
  </a>
  <a
    href="https://www.youtube.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon youtube"
  >
    <FaYoutube size={24} />
  </a>
  <a
    href="https://www.github.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon github"
  >
    <FaGithub size={24} />
  </a>
  <a
    href="https://www.pinterest.com"
    target="_blank"
    rel="noopener noreferrer"
    className="social-icon pinterest"
  >
    <FaPinterest size={24} />
  </a>
</div>

          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

