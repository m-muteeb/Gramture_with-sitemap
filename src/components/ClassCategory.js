import React, { useState, useEffect, useCallback, memo } from 'react';
import { Collapse } from 'react-bootstrap';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import "../assets/css/classcategory.css";

const DropdownComponent = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openCategory, setOpenCategory] = useState({});
  const [dropdownData, setDropdownData] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDropdownData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(query(collection(fireStore, 'topics'), orderBy('timestamp')));
      const data = {
        'Class 9': {},
        'Class 10': {},
        'Class 11': {},
        'Class 12': {},
      };

      querySnapshot.forEach((doc) => {
        const { class: className, subCategory, topic, timestamp } = doc.data();
        if (data[className]) {
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
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          <h1 className="text-xl mb-4 text-center mt-4">Gramture Study Platform</h1>
          <p className="lead text-muted">
            Gramture is an online educational hub that aims to provide authentic and useful material in the form of comprehensive notes, lectures, videos, MCQs, Critical Thinking Activities, SAT (Self Assessment Tests) for internal, external, or board exams to score good results and take positions in exams. We provide research based on important study material from the exam point of view.
          </p>
        </Col>
      </Row>

      {/* Loading State */}
      {loading ? (
        <>
          <Loader />
          <div className="d-flex justify-content-center align-items-center mt-5">
            <div>
              <h4>While you wait, here are some suggestions:</h4>
              <ul>
                <li>Review key concepts from the last topic you studied.</li>
                <li>Explore upcoming topics that might interest you.</li>
                <li>Check out some of the recent posts for additional insights.</li>
                <li>Consider looking at past exam papers for practice.</li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        <>
          <Row className="justify-content-center">
            {dropdownData.map((dropdown, index) => (
              <Col md={6} className="mb-3" key={index}>
                <Card className="card-custom  border-0 rounded-lg">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="h4 font-weight-bold text-danger">{dropdown.title}</h5>
                    </div>

                    <div className="mt-3">
                      {dropdown.content.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-3">
                          <div
                            className="d-flex justify-content-between align-items-center"
                            style={{
                              cursor: 'pointer',
                              padding: '8px 0',
                              fontWeight: 'bold',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCategory(index, categoryIndex);
                            }}
                          >
                            <h5 className="h5 ">{category.subCategory}</h5>
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
                                        color: '#4CAF50',
                                        fontSize: '1rem',
                                        fontWeight: '500',
                                        transition: 'color 0.2s ease',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.target.style.color = '#388E3C';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.target.style.color = '#4CAF50';
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
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Recent Posts Section */}
          <Row className="mt-5 text-center">
            <Col>
              <h1 className="text-xl mb-4 text-center mt-4">Recent Posts</h1>
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
                    <Card className="shadow-sm border-0 rounded-lg h-100" style={{ backgroundColor: '#f8f9fa' }}>
                      <Card.Body>
                        <h5 className="text-danger">{post.topic}</h5>
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
