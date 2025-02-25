import React, { useState, useEffect, useCallback } from 'react';
import { Collapse } from 'react-bootstrap';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

const DropdownComponent = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openCategory, setOpenCategory] = useState({});
  const [dropdownData, setDropdownData] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDropdownData = useCallback(async () => {
    try {
      if (!fireStore) throw new Error('Firestore instance is not defined');

      const querySnapshot = await getDocs(
        query(collection(fireStore, 'topics'), orderBy('timestamp'))
      );

      const data = {};
      querySnapshot.forEach((doc) => {
        const { class: className, subCategory, topic, timestamp } = doc.data();
        if (['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(className)) {
          if (!data[className]) {
            data[className] = {};
          }
          if (subCategory && topic) {
            if (!data[className][subCategory]) {
              data[className][subCategory] = [];
            }
            data[className][subCategory].push({ topic, timestamp, id: doc.id });
          }
        }
      });

      const formattedData = Object.keys(data).map((classKey) => ({
        title: classKey,
        content: Object.keys(data[classKey]).map((subCategory) => ({
          subCategory,
          topics: data[classKey][subCategory].sort((a, b) => a.timestamp - b.timestamp),
        })),
      }));

      setDropdownData(formattedData);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  }, []);

  const fetchRecentPosts = useCallback(async () => {
    try {
      if (!fireStore) throw new Error('Firestore instance is not defined');

      const querySnapshot = await getDocs(
        query(collection(fireStore, 'topics'), orderBy('timestamp', 'desc'), limit(9))
      );

      const posts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : null;
        if (data.topic) {
          return { ...data, timestamp, topicId: doc.id };
        }
        return null;
      }).filter(post => post !== null);

      setRecentPosts(posts);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDropdownData();
    fetchRecentPosts();
  }, [fetchDropdownData, fetchRecentPosts]);

  const toggleDropdown = useCallback((index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  }, [openDropdown]);

  const toggleCategory = useCallback((mainIndex, categoryIndex) => {
    const key = `${mainIndex}-${categoryIndex}`;
    setOpenCategory((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  }, []);

  const scrollToTopic = (topicId) => {
    const element = document.getElementById(topicId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const Loader = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <Spinner animation="border" size="lg" variant="primary" />
    </div>
  );

  return (
    <Container className="my-5">
      {/* Heading Section */}
      <Row className="text-center mb-4">
        <Col>
          <h1 className="display-5 font-weight-bold text-dark">Gramture Study Platform</h1>
          <p className="lead text-muted">Explore Free Video Lectures, Practice MCQs & Test Sessions to boost your knowledge.</p>
          <p className="text-muted">
            This is a comprehensive online education platform that empowers students to excel in their academic journey. Our platform offers free video lectures, interactive practice MCQs, and test sessions for language studies. Join thousands of learners who trust us for quality, up-to-date study resources designed to help you succeed in exams and enhance your learning experience. Whether you're preparing for school exams or exploring new topics, 
          </p>
        </Col>
      </Row>

      {/* Loading State */}
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Dropdown for Classes */}
          <Row className="justify-content-center">
            {dropdownData.map((dropdown, index) => (
              <Col md={6} className="mb-3" key={index}>
                <Card
                  className="shadow-sm border-0 rounded-lg"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleDropdown(index)}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="h5 font-weight-semibold text-danger">{dropdown.title}</h5>
                      {openDropdown === index ? <BsChevronUp /> : <BsChevronDown />}
                    </div>
                    <Collapse in={openDropdown === index}>
                      <div className="mt-3">
                        {dropdown.content.map((category, categoryIndex) => (
                          <div key={categoryIndex} className="mb-3">
                            <div
                              className="d-flex justify-content-between align-items-center"
                              style={{ cursor: 'pointer', padding: '8px 0' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCategory(index, categoryIndex);
                              }}
                            >
                              <h6 className="h6 font-weight-medium text-secondary">{category.subCategory}</h6>
                              {openCategory[`${index}-${categoryIndex}`] ? <BsChevronUp /> : <BsChevronDown />}
                            </div>
                            <Collapse in={openCategory[`${index}-${categoryIndex}`]}>
                              <ul className="list-unstyled mt-2 pl-4">
                                {category.topics.map((topic, topicIndex) => {
                                  const topicId = `${dropdown.title}-${category.subCategory}-${topic.topic}`;
                                  return (
                                    <li className="py-1" key={topicIndex}>
                                      <Link
                                        to={`/description/${category.subCategory}/${topic.id}`}
                                        className="sub-category-link"
                                        onClick={() => {
                                          scrollToTopic(topicId);
                                        }}
                                        style={{
                                          textDecoration: 'none',
                                          color: '#007bff',
                                          fontSize: '1rem',
                                          fontWeight: '400',
                                          transition: 'color 0.2s ease',
                                        }}
                                      >
                                        {topic.topic}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </Collapse>
                          </div>
                        ))}
                      </div>
                    </Collapse>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Recent Posts Layout */}
          <Row className="mt-5 text-center">
            <Col>
              <h3 className="display-5 font-weight-bold text-dark">Recent Posts</h3>
            </Col>
          </Row>

          <Row className="justify-content-center mt-4">
            {recentPosts.length > 0 ? (
              <div className="row w-100">
                {recentPosts.map((post, index) => (
                  <Col xs={12} sm={6} md={4} lg={4} key={index} className="mb-4">
                    <Link
                      to={`/description/${post.subCategory}/${post.topicId}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                      }}
                    >
                      <Card
                        className="shadow-sm border-0 rounded-lg h-100"
                        style={{
                          transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <Card.Body>
                          <h5 className="text-primary">{post.topic}</h5>
                          <p className="text-muted">{new Date(post.timestamp).toLocaleDateString()}</p>
                        </Card.Body>
                      </Card>
                    </Link>
                  </Col>
                ))}
              </div>
            ) : (
              <Col xs={12} className="text-center">
                <p className="text-muted">No recent posts available.</p>
              </Col>
            )}
          </Row>

          {/* SEO Optimized Paragraph */}
          <Row className="mt-5 text-center">
            <Col>
              <h4 className=" font-weight-bold">Why Choose Us?</h4>
              <p className="text-muted">
                This is not just an online study platform, it is a complete learning solution for students of all levels. Offering a vast collection of video tutorials, notes, practice questions, and interactive study tools, We aims to revolutionize how students learn. With us, you can prepare for competitive exams, master new subjects, and boost your academic performance, all at your own pace and convenience.
              </p>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default DropdownComponent;
