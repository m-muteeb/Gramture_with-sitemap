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
          <h1 className="text-xl mb-4 text-center mt-4">Gramture Study Platform</h1>
          <p className="lead text-muted">
            Gramture is an online educational hub that aims to provide authentic and useful material in the form of comprehensive notes, lectures, videos, MCQs, Critical Thinking Activities, SAT (Self Assessment Tests) for internal, external, or board exams to score good results and take positions in exams. We provide research based on important study material from the exam point of view.
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
      <Card className="card-custom  border-0 rounded-lg">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="h4 font-weight-bold text-danger">{dropdown.title}</h5>
          </div>

          {/* Displaying subcategories */}
          <div className="mt-3">
            {dropdown.content.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-3">
                {/* Subcategory is always visible */}
                <div
                  className="d-flex justify-content-between align-items-center"
                  style={{
                    cursor: 'pointer',
                    padding: '8px 0',
                    fontWeight: 'bold',  // Bold the subcategory text
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(index, categoryIndex); // Toggle the topics for this subcategory
                  }}
                >
                  <h5 className="h5 ">{category.subCategory}</h5>
                  {openCategory[`${index}-${categoryIndex}`] ? <BsChevronUp /> : <BsChevronDown />}
                </div>

                {/* Dropdown for the topics under the subcategory */}
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
                              scrollToTopic(topicId); // Scroll to the topic section when clicked
                            }}
                            style={{
                              textDecoration: 'none',
                              color: '#4CAF50', // Light green color for links
                              fontSize: '1rem',
                              fontWeight: '500', // Bold the link text
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.color = '#388E3C'; // Darker green on hover
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.color = '#4CAF50'; // Return to the original color
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
      <h1 className=" text-xl mb-4 text-center mt-4">Why Grmature?</h1>
 {/* Static Exam Preparation Section (Always Visible) */}
 <Row className="mt-5">
 {/* Card 1 */}
 <Col xs={12} sm={6} md={6} lg={6}>
 
        <Card className="card-elegant">
          <div className="card-img-container">
          
            <div className="img-overlay"></div>
          </div>
          <Card.Body>
            <Card.Title>Important Questions & Answers</Card.Title>
            <Card.Text>
              Finding the right study material can be difficult, but Gramture provides well-structured notes for different subjects. These notes help students understand difficult topics quickly. It elucidates key points with textual and real-life usage.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Card 2 */}
      <Col xs={12} sm={6} md={6} lg={6}>
      
        <Card className="card-elegant">
          <div className="card-img-container">
           
            <div className="img-overlay"></div>
          </div>
          <Card.Body>
            <Card.Title>Easy-to-Understand Language</Card.Title>
            <Card.Text>
            The content on Gramture is carefully crafted and written in simple, easy-to-understand language, ensuring that every student, regardless of their educational background or language proficiency, can grasp the material without any difficulty. 
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Card 3 */}
      <Col xs={12} sm={6} md={6} lg={6}>
        <Card className="card-elegant">
          <div className="card-img-container">
          
            <div className="img-overlay"></div>
          </div>
          <Card.Body>
            <Card.Title>Best for Exam Preparation</Card.Title>
            <Card.Text>
              During exams, students need quick revision notes. Gramture provides to-the-point summaries, short questions, exercises, MCQs, which help students prepare well for their exams.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>

      {/* Card 4 */}
      <Col xs={12} sm={6} md={6} lg={6}>
        <Card className="card-elegant">
          <div className="card-img-container">
          
            <div className="img-overlay"></div>
          </div>
          <Card.Body>
            <Card.Title>Free Access to Study Materials</Card.Title>
            <Card.Text>
              One of the best things about Gramture is that students can access it for free. No need to buy expensive books or login access – just visit the website and find everything you need.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
<h1 className=" text-xl mb-4 text-center mt-4">How Gramture Helps in Exam Preparation?</h1>

<p className="text-center text-gray-700 mb-8" style={{ fontSize: '1.1rem' }}>
  Exams can be stressful, but by studying the right study materials, students can prepare well. Gramture helps students in their exams in the following ways:
</p>

<div className="space-y-6">
  {/* Card 1: Important Questions & Answers */}
  <div className="bg-light p-6 rounded-lg shadow-sm border-l-4 border-primary">
    <h5 className="text-xl font-semibold text-dark mb-3">a) Important Questions & Answers</h5>
    <p className="text-gray-600" style={{ fontSize: '1rem' }}>
      Gramture provides chapterwise questions and answers to all the chapters of matric, intermediate or university books with Urdu translation, which is helpful for students.
    </p>
  </div>

  {/* Card 2: Quick Revision Notes */}
  <div className="bg-light p-6 rounded-lg shadow-sm border-l-4 border-primary">
    <h5 className="text-xl font-semibold text-dark mb-3">b) Quick Revision Notes</h5>
    <p className="text-gray-600" style={{ fontSize: '1rem' }}>
      Before exams, students need quick revision. Gramture’s short notes and summaries make it easy to revise everything in a short time.
    </p>
  </div>

  {/* Card 3: Model Papers & Past Papers */}
  <div className="bg-light p-6 rounded-lg shadow-sm border-l-4 border-primary">
    <h5 className="text-xl font-semibold text-dark mb-3">c) Model Papers & Past Papers</h5>
    <p className="text-gray-600" style={{ fontSize: '1rem' }}>
      Practicing past papers is one of the best ways to prepare for exams. Gramture offers model papers and previous years’ papers to help students get an idea of exam patterns.
    </p>
  </div>

  {/* Card 4: Grammar & Writing Skills */}
  <div className="bg-light p-6 rounded-lg shadow-sm border-l-4 border-primary">
    <h5 className="text-xl font-semibold text-dark mb-3">d) Grammar & Writing Skills</h5>
    <p className="text-gray-600" style={{ fontSize: '1rem' }}>
      Grammar is the base of English. Without understanding applied grammar, we can’t write well. Gramture teaches students essay writing, application, and formal letter writing according to the English rules.
    </p>
  </div>
</div>

</Row>
     </Container>
  );
};

export default memo(DropdownComponent);
