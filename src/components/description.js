import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { getDocs, collection } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase';
import { FaReply } from 'react-icons/fa';
import "../assets/css/description.css"; 
import { addDoc, doc, updateDoc } from 'firebase/firestore';

export default function Description() {
  const { subCategory } = useParams(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [newReply, setNewReply] = useState('');
  const [replyingToIndex, setReplyingToIndex] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchComments();
  }, [subCategory]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireStore, 'topics'));
      const productList = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((product) => product.subCategory === subCategory);
      setProducts(productList);
      setLoading(false);
    } catch (error) {
      message.error('Failed to fetch products.');
      console.error(error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsRef = collection(fireStore, 'comments', subCategory, 'topicComments');
      const querySnapshot = await getDocs(commentsRef);
      const commentsList = querySnapshot.docs.map((doc) => doc.data());
      setComments(commentsList);
    } catch (error) {
      message.error('Failed to fetch comments.');
      console.error(error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment({
      ...newComment,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitComment = async () => {
    try {
      const docRef = await addDoc(collection(fireStore, 'comments', subCategory, 'topicComments'), newComment);
      setComments([...comments, { id: docRef.id, ...newComment }]);
      setNewComment({ name: '', email: '', comment: '' });
      message.success('Comment added successfully!');
    } catch (error) {
      message.error('Failed to add comment.');
      console.error(error);
    }
  };

  const handleReplyChange = (e) => {
    setNewReply(e.target.value);
  };

  const handleSubmitReply = async (commentIndex) => {
    if (newReply.trim()) {
      const updatedComments = [...comments];
      const commentRef = doc(fireStore, 'comments', subCategory, 'topicComments', comments[commentIndex].id);
      await updateDoc(commentRef, {
        replies: [...(comments[commentIndex].replies || []), newReply],
      });
      updatedComments[commentIndex].replies = [...(updatedComments[commentIndex].replies || []), newReply];
      setComments(updatedComments);
      setNewReply('');
      setReplyingToIndex(null);
    } else {
      message.warning('Please enter a reply.');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && window.location) {
      const url = window.location.href;
      if (navigator.share) {
        navigator.share({
          title: 'Check out this article!',
          url,
        }).catch((error) => {
          console.error('Error sharing:', error);
          copyLinkToClipboard(url);
        });
      } else {
        copyLinkToClipboard(url);
      }
    } else {
      message.error('Unable to get the current URL.');
      console.error('window.location is not available.');
    }
  };

  const copyLinkToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      message.success('Link copied to clipboard!');
    }).catch((error) => {
      message.error('Failed to copy the link.');
      console.error(error);
    });
  };

  // Function to render the button to open the file URL
  const renderFilePreview = (fileURL) => {
    // Ensure the fileURL is defined before attempting to render the button
    if (!fileURL) {
      return <p>No file URL available</p>; // Display a fallback message if no URL exists
    }

    return (
      <button
        onClick={() => window.open(fileURL, '_blank')} // Open file URL in a new tab
        style={{
          padding: '10px 20px',
          backgroundColor: '#0073e6',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        Open File
      </button>
    );
  };

  return (
    <div className="description-container" style={{ padding: '20px', marginTop: '45px' }}>
      {loading && (
        <div className="loader-overlay">
          <div className="loader-spinner"></div>
        </div>
      )}
      {products.length > 0 && (
        <>
          <h3 className="page-title" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem', fontWeight: 'bold', color: '#000' }}>
            {products[0].topic}
          </h3>

          {products.map((product, index) => (
            <article key={product.id} className="product-article" style={{ marginBottom: '30px' }}>
              <div className="product-description" style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '1.2rem', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>

              {/* Display file URLs with button to open */}
              {product.fileURL && product.fileURL.length > 0 && product.fileURL.map((file, fileIndex) => (
                <div key={fileIndex} style={{ marginBottom: '10px', textAlign: 'center' }}>
                  {renderFilePreview(file)} {/* Pass file to renderFilePreview */}
                </div>
              ))}
            </article>
          ))}

          <button
            onClick={handleShare}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FF0000',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
              width: '100%',
              fontSize: '16px',
            }}
          >
            Share this Article
          </button>

          <div className="comment-section" style={{ marginTop: '40px' }}>
            <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#000' }}>Leave a Comment</h3>
            <div className="comment-form" style={{ marginBottom: '30px' }}>
              <input
                type="text"
                name="name"
                value={newComment.name}
                onChange={handleCommentChange}
                placeholder="Your Name"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <input
                type="email"
                name="email"
                value={newComment.email}
                onChange={handleCommentChange}
                placeholder="Your Email"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <textarea
                name="comment"
                value={newComment.comment}
                onChange={handleCommentChange}
                placeholder="Your Comment"
                rows="5"
                style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
              />
              <button
                onClick={handleSubmitComment}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                Submit Comment
              </button>
            </div>

            {comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className="comment-item" style={{ marginBottom: '20px' }}>
                  <div className="comment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{comment.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaReply
                        onClick={() => setReplyingToIndex(index)}
                        style={{
                          cursor: 'pointer',
                          marginLeft: '10px',
                          color: '#000',
                        }}
                      />
                    </div>
                  </div>
                  <p>{comment.comment}</p>
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies" style={{ marginTop: '10px' }}>
                      {comment.replies.map((reply, idx) => (
                        <p key={idx} style={{ marginLeft: '20px', fontStyle: 'italic', color: '#555' }}>
                          {reply}
                        </p>
                      ))}
                    </div>
                  )}
                  {replyingToIndex === index && (
                    <div className="reply-form" style={{ marginTop: '10px' }}>
                      <textarea
                        value={newReply}
                        onChange={handleReplyChange}
                        placeholder="Write a reply..."
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '10px',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                        }}
                      />
                      <button
                        onClick={() => handleSubmitReply(index)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#000',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '5px',
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>No comments yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
