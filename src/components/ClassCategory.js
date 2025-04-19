import React, { useState, useEffect, useCallback, memo } from 'react';
import { Collapse } from 'react-bootstrap';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import "../assets/css/classcategory.css";

// Constants for maintainability
const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
const RECENT_POSTS_LIMIT = 9;

// Helper function to create slugs for URLs
const createSlug = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

// Memoized Card component for better performance
const TopicCard = memo(({ topic, subCategory, id }) => (
  <li className="py-1">
    <Link
      to={`/description/${subCategory}/${createSlug(topic)}`}
      className="sub-category-link"
      style={{
        textDecoration: 'none',
        color: 'rgb(65, 67, 219)',
        fontSize: '1rem',
        fontWeight: '800',
        transition: 'color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.target.style.color = '#388E3C')}
      onMouseLeave={(e) => (e.target.style.color = 'rgb(65, 67, 219)')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      {topic}
    </Link>
  </li>
));

TopicCard.propTypes = {
  topic: PropTypes.string.isRequired,
  subCategory: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

// Memoized Recent Post Card component
const RecentPostCard = memo(({ post }) => (
  <Col xs={12} sm={6} md={4} lg={4} className="mb-4">
    <Link
      to={`/description/${post.subCategory}/${createSlug(post.topic)}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <Card className="shadow-sm border-0 rounded-lg h-100" style={{ backgroundColor: '#f8f9fa' }}>
        <Card.Body>
          <h5 className="text-danger">{post.topic}</h5>
          <p className="text-muted">
            {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : 'No date'}
          </p>
        </Card.Body>
      </Card>
    </Link>
  </Col>
));

RecentPostCard.propTypes = {
  post: PropTypes.shape({
    topic: PropTypes.string.isRequired,
    subCategory: PropTypes.string.isRequired,
    timestamp: PropTypes.instanceOf(Date),
  }).isRequired,
};

// Feature Card component
const FeatureCard = memo(({ title, children }) => (
  <Col xs={12} sm={6} md={6} lg={6}>
    <Card className="card-elegant">
      <Card.Body>
        <Card.Title>{title}</Card.Title>
        <Card.Text>{children}</Card.Text>
      </Card.Body>
    </Card>
  </Col>
));

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

// Benefit Card component
const BenefitCard = memo(({ title, children }) => (
  <div className="bg-light p-6 rounded-lg shadow-sm border-l-4 border-primary mb-4">
    <h5 className="text-xl font-semibold text-dark mb-3">{title}</h5>
    <p className="text-gray-600" style={{ fontSize: '1rem' }}>
      {children}
    </p>
  </div>
));

BenefitCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const DropdownComponent = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openCategory, setOpenCategory] = useState({});
  const [dropdownData, setDropdownData] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Organize fetched data into class-based structure
  const organizeData = useCallback((docs) => {
    const data = CLASSES.reduce((acc, className) => {
      acc[className] = {};
      return acc;
    }, {});

    docs.forEach((doc) => {
      const { class: className, subCategory, topic, timestamp } = doc.data();
      
      if (data[className] && subCategory && topic) {
        if (!data[className][subCategory]) {
          data[className][subCategory] = [];
        }
        data[className][subCategory].push({ 
          topic, 
          timestamp, 
          id: doc.id 
        });
      }
    });

    return data;
  }, []);

  // Format data for rendering
  const formatData = useCallback((data) => {
    return Object.keys(data).map((classKey) => ({
      title: classKey,
      content: Object.keys(data[classKey]).map((subCategory) => ({
        subCategory,
        topics: data[classKey][subCategory].sort((a, b) => a.timestamp - b.timestamp),
      })),
    }));
  }, []);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(
        query(collection(fireStore, 'topics'), orderBy('timestamp'))
      );
      
      const organizedData = organizeData(querySnapshot.docs);
      const formattedData = formatData(organizedData);
      
      setDropdownData(formattedData);
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
      setError('Failed to load class data. Please try again later.');
    }
  }, [organizeData, formatData]);

  // Fetch recent posts
  const fetchRecentPosts = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(fireStore, 'topics'), 
          orderBy('timestamp', 'desc'), 
          limit(RECENT_POSTS_LIMIT)
        )
      );

      const posts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          timestamp: data.timestamp?.seconds ? new Date(data.timestamp.seconds * 1000) : null,
          topicId: doc.id,
        };
      }).filter(post => post.topic);

      setRecentPosts(posts);
    } catch (err) {
      console.error('Error fetching recent posts:', err);
      setError('Failed to load recent posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle dropdown visibility
  const toggleDropdown = useCallback((index) => {
    setOpenDropdown(prev => prev === index ? null : index);
  }, []);

  // Toggle category visibility
  const toggleCategory = useCallback((mainIndex, categoryIndex) => {
    const key = `${mainIndex}-${categoryIndex}`;
    setOpenCategory(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDropdownData(), fetchRecentPosts()]);
    };
    
    loadData();
  }, [fetchDropdownData, fetchRecentPosts]);

  if (loading) {
    return (
      <Container className="my-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" size="lg" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      {/* Header Section */}
      <Row className="text-center mb-4">
        <Col>
          <h1 className="text-xl mb-4 text-center mt-4">Gramture Study Platform</h1>
          <p className="lead text-muted">
            Gramture is an online educational hub providing authentic study materials including 
            comprehensive notes, lectures, videos, MCQs, and assessment tools to help students excel 
            in their academic journey.
          </p>
        </Col>
      </Row>

      {/* Class Categories Section */}
      <Row className="justify-content-center">
        {dropdownData.map((dropdown, index) => (
          <Col md={6} className="mb-3" key={index}>
            <Card className="card-custom border-0 rounded-lg">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="h4 font-weight-bold text-danger">{dropdown.title}</h5>
                </div>

                <div className="mt-3">
                  {dropdown.content.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-3">
                      <div
                        className="d-flex justify-content-between align-items-center category-header"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(index, categoryIndex);
                        }}
                      >
                        <h5 className="h5">{category.subCategory}</h5>
                        {openCategory[`${index}-${categoryIndex}`] ? (
                          <BsChevronUp />
                        ) : (
                          <BsChevronDown />
                        )}
                      </div>

                      <Collapse in={openCategory[`${index}-${categoryIndex}`]}>
                        <ul className="list-unstyled mt-2 pl-4">
                          {category.topics.map((topic, topicIndex) => (
                            <TopicCard
                              key={topicIndex}
                              topic={topic.topic}
                              subCategory={category.subCategory}
                              id={topic.id}
                            />
                          ))}
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
            <RecentPostCard key={index} post={post} />
          ))
        ) : (
          <Col xs={12} className="text-center">
            <p className="text-muted">No recent posts available.</p>
          </Col>
        )}
      </Row>

      {/* Features Section */}
      <h1 className="text-xl mb-4 text-center mt-4">Why Gramture?</h1>
      <Row className="mt-3">
        <FeatureCard title="Important Questions & Answers">
          Gramture provides well-structured notes with key points explained through
          textual and real-life examples, making difficult topics easier to understand.
        </FeatureCard>

        <FeatureCard title="Easy-to-Understand Language">
          Content is crafted in simple language, ensuring accessibility for all students
          regardless of their educational background or language proficiency.
        </FeatureCard>

        <FeatureCard title="Best for Exam Preparation">
          Comprehensive summaries, short questions, exercises, and MCQs help students
          prepare effectively for exams.
        </FeatureCard>

        <FeatureCard title="Free Access to Study Materials">
          All resources are freely accessible—no need for expensive books or subscriptions.
        </FeatureCard>
      </Row>

      {/* Benefits Section */}
      <h1 className="text-xl mb-4 text-center mt-4">How Gramture Helps in Exam Preparation?</h1>
      <p className="text-center text-gray-700 mb-4" style={{ fontSize: '1.1rem' }}>
        Exams can be stressful, but with the right materials, students can prepare effectively.
      </p>

      <Row>
        <Col>
          <BenefitCard title="Important Questions & Answers">
            Chapter-wise questions and answers with Urdu translation help students master key concepts.
          </BenefitCard>

          <BenefitCard title="Quick Revision Notes">
            Concise summaries and short notes enable efficient last-minute revision.
          </BenefitCard>

          <BenefitCard title="Model Papers & Past Papers">
            Practice with model papers and previous years' questions to understand exam patterns.
          </BenefitCard>

          <BenefitCard title="Grammar & Writing Skills">
            Comprehensive guides for essay writing, applications, and formal letters following English rules.
          </BenefitCard>
        </Col>
      </Row>
    </Container>
  );
};

export default memo(DropdownComponent);