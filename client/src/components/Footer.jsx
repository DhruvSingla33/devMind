import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Footer.css";

import { Container, Row, Col } from "react-bootstrap";
import {
  AiFillGithub,
  AiOutlineTwitter,
  AiFillInstagram,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer1">
      <Container>
        <Row className="footer-content1 align-items-center text-center">
          <Col md={4} className="footer-text1">
            <p>
              Designed & Developed by <strong>Dhruv Singla</strong>
            </p>
          </Col>
          <Col md={4} className="footer-text1">
            <p>&copy; {year} DS. All rights reserved.</p>
          </Col>
          <Col md={4} className="footer-social1">
            <ul className="social-links1 list-unstyled d-flex justify-content-center mb-0">
              <li className="mx-2">
                <a
                  href="https://github.com/DhruvSingla33/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <AiFillGithub size={24} />
                </a>
              </li>
              <li className="mx-2">
                <a
                  href="https://www.linkedin.com/in/dhruv-singla30/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <FaLinkedinIn size={24} />
                </a>
              </li>
              <li className="mx-2">
                <a
                  href="mailto:singladhruv301@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Email"
                  title="Email"
                >
                  <MdEmail size={24} />
                </a>
              </li>
            </ul>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
