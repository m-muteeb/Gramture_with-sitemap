import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import { getDocs, collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { getDownloadURL, ref, listAll } from 'firebase/storage';
import { fireStore, storage } from '../firebase/firebase';
import { FaReply } from 'react-icons/fa';  // Removed the like icon
import  "../assets/css/description.css"; // Added CSS file

export default function Description() {
  const { subCategory } = useParams();
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({
    name: '',
    email: '',
    comment: '',
  });
  const [newReply, setNewReply] = useState('');  // Added state for new reply
  const [replyingToIndex, setReplyingToIndex] = useState(null); // Track which comment we are replying to

  useEffect(() => {
    fetchProducts();
    fetchFiles();
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

  const fetchFiles = async () => {
    try {
      const fileRef = ref(storage, `files/${subCategory}`);
      const fileList = await listAll(fileRef);
      const fileUrls = await Promise.all(
        fileList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return { name: item.name, url };
        })
      );
      setFiles(fileUrls);
    } catch (error) {
      message.error('Failed to fetch files.');
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
    setNewReply(e.target.value); // Update reply state
  };

  const handleSubmitReply = async (commentIndex) => {
    if (newReply.trim()) {
      const updatedComments = [...comments];
      const commentRef = doc(fireStore, 'comments', subCategory, 'topicComments', comments[commentIndex].id);
      // Add reply to the comment in Firestore
      await updateDoc(commentRef, {
        replies: [...(comments[commentIndex].replies || []), newReply],
      });
      updatedComments[commentIndex].replies = [...(updatedComments[commentIndex].replies || []), newReply];
      setComments(updatedComments);
      setNewReply(''); // Clear the reply input
      setReplyingToIndex(null); // Reset replying state
    } else {
      message.warning('Please enter a reply.');
    }
  };

  const renderFile = (fileUrl) => {
    if (fileUrl.includes('drive.google.com')) {
      const fileId = fileUrl.split('/d/')[1].split('/')[0];
      return (
        <div style={{ width: '100%', height: 'auto', textAlign: 'center' }}>
          <a
            href={`https://drive.google.com/file/d/${fileId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#0073e6',
              padding: '10px 20px',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Open Google Drive File
          </a>
        </div>
      );
    }

    if (fileUrl.includes('.pdf')) {
      return (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              backgroundColor: '#ff5722',
              padding: '10px 20px',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Open PDF File
          </a>
        </div>
      );
    }

    if (fileUrl.includes('.jpg') || fileUrl.includes('.jpeg') || fileUrl.includes('.png')) {
      return (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <img
            src={fileUrl}
            alt="File"
            style={{
              width: '100%',
              height: 'auto',
              maxWidth: '90%', // Make sure it's responsive and adapts to the screen size
              border: 'none',
              borderRadius: '5px',
              objectFit: 'contain',
              margin: '0 auto',
            }}
          />
        </div>
      );
    }

    return (
      <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>
        No preview available for this file.
      </p>
    );
  };

  return (
    <div className="description-container" style={{ padding: '20px' }}>
      <h3 className="page-title" style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem', fontWeight: 'bold', color: '#000' }}>
        {subCategory}
      </h3>
      {loading ? (
        <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 2s linear infinite' }}></div>
        </div>
      ) : (
        <>
          {products.length > 0 ? (
            products.map((product, index) => (
              <article key={product.id} className="product-article" style={{ marginBottom: '30px' }}>
                <h4 className="product-title" style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF0000' }}>
                  {index + 1}. {product.topic}
                </h4>

                <div className="product-description" style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '1.2rem', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: product.description }} />
                </div>

                {product.fileURL && renderFile(product.fileURL)}
              </article>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#888', fontSize: '1.2rem' }}>No products found for this category.</p>
          )}
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
