import React, { useEffect, useState } from "react";
import "../../assets/css/homepage.css"; // Import the CSS file
import img1 from "../../assets/images/home.webp"

const Home = () => {


  return (
    <div className="container-fluid p-0">
    
     

      {/* Content Section */}
      <section className="container py-5 content-section">
        <div className="row">
          <div className="col-md-6 mt-2 ">
            <h2>Welcome to Gramture</h2>
            <p>
            Gramture is an educational website that provides study materials for 9th, 10th, first-year, and second-year students. It offers subject-wise notes, essays, short stories, applications, letters, chapter summaries, and word meanings to help students in their educational journey. 
            </p>
            <p>
            The content is written in simple and easy-to-understand language, making it perfect for exam preparation and improving writing skills. With free access to high-quality educational resources, Gramture is a valuable platform for students looking to learn effectively and perform well in their studies.
            </p>
          </div>
          <div className="col-md-6">
            <img src={img1} alt="Gramture" className="img-fluid rounded" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
