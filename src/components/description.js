import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, message, Skeleton } from "antd";
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { fireStore } from "../firebase/firebase";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../assets/css/description.css";
import CommentSection from "./CommentSection";
import ShareArticle from "./ShareArticle";
import { Helmet } from "react-helmet-async";
import CertificateGenerator from "./CertificateGenerator";

export default function Description() {
  const { subCategory, topicId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mcqs, setMcqs] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [answerFeedback, setAnswerFeedback] = useState({});
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [completedMcqs, setCompletedMcqs] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showReviewSection, setShowReviewSection] = useState(false); // ✅ New state
  const [allTopics, setAllTopics] = useState([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Firestore collections reference
        const topicsRef = collection(fireStore, "topics");

        // Firestore query for product based on subCategory and topicId
        const productQuery = query(
          topicsRef,
          where("subCategory", "==", subCategory),
          where("id", "==", topicId)
        );

        // Firestore query for all topics based on subCategory with ordering by timestamp
        const allTopicsQuery = query(
          topicsRef,
          where("subCategory", "==", subCategory),
          orderBy("timestamp") // Ensure this field is indexed
        );

        // Fetch products and topics in parallel
        const [productSnapshot, allTopicsSnapshot] = await Promise.all([
          getDocs(productQuery),
          getDocs(allTopicsQuery),
        ]);

        // Map the data from snapshots
        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const topicsList = allTopicsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Set the state with the fetched data
        setProducts(productList);
        setMcqs(productList[0]?.mcqs || []);
        setAllTopics(topicsList);

        // Determine the current topic index
        const currentTopicIdx = topicsList.findIndex(
          (topic) => topic.id === topicId
        );
        setCurrentTopicIndex(currentTopicIdx);
      } catch (error) {
        message.error("Error fetching data");
        console.error("Firebase fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [subCategory, topicId]);

  const navigateToTopic = (direction) => {
    if (currentTopicIndex !== null) {
      const newTopicIndex = currentTopicIndex + direction;
      if (newTopicIndex >= 0 && newTopicIndex < allTopics.length) {
        const newTopicId = allTopics[newTopicIndex].id;
        navigate(`/description/${subCategory}/${newTopicId}`);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleAnswerChange = (event) => {
    const { value } = event.target;
    setSelectedAnswer({
      ...selectedAnswer,
      [currentMcqIndex]: value,
    });
  };

  const handleNextQuestion = () => {
    const currentMcq = mcqs[currentMcqIndex];
    const selected = selectedAnswer[currentMcqIndex];

    if (selected === undefined) {
      message.error("Please select an answer before moving to the next question.");
      return;
    }

    const feedback = selected === currentMcq.correctAnswer ? "Correct!" : "Incorrect.";
    setAnswerFeedback({
      ...answerFeedback,
      [currentMcqIndex]: feedback,
    });

    if (currentMcqIndex + 1 < mcqs.length) {
      setCurrentMcqIndex(currentMcqIndex + 1);
    } else {
      if (!userName) {
        const name = prompt("Please enter your name: ");
        setUserName(name || "Guest");
      }
      setShowResults(true);
    }
  };

  const calculateResults = () => {
    let correctAnswers = 0;
    mcqs.forEach((mcq, index) => {
      if (selectedAnswer[index] === mcq.correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const handleRetakeTest = () => {
    setSelectedAnswer({});
    setAnswerFeedback({});
    setCurrentMcqIndex(0);
    setCompletedMcqs([]);
    setShowResults(false);
    setShowReviewSection(false); // Reset review visibility
  };

  const getNextTopic = () => {
    if (currentTopicIndex === null || currentTopicIndex + 1 >= allTopics.length)
      return null;
    return allTopics[currentTopicIndex + 1];
  };

  const getPrevTopic = () => {
    if (currentTopicIndex === null || currentTopicIndex - 1 < 0) return null;
    return allTopics[currentTopicIndex - 1];
  };

  const extractTextFromHTML = (htmlString) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="description-container">
      {!loading && products.length > 0 && (
        <Helmet>
          <title>Gramture - {products[0].topic}</title>
          <meta
            name="description"
            content={extractTextFromHTML(products[0].description).substring(0, 150)}
          />
        </Helmet>
      )}

      {loading ? (
        <div className="loader-overlay">
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ) : (
        <>
          {products.length > 0 && (
            <>
              <h1
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  marginLeft: "10px",
                  textAlign: "center",
                }}
              >
                {products[0].topic}
              </h1>

              {products.map((product) => (
                <article key={product.id} className="product-article">
                  <div className="product-description">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  </div>
                </article>
              ))}

              {mcqs.length > 0 && (
                <div className="mcq-section">
                  {showResults ? (
                    <div className="result-summary">
                      <button
                        onClick={handleRetakeTest}
                        style={{
                          padding: "10px 20px",
                          fontSize: "16px",
                          backgroundColor: "#FF9800",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                          marginRight: "10px",
                        }}
                      >
                        Retake Test
                      </button>

                      {!showReviewSection ? (
                        <button
                          onClick={() => setShowReviewSection(true)}
                          style={{
                            padding: "10px 20px",
                            fontSize: "16px",
                            backgroundColor: "#2196F3",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Review Your Answers
                        </button>
                      ) : (
                        <div className="review-section" style={{ marginTop: "30px", marginBottom: "30px" }}>
                          <h2 style={{ textAlign: "center" }}>Review Your Answers</h2>
                          {mcqs.map((mcq, index) => {
                            const userAnswer = selectedAnswer[index];
                            const isCorrect = userAnswer === mcq.correctAnswer;

                            return (
                              <div
                                key={index}
                                className="review-question"
                                style={{
                                  marginBottom: "20px",
                                  padding: "15px",
                                  border: "1px solid #ccc",
                                  borderRadius: "8px",
                                  backgroundColor: isCorrect ? "#e6ffed" : "#ffe6e6",
                                }}
                              >
                                <h4>{index + 1}. {mcq.question}</h4>
                                <p>
                                  <strong>Your Answer:</strong>{" "}
                                  <span style={{ color: isCorrect ? "green" : "red" }}>
                                    {userAnswer || "Not Answered"}
                                  </span>
                                </p>
                                {!isCorrect && (
                                  <p>
                                    <strong>Correct Answer:</strong>{" "}
                                    <span style={{ color: "green" }}>{mcq.correctAnswer}</span>
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="mcq">
                        <p>
                          Question {currentMcqIndex + 1}: {mcqs[currentMcqIndex]?.question}
                        </p>
                        {mcqs[currentMcqIndex]?.options.map((option, idx) => (
                          <div key={idx}>
                            <input
                              type="radio"
                              name={`question-${currentMcqIndex}`}
                              value={option}
                              onChange={handleAnswerChange}
                            />
                            {option}
                          </div>
                        ))}
                      </div>

                      <button onClick={handleNextQuestion}>Next Question</button>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div className="topic-navigation">
            <button
              disabled={!getPrevTopic()}
              onClick={() => navigateToTopic(-1)}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginTop: "20px",
                marginRight: "10px",
              }}
            >
              <FaChevronLeft />
              Previous Topic
            </button>

            <button
              disabled={!getNextTopic()}
              onClick={() => navigateToTopic(1)}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                marginTop: "20px",
              }}
            >
              Next Topic
              <FaChevronRight />
            </button>
          </div>

          <CommentSection />
          <ShareArticle />
          <CertificateGenerator />
        </>
      )}
    </div>
  );
}
