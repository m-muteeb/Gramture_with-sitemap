import React from "react";
import "../../assets/css/homepage.css"; // Import the CSS file
import img1 from "../../assets/images/home.webp";

const Home = () => {
  return (
    <main className="container-fluid p-0">
      {/* Preload LCP Image */}
      <link rel="preload" as="image" href={img1} />

      {/* Content Section */}
      <section className="container py-5 content-section">
        <div className="row">
          <div className="col-md-6 mt-2">
            <h1>Welcome to Gramture</h1>
            <p>
              Gramture is an educational website that provides study materials
              for 9th, 10th, first-year, and second-year students.
            </p>
            <p>
              The content is written in simple and easy-to-understand language,
              making it perfect for exam preparation and improving writing
              skills.
            </p>
            <p>
              With free access to high-quality educational resources,
              Gramture is a valuable platform for students looking to learn
              effectively and perform well in their studies.
            </p>
          </div>
          <div className="col-md-6">
            <img
              src={img1}
              alt="Gramture - Your Study Companion"
              className="img-fluid rounded"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
