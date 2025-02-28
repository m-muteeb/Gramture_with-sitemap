import React, { useState, useEffect, useCallback, memo } from 'react';
import { Collapse } from 'react-bootstrap';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';

const DropdownComponent = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openCategory, setOpenCategory] = useState({});
  const [dropdownData, setDropdownData] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch dropdown data and memoize it to avoid unnecessary re-fetches
  const fetchDropdownData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(query(collection(fireStore, 'topics'), orderBy('timestamp')));

      // Organize data under static Class 9, 10, 11, 12
      const data = {
        'Class 9': {},
        'Class 10': {},
        'Class 11': {},
        'Class 12': {},
      };

      querySnapshot.forEach((doc) => {
        const { class: className, subCategory, topic, timestamp } = doc.data();
        
        if (data[className]) { // Only keep data for valid classes (9, 10, 11, 12)
          if (subCategory && topic) {
            if (!data[className][subCategory]) {
              data[className][subCategory] = [];
            }
            data[className][subCategory].push({ topic, timestamp, id: doc.id });
          }
        }
      });

      // Format the data to match the desired structure for rendering
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

  // Fetch recent posts and memoize it to avoid unnecessary re-fetches
  const fetchRecentPosts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(query(collection(fireStore, 'topics'), orderBy('timestamp', 'desc'), limit(9)));

      const posts = querySnapshot.docs
        .map((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : null;
          return data.topic ? { ...data, timestamp, topicId: doc.id } : null;
        })
        .filter(Boolean);

      setRecentPosts(posts);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = useCallback((index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  }, [openDropdown]);

  // Toggle category visibility inside the dropdown
  const toggleCategory = useCallback((mainIndex, categoryIndex) => {
    const key = `${mainIndex}-${categoryIndex}`;
    setOpenCategory((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  }, []);

  // Scroll to the topic on the page
  const scrollToTopic = (topicId) => {
    const element = document.getElementById(topicId);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Loading Spinner Component
  const Loader = memo(() => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <Spinner animation="border" size="lg" variant="primary" />
    </div>
  ));

  useEffect(() => {
    fetchDropdownData();
    fetchRecentPosts();
  }, [fetchDropdownData, fetchRecentPosts]);

  return (
    <Container className="my-5">
      <Row className="text-center mb-4">
        <Col>
          <h1 className="display-5 font-weight-bold text-dark">Gramture Study Platform</h1>
          <p className="lead text-muted">
            Explore Free Video Lectures, Practice MCQs & Test Sessions to boost your knowledge.
          </p>
          <p className="text-muted">
            This is a comprehensive online education platform that empowers students to excel in their academic journey...
          </p>
        </Col>
      </Row>

      {/* Loading State */}
      {loading ? (
        <Loader />
      ) : (
        <>
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

          {/* Recent Posts Section */}
          <Row className="mt-5 text-center">
            <Col>
              <h3 className="display-5 font-weight-bold text-dark">Recent Posts</h3>
            </Col>
          </Row>

          <Row className="justify-content-center mt-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((post, index) => (
                <Col xs={12} sm={6} md={4} lg={4} key={index} className="mb-4">
                  <Link
                    to={`/description/${post.subCategory}/${post.topicId}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Card className="shadow-sm border-0 rounded-lg h-100">
                      <Card.Body>
                        <h5 className="text-primary">{post.topic}</h5>
                        <p className="text-muted">{new Date(post.timestamp).toLocaleDateString()}</p>
                      </Card.Body>
                    </Card>
                  </Link>
                </Col>
              ))
            ) : (
              <Col xs={12} className="text-center">
                <p className="text-muted">No recent posts available.</p>
              </Col>
            )}
          </Row>
        </>
      )}
    </Container>
  );
};

export default memo(DropdownComponent);
