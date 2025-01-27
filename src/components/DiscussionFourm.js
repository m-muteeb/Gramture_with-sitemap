import React, { useState } from 'react';
import { FaImage } from 'react-icons/fa'; // Import React Icons
import '../assets/css/discussion-forum.css'; // Import CSS  file

const DiscussionForum = () => {
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);

  const submitQuestion = () => {
    if (question && name && email) {
      const newQuestion = {
        id: Date.now().toString(),
        question,
        name,
        email,
        replies: [],
      };
      setQuestions([...questions, newQuestion]);
      setQuestion('');
      setName('');
      setEmail('');
    } else {
      alert('Please fill in all fields');
    }
  };

  const submitReply = (questionId, reply) => {
    const updatedQuestions = questions.map((item) => {
      if (item.id === questionId) {
        item.replies.push(reply);
      }
      return item;
    });
    setQuestions(updatedQuestions);
  };

  return (
    <div className="discussion-forum">
      <h1 className="forum-title">Discussion Forum</h1>

      {/* Ask Question Section */}
      <div className="ask-section">
        <input
          type="text"
          className="input"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="input"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className="input question-input"
          placeholder="Ask your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        {/* Removed image picker */}
        <div className="image-picker">
          <FaImage size={24} color="gray" />
          <span>Upload Image (Removed)</span>
        </div>

        <button className="submit-btn" onClick={submitQuestion}>
          Post Question
        </button>
      </div>

      {/* Questions & Replies Section */}
      <div className="questions-list">
        {questions.map((item) => (
          <div key={item.id} className="question-card">
            <h2>{item.name} asks:</h2>
            <p>{item.question}</p>
            <div className="replies-container">
              <h3>Replies:</h3>
              {item.replies.map((reply, index) => (
                <div key={index} className="reply-card">
                  <p>{reply.reply}</p>
                </div>
              ))}
              <textarea
                className="reply-input"
                placeholder="Write a reply..."
                onBlur={(e) => {
                  const replyText = e.target.value;
                  if (replyText) {
                    submitReply(item.id, {
                      id: Date.now().toString(),
                      reply: replyText,
                    });
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionForum;
